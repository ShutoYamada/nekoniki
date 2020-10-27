---
templateKey: blog-post
url: 20201013_react-native-firebase_setup
title: 【ReactNative】react-native-firebaseセットアップと機能一覧
date: 2020-10-13T09:37:58.147Z
description: |-
  FirebaseはスマホやWebアプリのバックエンドとして非常に優秀で、認証や通知、分析にストレージ・DBなど幅広い用途で使用することができます。
  ReactNativeアプリでもライブラリであるreact-native-firebaseが提供されているため比較的簡単に組み込むことができます。
  今回はそのセットアップ手順をご紹介します。
featuredpost: true
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-firebase
  - firebase
  - バックエンド
  - サーバサイド
---
## 前提条件
- `react-native@0.63.3`
- `Firebase`プロジェクトは作成済み

## ライブラリ
以下に公式サイトがあります。
- [react-native-firebase](https://rnfirebase.io)

現在は`v6`系が最新となります。

### インストール
`react-native-firebase`にはいくつも機能があるため、ライブラリが分かれています。
基本となるのは`@react-native-firebase/app`で、これはいかなる機能を使う場合もインストールする必要があります。

```shell
yarn add @react-native-firebase/app
```

`iOS`で利用する場合は`pod install`を行います。

```shell
cd ios && pod install
```

### プロジェクトの構成ファイルの組み込み
既に`Firebase`側でプロジェクトは作成済みだと思いますので、**【プロジェクトの概要】**の**アプリの追加**から`android`と`ios`アプリを作成しましょう。
その過程で、`google-service.json`と`GoogleService-Info.plist`という2種類のファイルをダウンロードしたと思います。

それぞれ`google-service.json`は`android/app`の直下、`GoogleService-Info.plist`は`XCode`から`/ios/{プロジェクト名}.xcworkspace`の直下へ追加しましょう。

これで準備は完了です。

## 機能一覧
以下に`react-native-firebase`で利用できる機能を紹介します。

### AdMob
アプリ内広告に関する機能です。
広告の表示位置等を調整できます。

### Analytics
アプリログ解析に関する機能です。
本家`GoogleAnalytics`のように各画面の表示回数や操作傾向などを、ログを埋め込むことで解析できます。

### Authentication
認証に関する機能です。
一般的なメールアドレス登録や、`Google`等の外部サイトの`OAuth`認証を行うことができます。

### Cloud Firestore
`NoSQL`のクラウドデータベース機能です。
ユーザー情報や、アプリで使用するデータの格納等で使用します。

### Cloud Functions
サーバーレスで実行できる関数です。
アプリ側から事前に定義した処理を呼び出すことができます。

### Cloud Messaging
いわゆる`プッシュ通知`の機能です。

### Cloud Storage
クラウドストレージ機能です。
例えば、プロフィール画像等を格納することができます。

### Crashlytics
クラッシュレポート機能です。
どういった操作でクラッシュしたかの追跡等に便利です。

### Dynamic Links
特定の`URL`が実行された場合、アプリを呼び出す機能です。
`Web`サービスを既に持っており、アプリがインストールされている場合のみアプリで表示させたい場合などに便利です。

### In-app Messaging
特定の条件下でポップアップやバナーを表示させる機能です。
期間限定のキャンペーン通知などを、アプリに変更を加えることなく表示できます。

### Instance ID
デバイスを一意に紐づけるインスタンスIDの機能です。
他の様々な機能のベースとして使われることが多いです。

### ML Kit Natural Language
テキスト認識(`OCR`)や翻訳、顔識別など機能です。
カメラやマイク機能と組み合わせて使用します。

### ML Kit Vision
画像認識に関する機能です。
上記の`ML Kit Natural Language`同様、カメラ機能や写真機能と組み合わせて使用します。

### Performance Monitoring
アプリのパフォーマンス解析機能です。
起動時間やリクエスト、パフォーマンスが悪い箇所の解析に使用します。

### Realtime Database
クラウドデータベースです。
今後は、先の`Cloud Firestore`を推していくようです。

### Remote Config
アプリの設定機能です。
今までアプリに`config`として組み込んでいたデータをクラウドにおく事で、アプリの更新をすることなく変更を加えることができます。

- [【ReactNative】react-native-firebase/remote-configを使う](https://nekoniki.com/20201027_react-native-firebase-remote-config)

## まとめ
今回は`react-native-firebase`のセットアップと、利用できる機能一覧についてご紹介しました。
個別の機能についてはボリュームも大きいため、別記事に起こしていく予定です。

`Firebase`はサーバサイドに欲しい機能のほとんどをカバーしているため、フロントは`ReactNative`でサーバーサイドは`Firebase`だけで済んでしまうことも多いです。
そのため今後利用機会が多くなることが予想されるので、その際の導入の手引きになれば幸いです。