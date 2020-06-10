---
templateKey: blog-post
url: 20200525_gatsby_analytics
title: Gatsby製ブログでGoogleAnalyticsを導入する
date: 2020-05-25T00:38:01.439Z
description: |-
  Gatsby製のブログに限らず、アクセスを分析してユーザーのニーズを把握しておくことは、有益なブログを作る上で欠かせない作業です。
  今回は、Gatsbyで作成したブログにGoogleAnalyticsを導入する方法を紹介します。
featuredpost: false
featuredimage: /img/analytics-logo.jpg
tags:
  - Gatsby
  - GatsbyJS
  - javascript
  - React
  - Google
  - GoogleAnalytics
  - ブログ
---
![analytics-logo](/img/analytics-logo.jpg "analytics-logo")

## 前提条件
- `Gatsby`製ブログを立ち上げて公開済
- `GoogleAnalytics`アカウントは取得済

## GoogleAnalytics側の設定
先に`GoogleAnalytics`側でトラッキングIDを取得しておきます。
今回はこのサイト(`https://nekoniki.com`)に設定した場合を例とします。
管理画面からプロパティを追加し・・・

![analytics1](/img/analytics1.png "analytics1")

トラッキングIDが表示されればOK(後で使います)。

![analytics2](/img/analytics2.png "analytics2")

## ライブラリのインストール
今回は`gatsby-plugin-google-analytics`を使用します。
`Gatsby`で作られたサイトに`GoogleAnalytics`を導入するライブラリです。
- [Adding Analytics | GatsbyJS](https://www.gatsbyjs.org/docs/adding-analytics/)

```shell
yarn add gatsby-plugin-google-analytics
```

## 設定の追加
`gatsby-config.js`に設定を追記します。

```javascript:title=gatsby.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // 下記の "UA-XXXXXXXXX-X" を自身のサイトのトラッキングIDに置き換えます。
        trackingId: "UA-XXXXXXXXX-X",
      },
    },
  ],
}
```

これで設定は完了です。

## 適用されているか確認

実際に`GoogleAnalytics`側に反映されているかを確認しましょう。
手元の端末で対象ブログにアクセスした場合、`GoogleAnalytics`に管理画面で「アクティブユーザーのリアルタイム」が増えているのが分かります。

![analytics3](/img/analytics3.png "analytics3")

## まとめ
今回は`Gatsby`ブログに`GoogleAnalytics`を導入する方法を紹介しました。
作業はほとんどいらず、トラッキングIDをコピペするだけなのでとても簡単に導入できると思います。
`GoogleAnalytics`はユーザーの傾向を把握するには必須といっても過言ではないので是非導入してみましょう！