---
templateKey: blog-post
url: 20201002_ios_review_nslocationalwaysusagedescription_warning
title: "【iOS】Info.plistにキーを追加しても「ITMS-90683: Missing Purpose String」のメールが来た件"
date: 2020-10-02T04:42:26.478Z
description: |-
  ReactNativeでめでたくiOSのアプリが出来上がり、いざストア公開しようとした時に立ちはだかるのが審査です。
  今回は、審査中に遭遇した警告メールとその対処法についてご紹介します。
  ReactNativeと書いていますが、実際にはSwift等で作ったアプリでも同様の事象があると思います。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - ios
  - apple
  - レビュー
  - 審査
  - 権限
  - Info.plist
---
## 前提条件
- `iOS`アプリを`TestFlight`等でレビュー
- `Your app "{AppName}" has one or more issues`というメールが返ってきた

## どんな内容か
全文は以下の通りです。

> ITMS-90683: Missing Purpose String in Info.plist - Your app's code references one or more APIs that access sensitive user data. The app's Info.plist file should contain a NSLocationAlwaysUsageDescription key with a user-facing purpose string explaining clearly and completely why your app needs the data. Starting Spring 2019, all apps submitted to the App Store that access user data are required to include a purpose string. If you're using external libraries or SDKs, they may reference APIs that require a purpose string. While your app might not use these APIs, a purpose string is still required. You can contact the developer of the library or SDK and request they release a version of their code that doesn't contain the APIs.

ざっくりした訳ですが「`Info.plist`に`NSLocationAlwaysUsageDescription`が含まれてないから追加して」という趣旨の警告です。

`NSLocationAlwaysUsageDescription`は`iOS`アプリが**位置情報の利用**を行う場合の用途等の説明文です。

## 対応
対応としてはそのまま`Info.plist`に`NSLocationAlwaysUsageDescription`の項目を追加すればいいです。
このメールが来た段階で`Info.plist`は下記のようになっていました。

```xml
<key>NSLocationAlwaysUsageDescription </key>
<string>○○のために位置情報を使用します。</string>
```

・・・あれ？ちゃんと記載してあるな。

## 紆余曲折
日本語で書いてあるのがダメなのかと思い、英語で記載してみるが結果は変わらず。
アプリの仕様と記載内容に矛盾があるわけでもない(そもそもレビュアーの人は細かいところまでチェックしているのかという疑問もある)。

同じような事例を調べても、`NSLocationAlwaysUsageDescription`を書けば解決しているようだし・・・うーん。

## 解決
あれこれ悩んだ末、もう一度`Info.plist`を見てみると・・・

```xml
<key>NSLocationAlwaysUsageDescription </key>
<!--                                 ^  -->
```

「「「スペースが入ってる！！！」」」

全然気づかなかった。
スペースを外してもう一回レビューに出してみる。

```xml
<key>NSLocationAlwaysUsageDescription</key>
<!--<key>NSLocationAlwaysUsageDescription </key>-->
```

・・・警告が出なくなった。

## まとめ
このあたりは`Apple`側も機械的に判別しているようなので、スペースが入っていると今回のように**「記載していない」**判定となるようです**(そりゃそうだ)。

調べても解決策が出てこなかったため、自分と同じようにうっかりやらかしている方の手引きになれば幸いです。