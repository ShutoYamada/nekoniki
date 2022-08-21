---
templateKey: blog-post
url: 20220214_cross-stack-lambda-permission
title: 他のスタックからインポートしたLambdaにはaddPermissionで権限が付けられない
date: 2022-02-14T19:00:00.000Z
description: |-
  CDKでゴリゴリインフラを書いていくとどうしてもスタックが長くなりがちなので、適切な粒度でスタックを分割しているかと思います。
  その際に、あるスタックで作成したLambdaに対して、以降の別スタックで権限を付与しようとした際にハマったので対処法を紹介します。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - labmda
  - permission
  - cloud formation
---

## 概要
やりたいことの概要は以下の通りです。
- `LambdaStack`で`Lambda`を作成(ここでは`hoge`とする)
- `ApiStack`で`ApiGateway`を作成し、そこに`hoge`を割り当てる
- `ApiGateway`から呼ばれる(`InvokeFunction`)する際は`Lambda`側にもリソースベースのポリシーが必要なので`ApiStack`で追加する

この3つ目の`ApiStack`で`Lambda`に対してポリシーを追加するのがネックでした。
`LambdaStack`では`Output`として`hoge`の`ARN`を吐き出しています(`HogeArn`)。

## ダメな例

```ts
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

/**
 * API Gateway Stack
 */
export class ApiStack extends cdk.Stack {

  public readonly api: apigateway.RestApi;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // hogeを別スタックのOutputから取得
    const hoge = lambda.Function.fromFunctionArn(this, 'HogeFunction', cdk.Fn.importValue('HogeArn'));

    // REST APIを作成
    this.api = new apigateway.RestApi(this, 'HogeApi', {
        cloudWatchRole: false,
    });

    // ルートにGETメソッドを作成しhogeを割り当てる
    this.api.root.addMethod('GET',  new apigateway.LambdaIntegration(hoge));

    // hogeのリソースベースのポリシーでApiGatewayからのInvokeFunctionを許可する
    hoge.addPermission(
      'InvokeFromApi',
      {
        principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        action: 'lambda:InvokeFunction',
        // APIのARNを取得
        sourceArn: this.api.arnForExecuteApi('GET', '/', '*')
      }
    );
  }
}
```

一見これでうまくいきそうですが、肝心のリソースベースのポリシーが割り当てられていませんでした。
エラー自体は出ていないのですが、実際に作成されたAPIをテスト実行してみると権限エラーとなってしまいます。

## CfnPermissionなら大丈夫らしい
以下のような記事を見つけました。
参考：[DeveloperIO - AWS CDKで1つのスタックにLambdaを21個以上作る場合に起きる問題と対処方法の紹介](https://dev.classmethod.jp/articles/cdk-over-21-lambda-create-error/)

その中で以下のような記述があります。

> (IFunction内にaddPermissionがありそちらも試したのですが、既存のLambdaをインポートした場合はCloudFormationにPermissionが出力されませんでした。
> 既存のLambdaをインポートした場合は、別アカウントのLambdaを参照して権限を付与しないためにaddPermissionが権限を生成せず終了するようになっています。
> 今回はアカウントの管理下にあるLambdaなのでCfnPermissionを使用して権限を追加しています。)

なるほど、と思いましたが同様の記事に以下のような記述も。

> 2020/10/27 追記 CDKのversion 1.64.0で同一のAWSアカウント内のLambdaをimportした場合Permissionが自動生成されるようになったので下記のCfnPermissionの記述は不要になりました。
> 詳しくはCDKのリリースノートをご参照ください。 
> [AWS CDK v1.64.0 Release Note](https://github.com/aws/aws-cdk/releases/tag/v1.64.0)

手元の`CDK`のバージョンは`2.10.0`なのでとっくに解消されているはずだが、うーん・・・

何はなくとも`CfnPermission`を試してみます。

```ts
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

/**
 * API Gateway Stack
 */
export class ApiStack extends cdk.Stack {

  public readonly api: apigateway.RestApi;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // hogeを別スタックのOutputから取得
    const hoge = lambda.Function.fromFunctionArn(this, 'HogeFunction', cdk.Fn.importValue('HogeArn'));

    // REST APIを作成
    this.api = new apigateway.RestApi(this, 'HogeApi', {
        cloudWatchRole: false,
    });

    // ルートにGETメソッドを作成しhogeを割り当てる
    this.api.root.addMethod('GET',  new apigateway.LambdaIntegration(hoge));

    // hogeのリソースベースのポリシーでApiGatewayからのInvokeFunctionを許可する
    // hoge.addPermission(
    //   'InvokeFromApi',
    //   {
    //     principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    //     action: 'lambda:InvokeFunction',
    //     // APIのARNを取得
    //     sourceArn: this.api.arnForExecuteApi('GET', '/', '*')
    //   }
    // );

    // CfnPermissionで同じことをする
    new lambda.CfnPermission(this, `InvokeFromApi`, {
        principal: 'apigateway.amazonaws.com',
        action: 'lambda:InvokeFunction',
        functionName: hello.functionName,
        sourceArn: this.api.arnForExecuteApi('GET', '/', '*')
    });
  }
}
```

これで`hoge`にリソースベースのポリシーが付与されました。
手元の`CDK`のバージョンなら、最初のやり方でも問題ないはずですが、またダメになったのかもしれません。
※もしくは`addPermission`に何かしらパラメータを付けるとうまくいく？？


## まとめ
今回はスタックを分けた状態で、別なスタックで作成した`Lambda`をインポートした時に権限を割り当てられずにハマった件と、その対処法について紹介しました。
自分的には腑に落ちない解決方だったので、うまいやり方をご存知の方がいらっしゃいましたらコメントいただけると幸いです。