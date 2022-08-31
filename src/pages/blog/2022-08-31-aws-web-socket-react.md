---
templateKey: blog-post
url: 20220831_aws-web-socket-react
title: 【AWS】API GatewayでWebSocketを構築し、Reactと導通する
date: 2022-08-31T19:00:00.000Z
description: |-
  今回はAPI GatewayでWebSocketを構築して、簡単なLambdaとの紐付けを行います。
  さらにReactアプリケーションからWebSocketへの接続を行い、導通テストをしてみたいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - apigateway
  - react
  - lambda
  - dynamodb
---

## 前提
下地として、下記記事を参考にしています。

- [DeveloperIO | CDK + API Gateway + Web Socket を使ってみた](https://dev.classmethod.jp/articles/cdk-api-gateway-web-socket/)

`WebSocket`に関する部分はほとんど引用になりますが、作成した`WebSocket`に対して導通を行う箇所を`wscat`ではなく`React`アプリケーションから接続する形になります。

ざっくり説明すると、
- `DynamoDb`でコネクションIDを管理
- `Web`

## WebSocket用のLambdaを作成

今回使用するLambdaは3種類あります。
2種類は`API Gateway`で作成した`WebSocket`の`$connect`と`$disconnect`のルーティングに対応した`Lambda`です。

残りの1つは、`WebSocket`に接続した`React`アプリケーションに対してメッセージを送信する用の`Lambda`です。これに関しては実際に作りたいアプリの形に合わせて柔軟に内容を変えていくかと思います。

ここでは先に`$connect`と`$disconnect`の`Labmda`を作成していきます。

### $connect

```javascript:title=lambda/connect/index.js
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  // DynamoDBのクライアントを定義
  const client = new AWS.DynamoDB.DocumentClient();

  // DynamoDBテーブルに保存する
  const result = await client
    .put({
      TableName: process.env.TABLE_NAME || "",
      Item: {
        connectionId: event.requestContext.connectionId,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: "onConnect.",
  };
};
```

### $disconnect

```javascript:title=lambda/disconnect/index.js
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  // DynamoDBのクライアントを定義
  const client = new AWS.DynamoDB.DocumentClient();

  // DynamoDBテーブルから削除する
  await client
    .delete({
      TableName: process.env.TABLE_NAME || "",
      Key: { [process.env.TABLE_KEY || ""]: event.requestContext.connectionId },
    })
    .promise();

  return {
    statusCode: 200,
    body: "onDisconnect.",
  };
};
```

## CDK

続いて、先ほどの`Lambda`を用いて`API Gateway`や`DynamoDB`を構築していきます。
`CDK`を見ていきましょう。

```ts
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class TestStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Lambdaに割り当てるロール
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      roleName: 'lambda-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
              'service-role/AWSLambdaBasicExecutionRole'
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonDynamoDBFullAccess'
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonAPIGatewayInvokeFullAccess'
          ),
      ],
    });

    // DynamoDBのテーブルを作成
    const webSocketConnection = new dynamodb.Table(this, 'WebSocketConnection', {
      partitionKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'webSocketConnection',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // WebSocketのAPI Gatewayを構築
    const api = new apigateway2.CfnApi(this, 'Api', {
      name: 'WebSocketApi',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });

    // $connectルート用のLambda
    const connect = new lambda.Function(this, 'connectLambda', {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset('lambda/connect'),
        handler: 'index.js',
        role: lambdaRole,
        environment: {
            TABLE_NAME: 'webSocketConnection'
        },
        timeout: cdk.Duration.minutes(1),
    });

    // $disconnect用のLambda
    const disconnect = new lambda.Function(this, 'disconnectLambda', {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset('lambda/disconnect'),
        handler: 'index.js',
        role: lambdaRole,
        environment: {
            TABLE_NAME: 'webSocketConnection',
            TABLE_KEY: 'connectionId'
        },
        timeout: cdk.Duration.minutes(1),
    });

    // API GatewayのInregration用のロール・ポリシー
    const integrationPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [connectLambda.functionArn, disConnectLambda.functionArn],
      actions: ['lambda:InvokeFunction'],
    });
    const integrationRole = new iam.Role(this, `integration-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    })
    integrationRole.addToPolicy(integrationPolicy)

    // APIにIntegrationを追加(=Lambdaと紐付け)
    const integrationConnect = new apigateway2.CfnIntegration(this, `connect-lambda-integration`, {
      apiId: api.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${connect.functionArn}/invocations`,
      credentialsArn: integrationRole.roleArn,
    });
    const integrationDisconnect = new apigateway2.CfnIntegration(this, `disconnect-lambda-integration`, {
      apiId: api.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${disconnect.functionArn}/invocations`,
      credentialsArn: integrationRole.roleArn,
    });

    // ルートの作成
    const routeConnect = new apigateway2.CfnRoute(this, `connect-route`, {
      apiId: api.ref,
      routeKey: "$connect",
      authorizationType: 'NONE',
      target: 'integrations/' + integrationConnect.ref,
    });
    const routeDisconnect = new apigateway2.CfnRoute(this, `disconnect-route`, {
      apiId: api.ref,
      routeKey: "$disconnect",
      authorizationType: 'NONE',
      target: 'integrations/' + integrationDisconnect.ref,
    });
  }
}
```

これを実行することで、`AWS`にコネクション管理用の`DynamoDB`と、`API Gateway`で`WebSocket`が構築できるかと思います。

後で使用するので、作成した`API Gateway`の`URL`は控えておきましょう。

## React側の実装
仮のフロントエンドとして`React`を用います。
`WebSocket`との通信には[WebSocket API](https://developer.mozilla.org/ja/docs/Web/API/WebSocket)を利用するため、新たにライブラリは使わないです。

基本は`useEffect`内で`WebSocket`を用いて通信を管理し、受信したメッセージを画面に表示しています。

```ts:App.tsx
import { useEffect, useState } from "react";

