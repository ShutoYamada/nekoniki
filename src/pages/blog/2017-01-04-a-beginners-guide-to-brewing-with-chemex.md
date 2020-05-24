---
templateKey: blog-post
title: Gatsby製ブログでシンタックスハイライトを表示
date: 2020-05-24T06:47:20.314Z
description: |-
  GatsbyJSはブログ制作において非常に有益なライブラリなのですが、デフォルトだと備わっていない機能がいくつかあります。
  シンタックスハイライトもその一つで、技術系のブログを書く場合には必須といっても過言ではない機能です。
  今回は、Gatsby製ブログでシンタックスハイライトを表示させるライブラリを紹介します。
featuredpost: false
featuredimage: /img/how-to-build-simple-website-with-gatsbyjs-postcss-pt1.jpg
tags:
  - Gatsby
  - react
  - ブログ
  - シンタックスハイライト
  - prismjs
  - PrismJS
  - gatsby
  - GatsbyJS
---
![gatsby](/img/how-to-build-simple-website-with-gatsbyjs-postcss-pt1.jpg)

## 前提条件
- `gatsby-cli`がインストール済であること

## 各ライブラリのインストール
必要となるライブラリをインストールしていきます。
※[gatsby-starter-netlify-cms](https://github.com/netlify-templates/gatsby-starter-netlify-cms)をベースに作業する場合は、下記の`gatsby-transformer-remark`は既に入っているかと思います。

```shell
yarn add gatsby-transformer-remark gatsby-remark-prismjs prismjs
```

## 各ライブラリの説明
念のため各ライブラリをざっくりと説明します。

### gatsby-transformer-remark
- [gatsby-transformer-remark | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)
- [GitHub](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark)

`markdown`を`HTML`に変換するライブラリです。
類似のライブラリはいくつかありますが、私はこれを使っています。

### prismjs
- [Prism](https://prismjs.com/)
- [GitHub](https://github.com/PrismJS/prism)

軽量なシンタックスハイライトライブラリです。
いくつかテーマも用意されています。

### gatsby-remark-prismjs
- [gatsby-remark-prismjs | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/)
- [GitHub](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs)

`gatsby-transformer-remark`が`markdown`を`HTML`に変換する際に`prismjs`を用いるようにするライブラリです。

## 使用方法
`gatsby-config.js`に下記の記述を追加します。

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-prismjs`,
          options: {
            classPrefix: "language-",
            inlineCodeMarker: null,
            aliases: {},
            showLineNumbers: true,
            noInlineHighlight: false,
          },
        },
      ],
    },
  },
]
```
