---
templateKey: blog-post
url: 20220601_aws-datadog
title: 【AWS】Datadogとの連携方法メモ
date: 2022-06-01T19:00:00.000Z
description: |-
  今回はAWSをDatadogを連携させたので、その際の手順についてメモを兼ねて記事にしたいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - datadog
---


## 概要
`AWS`で作成したアプリケーションのログ管理といえば`CloudWatch`かと思います。
`AWS`上のリソースの動作ログを追うという意味では十分なのですが、如何せん表記がわかりにくい箇所もあり、何かしらダッシュボードのようなものが欲しいと感じていました。

そこで今回は`Datadog`と連携させることで、`API Gateway`で発生しているエラー等を分かりやすくしたいと思います。

## Datadogとは
- [Datadog](https://www.datadoghq.com/ja/)

`Datadog`はサーバ監視・分析のクラウドサービスです。
単純な死活監視から細かなログ分析・通知まで手広く行うことができます。
今回は`AWS`との連携を扱いますが、他にも`GCP`や`Azure`など有名どころのクラウドサービスは抑えてあります。もちろんエージェントを導入することでオンプレでも利用できます。

なお前提として`Datadog`のアカウントは作成済みとしますが、フリートライアルとして14日間利用できるようなので、興味のある方は試してみてください。

## 実際の設定
以下、実際に行った設定になります。

### Integrationsの設定
メニューの【Integrations】から【AWS】を選択します。
連携先の設定画面が開かれるので【Configuration】内の【アカウント設定】を押下し、【Automatically Using CloudFormation】を選択します。

![aws_datadog2](/img/aws_datadog2.png "aws_datadog2")

対`AWS`との連携においては`Datadog`が`CloudFormation`のテンプレートを用意してくれており、それを`AWS`上で展開するだけでデータの導通設定が可能になります。
※導通にあたっていくつかリソースを立ち上げます。`CloudWatch`が多いですが、当然課金が発生しますのでご注意ください。

さらに連携用の`API Key`を作成します。
【Create New】から任意の名前で`API Key`を作成し【Launch CloudFormation Template】を押下します。

![aws_datadog3](/img/aws_datadog3.png "aws_datadog3")

自動で`AWS`コンソールの`CloudFormation`画面に遷移するのでそのままスタックを作成します。
ここで作成されたスタック群の中の`data-forward`(Datadogへのログデータ転送)を行っている`Lambda`が中心となっていきます。

### API Gateway側の設定
今回は`API Gateway`側のログを`Datadog`に送ることにします。
`API Gateway`の対象となる`API`のステージ設定で`CloudWatch`と連携するようにします。

![aws_datadog4](/img/aws_datadog4.png "aws_datadog4")

仮に`CDK`で同じ設定にする場合は以下のように記載します。

```ts
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

// ロググループの作成
const apiLogGroup = new logs.LogGroup(
  this,
  `ApiLogGroup`,
  {
    logGroupName: `/aws/apigateway/anyapi-log`,
    retention: 365,
  },
);

// APIの作成
const api = new apigateway.RestApi(this, `AnyApi`, { 
  
  // 省略...

  deployOptions: {
    dataTraceEnabled: true,
    loggingLevel: apigateway.MethodLoggingLevel.ERROR,
    accessLogDestination: new apigateway.LogGroupLogDestination(
      apiLogGroup,
    ),
    metricsEnabled: true,
    accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
  },
});
```

いずれの方法でも、作成した`LogGroup`を`data-forward`している`Lambda`のトリガーに指定してあげる必要があります。
こうすることで、「`API Gateway`が動く」→「`LogGroup`のログが書き込まれる」→「`Lanbda`がトリガーされ、`Datadog`に書き込まれる」という流れになります。

### 実際にDatadog側のログを見てみる
実際に`API`を動かしてみると、以下のような感じで`Datadog`にログが流れてきていることが分かります。

![aws_datadog5](/img/aws_datadog5.png "aws_datadog5")

ここで表示しているのは`API Gateway`の動作ログなので、主には「いつ」「どこからリクエストが来て」「どんなレスポンスが返ったか」をアバウトに把握できるだけです。

実際には、ここに加えて`API Gateway`から呼び出された`Lambda`等のログを合わせることによって細かな解析ができるようになります。

### Slackに連携させてみる
ここからは少しおまけ的な内容で`API Gateway`でエラーに応じて`Slack`に通知されるようにしてみます。

- [ネコニキの開発雑記 | 【AWS】CDKでCloudWatchの閾値を超えたらSlack通知するようにする](https://nekoniki.com/20220518_aws-cdk-cloudwatch-to-slack)

過去にも上記のような記事で`CloudWatch`から`SNS`等を用いて`Slack`連携はさせましたが、今回はログ解析の主体が`Datadog`なのでそちらでやってみます。

`AWS`と連携させた時と同様に【Integrations】から`Slack`を選択します。
※ここで、どんなワークスペースのどんなチャンネルかを選択します。

【Define the metric】で監視するメトリクスの内訳(ここでは4XXエラーと5XXエラー)を設定した後、【Set alert conditions】で閾値(ここでは1件でWarning、2件でアラート)を設定します。

![aws_datadog6](/img/aws_datadog6.png "aws_datadog6")

あとは【Notify your team】で通知先・メッセージを編集すれば完了です。
メッセージには`{{is_alert}}`のように`Datadog`独自のパラメータを埋め込むこともできます。設定可能な値については下記リンクを参照ください。

- [Datadog | Notifications](https://docs.datadoghq.com/monitors/notify/#message-template-variables)

これで設定した閾値を跨いだ場合`Slack`に通知が飛ぶようになったかと思います。

## まとめ
今回は`AWS`のログ解析のために`Datadog`と連携させた際の設定手順をまとめました。
`CloudFormation`が用意されていることで、比較的手間もなく連携が成功しました。

今回は`API Gateway`の連携を主にしましたが、他のリソースについても同様に監視・通知を行うことができます。

とはいえ`CloudWatch`を絡めてログ連携させる関係上、`AWS`側でもコストが少しかかるのに加えて`Datadog`側でも利用料金が発生します。
この辺りはコストと確認して、管理を円滑に進めるための必要経費として割り切る必要があるかなと感じました。

今回の内容が役立ちましたら幸いです。