const App = () => {
    const [status, setStatus] = useState<string>("none");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // WebSocketと接続
        const socket = new WebSocket(
            "wss://{WebSocket API URL}"
        );

        // 接続時の処理
        socket.addEventListener("open", (event) => {
            setStatus("connected");
        });
        // 切断時の処理
        socket.addEventListener("close", (event) => {
            setStatus("closed");
        });
        // WebSocketからメッセージ受信時処理
        socket.addEventListener("message", (event) => {
            setMessages((current) => [...current, event.data]);
        });
        return () => {
            // アンマウント時に接続を切断
            socket.close();
        };
    }, []);

    return (
        <>
            <p>ConnectionStatus:{status}</p>
            <ul>
            {messages.map((msg) => {
                return (
                    <li>{msg}</li>
                )
            })}
            </ul>
        </>
    )
}
```

## メッセージを送るLambdaを作成
上記の`React`のソースを起動することで、`WebSocket`との通信は確立できるかと思います。
`DynamoDB`のテーブル内を確認してみると、`connectionId`が格納されており、フロントエンド側を止めると`connectionId`が消えるかと思えていれば成功です。

今度は接続しているアプリケーションに対してメッセージを送る`Lambda`を作ります。
下記の`Lambda`を作って手動で実行してみましょう。
※ロールは先ほどの`CDK`で作成したロールを使います。

```js
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const endpoint =
    "https:{Web Socket URL}";

  const apiGateway = new AWS.ApiGatewayManagementApi({ endpoint });
  const client = new AWS.DynamoDB.DocumentClient();

  // DBからコネクションIDを取得
  const result = await client
    .scan({ TableName: process.env.TABLE_NAME || "" })
    .promise();

  for (const data of result.Items ?? []) {
    const params = {
      Data: "テスト",
      ConnectionId: data.connectionId,
    };

    try {
      await apiGateway.postToConnection(params).promise();
    } catch (err) {
      // 対象が既に切断していたら削除する
      if (err.statusCode === 410) {
        await client
          .delete({
            TableName: process.env.TABLE_NAME || "",
            Key: { [process.env.TABLE_KEY || ""]: data.connectionId },
          })
          .promise();
      }
    }
  }

  return {
    statusCode: 200,
    body: "onDisconnect.",
  };
};
```

`React`側でメッセージを受信して、それが画面に反映されたかと思います。
`postToConnection`に渡す内容を変えることで、フロントエンドに通達するメッセージの内容を変えることができます。

## まとめ
今回は`API Gateway`を使って簡単な`WebSocket`を作成し、`React`アプリケーションから通信を行うサンプルについて紹介しました。
ここに色々と肉付けしていくことで、例えばチャットアプリや掲示板のようにリアルタイムで情報をやり取りするような仕組みを構築できるかと思います。

今回の内容が役立ちましたら幸いです。

## 参考
- [DeveloperIO | CDK + API Gateway + Web Socket を使ってみた](https://dev.classmethod.jp/articles/cdk-api-gateway-web-socket/)