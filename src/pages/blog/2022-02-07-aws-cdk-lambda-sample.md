---
templateKey: blog-post
url: 20220207_aws-cdk-labmda-sample
title: AWS CDKを使ってLamda in VPCを構築する
date: 2022-02-07T19:00:00.000Z
description: |-
  今回はAWS CDKを使ってLambdaをデプロイしたいと思います。
  単一なLambdaをデプロイするところから始まり、最終的には
  VPCを作成し、その中にLambdaを配置したものをゴールとします。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - labmda
---

参考：[AWS CDK Intro Workshop](https://cdkworkshop.com/)

## 事前準備

### CDK CLIのインストール
`aws-cdk`をグローバルインストールしましょう。

```shell
# aws-cdkをインストール
npm install -g aws-cdk
```

インストール後に`cdk`コマンドが通るかどうか確認します。
以下のコマンドでバージョンが表示されればOKです。

```shell
# バージョンの確認
cdk --version
```

### 初期化処理の実行

続いて初期化処理です。
まずは`cdk-workshop`というディレクトリを作成し、その配下に移動しましょう。

```shell
mkdir cdk-workshop && cd cdk-workshop
```

ここで`cdk init`コマンドを実行し、初期化を行います。
オプションで`Typescript`を使用することを宣言します。

```shell
cdk init sample-app --language typescript
```

しばらく待つと`cdk-workshop`内に各種ディレクトリ・ファイルが作成されると思います。
以下のような構成になっているはずです。

- cdk-workshop
  - bin
    - cdk-workshop.ts
  - lib
    - cdk-workshop-stack.ts
  - node_modules
  - test
  - .gitignore
  - .npmignore
  - cdk.json
  - jest.config.js
  - package-lock.json
  - package.json
  - README.md
  - tsconfig.json

デフォルトでは`AWS SQS`のキューと`AWS SNS`のトピックを作成するものとなっているので、ここを書き換えて行きます。

## Lambdaの作成・デプロイ

### Lambdaの作成
まずは`Lambda`の作成を行います。
`cdk-workshop`の配下に`lambda`ディレクトリを作成し、`hello.js`ファイルを作成します。

```shell
mkdir lambda && touch lambda/hello.js
```

`hello.js`の中身は以下のようにしましょう。

```js:hello.js
exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`,
  };
};
```

### スタックの更新
作成した`hello.js`を使うようにスタックを更新します。
`lib/cdk-workshop-stack.ts`を以下のように編集しましょう。

```ts:lib/cdk-workshop-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambdaリソースを宣言
    const hello = new lambda.Function(this, 'HelloHandler', {
      // ランタイムの指定
      runtime: lambda.Runtime.NODEJS_14_X,
      // lambdaディレクトリを指定
      code: lambda.Code.fromAsset('lambda'),
      // hello.jsのhandler関数を指定
      handler: 'hello.handler'
    });
  }
}
```

#### Watchの実行
ここまでの手順で何か誤りがないか確認してみます。
以下のコマンドを実行しましょう。

```shell
npm run watch
```

以下のように表示されればOKです。

```shell
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
```

`npm run watch`は`tsc`を用いて`Typescript`のファイルをコンパイルし、エラーがあるかどうかを監視しています。
この状態で`TS`ファイルを編集すると監視が走り、コンソールが更新されることが分かります。

### Synthの実行(テンプレートの生成)
エラーがないことを確認したら、以下のコマンドでテンプレートを生成してみましょう。

```shell
cdk synth
```

しばらく待つと、`cdk.out`というディレクトリが生成されていると思います。
`AWS CDK`は`AWS`インフラをコードで記載することができますが、最終的にその内容を`AWS`に反映させるために`Cloud Formation`を使います。

その際に用いるテンプレートを生成するのが今の`cdk synth`コマンドです。
`cdk.out/CdkWorkshopStack.template.json`を参照すると、`Cloud Formation`の形式に従ってテンプレートが生成されていることが分かります。

### Bootstrapの準備
それでは早速デプロイ...といいたいところですが、まだ準備があります。
先ほど述べたように、デプロイ時にも`Cloud Formation`を用いるのですが、
そのテンプレートなどを一時的に`S3`にアップロードする必要があります。

そのためにブートストラップスタック、というものを用意する必要があります。
「必要がある」とはいっても、実際には下記のコマンドをデプロイの前に実行するだけです。
※これは「デプロイ先のリージョンごと」に「初回のみ」の手順になります。

```shell
cdk bootstrap
```

実行後`S3`のバケットを確認すると`cdktoolkit-*****`といった名前のものが作成されているかと思います。

### デプロイ実行
いよいよデプロイです。
下記コマンドを実行しましょう。

```shell
cdk deploy
```

コンソール上に差分(今回は新規作成なので、全て新規)が表示され、確認を経た後でデプロイが行われます。
`Cloud Formation`のコンソールでもスタックが作成され、完了後には`Lambda`が作成されました。

## 実行ロールを定義して、VPCに含める
今度は作成した`Lambda`に独自で定義した実行ロールを付けて、さらに`VPC`の中に配置します。
`lib/cdk-workshop-stack.ts`を以下のように修正しましょう。

```ts:lib/cdk-workshop-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCを宣言
    const vpc = new ec2.Vpc(this, 'WorkshopVPC', {
      // CIDR
      cidr: '10.1.0.0/16',
      // PublicとPrivateのサブネットを定義
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'WorkshopPublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'WorkshopPrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ]
    });

    // Lambdaの実行ロールを宣言
    const role = new iam.Role(this, 'WorkshopRole', {
      // ロール名
      roleName: 'workshop-role',
      // LambdaサービスからこのロールにAssumeRoleできるよう設定
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      // ポリシーの宣言
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    });

    // Lambdaリソースを宣言
    const hello = new lambda.Function(this, 'HelloHandler', {
      // ランタイムの指定
      runtime: lambda.Runtime.NODEJS_14_X,
      // lambdaディレクトリを指定
      code: lambda.Code.fromAsset('lambda'),
      // hello.jsのhandler関数を指定
      handler: 'hello.handler',
      // VPC内に配置
      vpc: vpc,
      // 実行ロールの設定
      role: role,
    });
  }
}
```

単一のスタックの記述が長くなりました。
この辺りは`Cloud Formation`のテンプレートを自身で書く場合と同様に、レイヤーごとなどでスタックを切り分けると管理がしやすくなります。

それでは再度デプロイしてみましょう。

```shell
cdk deploy
```

先ほどと同様の手順通りに進んでいけば、`Lambda`が`VPC`の中に入り、実行ロールが変わっていることが確認できると思います。

## まとめ
今回は`CDK`を使って`VPC`の中に`Lambda`を配置し、独自に定義した実行ロールを割り当てるところまでの実装を行いました。
実際の運用を考える場合には`Lambda`は`GitHub`や`CodeCommit`などから`pull`してきたものを用いるので、`cdk deploy`を走らせる前にソースのプルを行う必要があります。

上記のように、実運用する場合には必要な要素がまだ欠けていますが、`CDK`に置き換えやすい箇所から順番に置き換えていくと、後々デプロイを自動化しやすくなるのではないかと思いました。

今回の内容が役立ちましたら幸いです。