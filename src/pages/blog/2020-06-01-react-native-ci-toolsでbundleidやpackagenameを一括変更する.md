---
templateKey: blog-post
url: 20200601_react-native-ci-tools
title: react-native-ci-toolsでBundleIDやPackageNameを一括変更する
date: 2020-06-01T08:38:52.042Z
description: >-
  ReactNatveで作成したアプリをストアリリースすることになった場合、BundleIDやPackageNameを変える必要があります(それぞれiOS,Androidのアプリの一意な識別子とアプリ名です)。

  しかし、せっかくReactNativeを使ってネイティブのモジュールを変更せずに済んでいるので、BundleIDとPackageNameを変更する場合も同じようにしたいですよね。

  そこで今回は、react-native-ci-toolsを使ってコマンド一発でBundleIDとPackageNameを変更できるようにします。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - ReactNative
  - react-native
  - react-native-ci-tools
  - クロスプラットフォーム
  - アプリ開発
  - iOS
  - Android
  - BundleID
  - PackageName
---
## 前提条件
- `ReactNative`のプロジェクト作成済

## ライブラリのインストール
`react-native-ci-tools`をインストールします。
- [npm](https://www.npmjs.com/package/react-native-ci-tools)

グローバルに入れておくと後々使いやすいです。

```shell
npm i -g react-native-ci-tools
```

## 使い方
任意の`ReactNative`プロジェクトのルートで`react-native-ci-tools bundle`コマンドを実行。
最初に指定するのが`BundleID`で２つ目が`PackageName`です。

```shell
react-native-ci-tools bundle "nekoniki.app" "ネコニキのアプリ"
```

これで識別子およびアプリ名が一括で変更できました。

## 補足
`iOS`と`Android`でそれぞれ異なる識別子、アプリ名を使いたいことがあると思います。
その場合は先のコマンドにオプションを指定することで任意のプラットフォームのみ変更することが可能です。
`iOS`は`-i`を、`Android`は`-a`を付けます。

```shell
react-native-ci-tools bundle -i "nekoniki.ios.app" "ネコニキのアプリ(iOS版)"
```

## まとめ
今回は`react-native-ci-tools`を使って`BundleID`と`PackageName`を一括変換する方法を紹介しました。
アプリのリリース段階にならないと行わない作業のため、つい何をするか忘れがちです。
そんな時にコマンドひとつで一括変換できるのはとても便利なので、是非オススメです！