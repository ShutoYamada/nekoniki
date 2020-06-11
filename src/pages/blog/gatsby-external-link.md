---
templateKey: blog-post
title: Gatsby製ブログ内の外部リンクを別タブ対応する
date: 2020-05-24T08:00:35.950Z
description: |-
  Gatsbyでブログを作っている時に、参考にしたサイトや公式サイトへのリンクを貼る機会が多々あるかと思います。
  いわゆる「外部リンク」ですが、マークダウンでリンクを書いている場合、デフォルトでは"target=`_blank`"の指定ができません。
  今回は、外部リンクのみ別タブで開くようにします。
featuredpost: false
featuredimage: /img/gatsby.jpg
tags:
  - Gatsby
  - GatsbyJS
  - react
  - ブログ
  - 外部リンク
  - リンク
---
![Gatsby](/img/gatsby.jpg "Gatsby-logo")

## 前提条件
- `gatsby-transformer-remark`導入済

## ライブラリのインストール
今回は`gatsby-remark-external-links`を使用します。
`markdown`から`HTML`への変換時に、外部サイトのみ`target="_blank"`を指定して別タブで開くようにするライブラリです。

- [gatsby-remark-external-links | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-external-links/)

```shell
yarn add gatsby-remark-external-links
```

## 設定
`gatsby-config.js`の`gatsby-transformer-remark`下の`plugins`に追記します。

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-external-links',
          options: {
            target: '_blank',
            rel: 'noopener',
          },
        },
      ]
    }
  }
]

```

## 使用方法
特別な使用方法はありません。
今まで通りにリンクを貼って、外部サイトへのリンクのみ別タブで開かれることを確認しましょう。


## まとめ
今回は`Gatsby`製ブログで、外部サイトのみ別タブで開くようにするためのライブラリを紹介しました。
こういった細かい機能も自由にカスタマイズできるのが`Gatsby`のいいところですよね。