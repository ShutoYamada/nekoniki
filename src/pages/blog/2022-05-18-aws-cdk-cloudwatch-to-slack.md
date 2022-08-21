---
templateKey: blog-post
url: 20220518_aws-cdk-cloudwatch-to-slack
title: 【AWS】CDKでCloudWatchの閾値を超えたらSlack通知するようにする
date: 2022-05-18T19:00:00.000Z
description: |-
  今回はCDKで、CloudWatchの任意のメトリクスの閾値を超えた場合にSlackに自動通知するような仕組みの構築方法について紹介していきます。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - apigateway
  - cloudwatch
  - sns
  - chatbot
  - slack
---


## 概要
`AWS`におけるアプリケーションの状態監視といえば`CloudWatch`ですが、そこから更に「特定の閾値を超えた場合に◯◯する」といったような設定をすることができます。
所謂`CloudWatch`のアラーム機能です。

- 参考：[AWS | Amazon CloudWatch でのアラームの使用](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

今回はアラームを起点に、`SNS`のトピックへの通知を行い、さらにそこから`Chatbot`経由で`Slack`に通知するまでの仕組みを`CDK`で構築していきます。

## 前提
`CDK`なので大部分はコード化できるのですが、下記の手順については`CDK`のコードの範疇では扱いません。
従って、下記については手動で行うようにしましょう。

- `Slack`通知用のワークスペースとチャンネルの作成
  - `CDK`上で必要になってくるのはチャンネルのIDですので、どこかに控えておきましょう
- `Chatbot`クライアントの作成
  - コンソールから`Chatbot`を開き【チャットクライアント】を【Slack】で作成します
  - このタイミングで通知先の`Slack`ワークスペースへの認証を求められます
  - クライアント作成後に発番されるワークスペースIDが後の手順で必要なので、こちらも控えておきましょう

## 実際のコード
実際のコードは下記のようになります。

```ts
import * as cdk from 'aws-cdk-lib';
import * as sns from "aws-cdk-lib/aws-sns";
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as apigaetway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class HogeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 事前に作成したAPI Gatewayの参照
    let api: apigaetway.RestApi;

    const slackWorkspaceId = '【ワークスペースID】';
    const slackChannelId = '【SlackのチャンネルID】'

    // SNSのトピックを作成する
    const errorTopic = new sns.Topic(this, `ErrorTopic`, {
      displayName: `ErrorTopic`,
      topicName: `ErrorTopic`
    });

    // Chatbot設定の作成
    const cb = new chatbot.SlackChannelConfiguration(this, `SlackChannelConfiguration`, {
        // 設定名
        slackChannelConfigurationName: `SlackChannelConfiguration`,
        // ワークスペースID
        slackWorkspaceId: slackWorkspaceId,
        // チャンネルID
        slackChannelId: slackChannelId,
        // 紐づけるSNSトピック一覧
        notificationTopics: [errorTopic] 
    });

    // CloudWatchのアラームを作成
    const apiServerErrorAlarm = new cloudwatch.Alarm(this, `ApiServerErrorAlarm`, {
        // 閾値
        threshold: 5,
        // 計測点(5分に1回)
        evaluationPeriods: 1,
        // メトリクス(ここではAPIの5XXエラーの回数を指定)
        metric: api.metricServerError(),
    });

    // アラームの条件を満たした場合のアクション設定(SNSトピックへの通知を行うよう設定)
    apiServerErrorAlarm.addAlarmAction(new cwActions.SnsAction(errorTopic));
  }
}
```

コメントに書いてある通りですが、流れとして「アラームの条件を満たす」→「トピックへの通知が行われる」→「チャットボットからSlackに通知がいく」というものになります。

## まとめ
今回は`CDK`を使って`API Gateway`のサーバエラーメトリクスを`CloudWatch`のアラームとして指定し、それを満たした場合に`SNS`と`Chatbot`を経由して最終的に`Slack`に通知される仕組みの構築を紹介しました。

本来はここに`EC2`や`RDS`などのメトリクスも絡めた状態監視を行っていくかと思います。
ただ、全体的な宣言は今回の内容のもので殆どなので今回は割愛します。

今回の内容が役立ちましたら、幸いです。

## 参考
- [AWS | Chatbot](https://aws.amazon.com/jp/chatbot/)
- [AWS | Amazon CloudWatch でのアラームの使用](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)