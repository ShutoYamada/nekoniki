---
templateKey: blog-post
url: 20220422_aws-amplify-resource-not-found
title: 【AWS】Amplifyアプリを削除しようとした際にResourceNotFoundExceptionエラーになる場合の対処法
date: 2022-05-06T19:00:00.000Z
description: |-
  今回はAWSのAmplifyを使っている場合に遭遇したエラーの対処法について紹介します。
  具体的にはアプリを削除しようとした時に、当該アプリに含まれるリソースが既に存在しない(削除していた)場合のエラーです。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - amplify
---


## 概要
`Amplify`はフルスタックのアプリケーションを簡単に構築することができる機能です。
バックエンドの構築やフロントエンドのデプロイ等のアプリ構成に必要な作業に加えて、`Cognito`等の`AWS`の機能を用いて認証の機構の構築までを手軽に行うことができます。

- [公式 - AWS Amplify](https://aws.amazon.com/jp/amplify/)

`Amplify`で作成された各リソースは`Amplify`アプリに紐づけられているので、アプリを消すことで配下のリソースを一括して削除することができます。
しかし、アプリの削除以外のフローでリソースを消していた場合には下記のようなエラーが発生します。

下記は`Amplify`アプリを削除しようとした際に、配下の`S3`バケットが既に削除済みであった場合に発生するエラーです。

```
Delete app <アプリID> failed with reason: ResourceNotFoundException - An error occurred while processing your request: S3 bucket <リソース名> or object #current-cloud-backend.zip was not found.
```

## 対処法「Amplifyに当該環境が既になくなった旨を伝える」
下記の記事が参考になりました。
- [Amplify コンソールからアプリを削除しようとしたら Removing backend envs for app XXX failed で失敗する時の対処方法](https://blog.serverworks.co.jp/amplify-fail-to-remove-app)

対処法としては`Amplify`アプリに当該の環境が既に削除した旨を伝えます。
アプリIDと環境名を用いて下記のコマンドを叩きます。

```shell
aws amplify delete-backend-environment --app-id <アプリID> --environment-name <環境名>
```

こうすることで`Amplify`側から当該の環境が削除されたと認識されます。
この場合、`Amplify`アプリに紐づいた他のリソースが一括削除されなくなるケースがあるようなので、`Amplify`アプリを削除した後に他のリソースについても一度確認してみましょう。

## まとめ
今回は`Amplify`で構築したアプリを削除しようとした際に発生したエラーの対処法について紹介しました。
自分が参考にした記事でも述べられていますが、`Amplify`や`CloudFormation`で作成されたリソースについては極力手動削除しない方が望ましいです。
※名称で判別がつくものもありますが、タグを付けておく等工夫をするといいかもしれません。

今回の内容が役立ちましたら幸いです。

## 参考
- [Amplify コンソールからアプリを削除しようとしたら Removing backend envs for app XXX failed で失敗する時の対処方法](https://blog.serverworks.co.jp/amplify-fail-to-remove-app)