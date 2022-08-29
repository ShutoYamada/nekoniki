---
templateKey: blog-post
url: 20220829_aws-delete-cloudfront-cache
title: 【AWS】CodePipelineの最後にCloudFrontのキャッシュを消すLambdaを配置する
date: 2022-08-29T19:00:00.000Z
description: |-
  今回はCodePipelineの最後にCloudFrontのキャッシュを削除するLambdaを配置したいと思います。
  CodePipelineでいい感じにCI/CDを組んだものの、CloudFront側でキャッシュされていると更新がクライアントに反映されないケースがあるため、その対応策となります。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - iam
  - codepipeline
  - lambda
---

## 前提
下地として、下記記事を参考にしています。

- [Power CMSブログ | S3 同期の際に Lambda で自動的に CloudFront のキャッシュをパージする](https://www.powercms.jp/blog/2021/08/s3_cloudfront_purge.html)

この記事の中で、`CoudFront`のキャッシュを消す`Lambda`が紹介されています。
素直にこれを`CodePipeline`に組み込めばいいやと思いきや、多少改造が必要でした。

## Lambda

下記が今回使用するLambdaになります。
この`Lambda`の実行ロールには、通常の権限に加えて`"cloudfront:*"`で`CloudFront`に関する操作権限を、`"codepipeline:*"`で`CodePipeline`に関する操作権限を与えています。

また、環境変数として`DISTRIBUTION_ID`を用いており、ここに削除したい`CloudFront`のディストリビューションを指定しています。

削除後は、呼び出し元である`CodePipeline`に処理成功を伝えるため`put_job_success_result`を実行しています。
※これがないと`CodePipeline`上は失敗になります。

```py
from __future__ import print_function
import os
import boto3
import time
import json

def lambda_handler(event, context):
    # 削除対象となるCloudFrontのディストリビューションを取得
    target = os.environ['DISTRIBUTION_ID']
    client = boto3.client('cloudfront')
    codepipeline = boto3.client('codepipeline')
    # 削除したいパスに合わせてキャッシュ削除を構成
    # ここでは全てのキャッシュを削除したいので'/*'を指定している
    invalidation = client.create_invalidation(DistributionId=target,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': ['/*']
        },
        'CallerReference': str(time.time())
    })
    # CodePipelineに完了を伝達する
    codepipeline.put_job_success_result(jobId = event['CodePipeline.job']['id'])
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
```

## Pipelineへの組み込み
今回も`CDK`で設定を行います。
作成したパイプラインの`stages`の中の最後に`LambdaInvokeAction`を作成し、実行する`Lambda`を指定しましょう。

```ts

import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const lambdaArn = '【先ほど作成したLambdaのARN】';

// CodePipelineの設定
const pipeline = new codepipeline.Pipeline(this, `SamplePipeline`, {
    pipelineName: `SamplePipeline`,
    // パイプラインの各ステージを設定
    stages: [
        // ソース取得・ビルド・デプロイ等は割愛...
        // キャッシュ削除
        {
            stageName: 'DeleteCache',
            actions: [
                new actions.LambdaInvokeAction({
                    actionName: "deleteCache",
                    lambda: lambda.Function.fromFunctionArn(this, 'deleteCacheLambda', lambdaArn)
                })
            ]
        }
    ]
});
```

これでパイプラインの最後にこの`Lambda`が走り、配信したソースのキャッシュが削除されるため、最新のソースを配信することができます。

## まとめ
今回は`CodePipeline`の最後に`Lambda`を実行させて、`CloudFront`上のキャッシュを削除する方法について紹介しました。
`React`や`Vue`をフロントエンドに使っている場合`S3`にビルド結果を格納して、それを`CloudFront`を使って配信するような手法がサーバレスとなり、低コストで実現できます。

その際につい忘れがちな`CDN`のキャッシュ削除まで`CI/CD`の中に組み込むことで、クライアントに迅速に更新を反映できるので役立つケースが多いかと思います。

今回の内容が役立ちましたら幸いです。


## 参考
- [Power CMSブログ | S3 同期の際に Lambda で自動的に CloudFront のキャッシュをパージする](https://www.powercms.jp/blog/2021/08/s3_cloudfront_purge.html)