---
templateKey: blog-post
url: 20220517_aws-cdk-apigateway-custom-domain
title: 【AWS】CDKでAPI Gatewayを作ってカスタムドメインを被せる
date: 2022-05-17T19:00:00.000Z
description: |-
  最近CDKでAWSのリソースを構築するのにハマっています。その中でAPI Gatewayを作って、そこにカスタムドメインを被せる方法で若干ハマったので記事にしたいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - apigateway
  - route53
  - acm
---


## 概要
今回は`CDK`で`API Gateway`を作ってカスタムドメインの設定をするところまでに焦点をあてます。
カスタムドメインとは、あらかじめ取得しておいたドメインや証明書を使って、本来ならランダムで割り当てられる`API Gateway`のドメインを自由に設定できる機能です。

- 参考：[AWS | REST API のカスタムドメイン名を設定する](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-custom-domains.html)

手動でポチポチやると簡単ですが、`CDK`で構築するとなると登場要素が多くて少し面倒です。

## 前提
以下に前提条件を記載します。ドメイン取得や証明書取得については全て`AWS`内で行っている(`Route53`と`ACM`を使っている)ものとします。
従ってそれらを利用可能なリージョン(例えば`us-east-1`とか)で実行する必要があります。
- ドメイン取得済み
  - ホストゾーンのIDと名前を把握していること
- 証明書取得済み
  - 証明書の`ARN`を把握していること

## コンソールから手動でカスタムドメインを設定する際の作業手順
`CDK`のコードを見る前に、手動でカスタムドメインを設定する場合の手順について説明します。

- `API Gateway`の画面からカスタムドメインを作成
  - この時点で「どんなドメインか」と「証明書は何を使うか」を指定します
  - 従って、あらかじめ取得したドメインと証明書を用いて設定します
  - `API Gateway`は同一API上に「ステージ」としていくつか環境を持てるので、「このドメインはこのステージ」的な設定(APIマッピング)をすることもできます
- `Route53`の対象ドメインのホストゾーン(DNS)にエイリアスレコードを追加
  - エイリアスレコードは「ドメイン対AWSリソース」を表現するRoute53専用のレコード種別です(見かけ上は普通のAレコード)
  - ここで、「ドメインと`API Gateway`側で指定したカスタムドメイン」を紐付けます

## 実際のコード
実際のコードは下記のようになります。

```ts
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export class SampleStack extends cdk.Stack {
    // ドメイン
    private DOMAIN = 'nekoniki.com';
    // Route53のホストゾーンID
    private HOSTED_ZONE_ID = 'XXXXXXXXXXXXXXXXXXX';
    // Route53のホストゾーン名
    private HOSTED_ZONE_NAME = 'nekoniki.com.';
    // 取得した証明書(ACM)のARN
    private ACM_ARN = 'arn:XXXXXXXXXXXXXXXXXXXXXXXXXX';

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // プレフィックス
        // このスタックを複数環境に分けて走らせたい場合は、このパラメータを引数として受け取ったりするように作り替えるとGood
        const prefix = 'AnyPrefix';

        // API Gatewayの作成
        const api = new apigateway.RestApi(this, `${prefix}Api`, { 
            // 諸々の設定
            cloudWatchRole: false, 
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
                statusCode: 200,
            }, 
        });

        // カスタムドメインの設定
        const domain = api.addDomainName(`${prefix}ApiDomain`, {
            // ドメインは"api.nekoniki.com"とする
            domainName: `api.${this.DOMAIN}`,
            // ARNから証明書を取得して紐づける
            certificate: acm.Certificate.fromCertificateArn(this, `${prefix}Cetrificate`, this.ACM_ARN),
            // TLS1.2
            securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
            // エンドポイント種別はリージョナルに
            endpointType: apigateway.EndpointType.REGIONAL,
        });

        // Route53にドメイン→API GatewayのカスタムドメインのAレコードを作成
        new route53.ARecord(this, `${prefix}ApiGatewayARecord`, {
            // ホストゾーン情報(IDと名前から逆引きする)
            zone: route53.HostedZone.fromHostedZoneAttributes(this, `${prefix}HostedZone`, {
                hostedZoneId: this.HOSTED_ZONE_ID,
                zoneName: this.HOSTED_ZONE_NAME,
            }),
            // レコード名はカスタムドメインを指定
            recordName: `api.${this.DOMAIN}`,
            // ターゲットは先ほど作成したAPI Gatewayのカスタムドメイン本体
            target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(domain)),
        });
    }
}
```

先ほど箇条書きで書いた手順をコードに起こすとそれなりの量になるのが分かります。

## まとめ
今回は`CDK`を使って`API Gateway`のカスタムドメインを作り、それに付随する`DNS`のレコード設定等々の作業をまとめたものを紹介しました。
`CloudFront`などもそうですが、証明書やドメイン周りはどうしても事前に取得した情報を使い回す形が自然になるので、今回のようなコード形態になるかなと思います。

最近、「CDKで○◯を作る方法をレクチャーしてほしい」といった要望をいただくことがちらほらあるのですが、引き続きお問い合わせのページから募集しておりますので、お気軽にご連絡ください。
今回の内容が役立ちましたら幸いです。

## 参考
- [AWS | REST API のカスタムドメイン名を設定する](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-custom-domains.html)
- [DeveloperIO | AWS CDKでCognito認証されたAPI Gateway(HTTP API)を構築する](https://dev.classmethod.jp/articles/aws-cdk-apigw-cognito/)