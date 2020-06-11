---
templateKey: blog-post
url: 20200609_gatsby-sitemap-robots
title: Gatsbyブログにrobots.txtとsitemap.xmlを配置する
date: 2020-06-09T12:53:50.460Z
description: |-
  今回はGatsbyブログにrobots.txtとsitemap.xmlを配置する方法をご紹介します。
  どちらも必須ではありませんが、SEOを行っていく上では欠かせないものです。
featuredpost: false
featuredimage: /img/gatsby.jpg
tags:
  - react
  - gatsby
  - GatsbyJS
  - javascript
  - react
  - ブログ
  - SEO
  - seo
  - robots.txt
  - sitemap.xml
  - 検索エンジン
---
![Gatsby](/img/gatsby.jpg "Gatsby-logo")

## 前提条件
- `gatsby`プロジェクト作成済

## ライブラリのインストール
今回は`gatsby-plugin-robots-txt`と`gatsby-plugin-sitemap`を使用します。
それぞれ`robots.txt`と`sitemap.xml`を生成してくれるライブラリです。

- [Creating a Sitemap | GatsbyJS](https://www.gatsbyjs.org/docs/creating-a-sitemap/)
- [gatsby-plugin-robots-txt | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-plugin-robots-txt/)

```shell
yarn add gatsby-plugin-robots-txt　gatsby-plugin-sitemap
```

## 設定
`gatsby-config.js`の`plugins`に追記します。

```javascript:title=gatsby-config.js
plugins: [
  `gatsby-plugin-sitemap`,
  'gatsby-plugin-robots-txt',
]
```


## 使用方法
ローカルでビルドを実行してみましょう。

```shell
yarn run build
```

正常に動作していれば`public`直下に`robots.txt`と`sitemap.xml`が出来上がっているはずです。
例えばこのサイト(`nekoniki.com`)の場合は、下記の箇所にそれぞれ配置されています。

- [https://nekoniki.com/sitemap.xml](https://nekoniki.com/sitemap.xml)
- [https://nekoniki.com/robots.txt](https://nekoniki.com/robots.txt)


## まとめ
今回は`Gatsby`製ブログで、`robots.txt`と`sitemap.xml`を生成するライブラリを紹介しました。
`SEO`を進める上ではほぼ必須といえるライブラリです。
導入も簡単ですので、是非一度お試しください。