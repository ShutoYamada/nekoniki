---
templateKey: blog-post
url: 20220208_aws-cdk-multi-stack
title: AWS CDKをStackを分けて構築する
date: 2022-02-08T19:00:00.000Z
description: |-
  前回、AWS CDKを使ってVPCを作成し、その中にLambdaを入れるまでを行いました。
  実際に動作しているシステムを動かす場合は、サービスが複雑に絡み合うため、
  どこかでStackを切り分けたほうがいいです。
  今回はその辺りの方法について紹介します。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - labmda
  - cloud formation
---

## おさらい
前回までの記事は以下の通りです。
[AWS CDKを使ってLamda in VPCを構築する](https://nekoniki.com/20220207_aws-cdk-labmda-sample)

上記の記事で作成したものベースで話を進めるので、実際に手元で動かしてみたい方は参照ください。

## Stackを分割する
前回までは1つのStackの中で以下のことを行なっていました。

1. `IAM`ロールを作成
2. `VPC`を作成
3. `Lambda`を作成し、実行ロールとして1のものを、格納するものとして2の`VPC`を指定

この3つの処理は対応する`AWS`のサービスが異なるため、スタックを切り分けたいと思います。
依存関係として、3を行う前に1,2が完了している必要があるので、まずは1,2を行うスタックを作ります。

### IAMロールを定義するスタック
まずは`lib/cdk-workshop-iam-stack.ts`を作成します。
中身は以下の通りです。

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * IAM Stack
 */
export class CdkWorkshopIamStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    cdk.Tags.of(role).add('Type','Test');

    // OutputとしてRoleArnを設定
    new cdk.CfnOutput(this, 'lambdaRoleExport', {
        value: role.roleArn,
        exportName: 'LambdaRoleArn'
    });
  }
}
```

大まかな処理は前回作成したスタックと同じです。
最後に`CfnOutput`で作成した`role`の`ARN`をスタックの出力パラメータに指定しています。
これは後の`Lambda`を作成するスタック内で、この`ARN`を元に実行ロールの紐付けを行うためです。

### VPCを定義するスタック
続いて`lib/cdk-workshop-vpc-stack.ts`を作成します。
内容は以下の通りです。

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

/**
 * VPC Stack
 */
export class CdkWorkshopVpcStack extends cdk.Stack {

    public readonly vpc: ec2.Vpc;   // VPC

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPCを宣言
        this.vpc = new ec2.Vpc(this, 'WorkshopVPC', {
            // CIDR
            cidr: '10.1.0.0/16',
            // PublicとPrivateのサブネットを定義
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'WorkshopPublicSubnet1',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'WorkshopPublicSubnet2',
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    cidrMask: 24,
                    name: 'WorkshopPrivateSubnet1',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: 'WorkshopPrivateSubnet2',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED
                }
            ],
        });

        cdk.Tags.of(this.vpc).add('Type','Test');
    }
}
```

こちらもほとんど前回と同じような`VPC`作成処理ですが、クラスのメンバ変数に`vpc`を持っています。
これも`IAM`の時と同じで、後の`Lambda`を作成するスタックに対して`VPC`を渡してあげるために用意しています。

### Lambdaを定義するスタック
最後に`lib/cdk-workshop-stack.ts`です。
これは前回作成したものを更新する形になります。
以下のようになります。

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

type CdkWorkshopStackProps = {
  // Lambdaを配置するVPC
  lambdaVpc: ec2.Vpc;
} & Partial<cdk.StackProps>

export class CdkWorkshopStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props: CdkWorkshopStackProps) {
    super(scope, id, props);

    // Lambdaの実行ロールを取得
    const lambdaRole = iam.Role.fromRoleArn(this, 'LambdaRole', cdk.Fn.importValue('LambdaRoleArn'));
    // Lambdaを格納するVPCを取得
    const lambdaVpc = props.lambdaVpc;

    // Lambdaリソースを宣言
    const hello = new lambda.Function(this, 'HelloHandler', {
      // ランタイムの指定
      runtime: lambda.Runtime.NODEJS_14_X,
      // lambdaディレクトリを指定
      code: lambda.Code.fromAsset('lambda'),
      // hello.jsのhandler関数を指定
      handler: 'hello.handler',
      // VPC内に配置
      vpc: lambdaVpc,
      // 実行ロールの設定
      role: lambdaRole
    });

    cdk.Tags.of(hello).add('Type','Test');
  }
}
```

`CdkWorkshopStackProps`をコンストラクタの引数の型として定義しています。
`CdkWorkshopStackProps`はプロパティとして`lambdaVpc`を持っており、これは外部から渡される`VPC`の情報になります(実際には先ほどの`cdk-workshop-vpc-stacl`で作った`VPC`が渡される)。
この`lambdaVpc`を`Lambda`に割り当てています。

また、`IAM`ロールについても先に作成・出力した`LambdaRoleArn`を使って取得しています。
このロールも`Lambda`作成時に実行ロールとして割り当てています。

### エントリポイントの修正
最後に`bin/cdk-workshop.ts`を修正します。
このファイルは前回は特に触れませんでしたが、`Cloud Formation`のテンプレートを作成する処理のエントリポイントとなるソースです。
このソースが今まで作成してきた各種スタックを呼び出すことで、テンプレートが出来上がっていきます。

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopVpcStack } from '../lib/cdk-workshop-vpc-stack';
import { CdkWorkshopIamStack } from '../lib/cdk-workshop-iam-stack';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new cdk.App();

// VPC Stack
const cdkWorkshopVpcStack = new CdkWorkshopVpcStack(app, 'CdkWorkshopVpcStack');
// IAM Stack
const cdkWorkshopIamStack = new CdkWorkshopIamStack(app, 'CdkWorkshopIamStack');
// MainStack
const cdkWorkshopStack = new CdkWorkshopStack(app, 'CdkWorkshopStack', {
    lambdaVpc: cdkWorkshopVpcStack.vpc
});

// 依存関係を設定
// MainStackはVPCとIAMのStackに依存している
cdkWorkshopStack.addDependency(cdkWorkshopVpcStack);
cdkWorkshopStack.addDependency(cdkWorkshopIamStack);
```

冒頭で述べた通り、まず`VPC`と`IAM`のスタックを作ってから、`Lambda`を作るスタックを呼び出しています。
そして最後に`addDependency`を用いて、それらの依存関係を宣言しています。

## デプロイ
それでは早速デプロイしてみます。
前回は`cdk deploy`でしたが、スタックが複数ある場合はどのスタックをデプロイするかを指定する必要があります。
今回は一気に行いたいので、下記のコマンドを実行します。

```shell
cdk deploy '*' --require-approval never
```

アスタリスク`*`は全てのスタックを意味していて、`--require-approval never`はデプロイ時の確認(`y/n`の入力を求められる)をスキップするオプションです。

これで前回同様の構成が、スタックを別々にした状態で再現できました。

## まとめ
今回は`CDK`のスタックを分けてデプロイする方法について紹介しました。
`AWS`を使っていく上では、`Lambda`を使うためには`IAM`ロールが必要で・・・、といった具合にそれぞれのサービスに依存関係があることがほとんどです。
コンソール上からの操作だと、自動で行われていることが多いので意識しにくいですが、`CDK`を用いてインフラを構築しようとすると、それらの依存関係を考える必要が出てきます。
最初はとっつきにくいですが、慣れてくると`AWS`のサービスへの理解がより深まるので、ぜひ一度手を動かしてみてください。

今回の内容が役立ちましたら幸いです。