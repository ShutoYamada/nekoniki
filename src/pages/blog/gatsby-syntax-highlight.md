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
  - markdown
---
![gatsby](/img/how-to-build-simple-website-with-gatsbyjs-postcss-pt1.jpg)

## 前提条件

* `gatsby-cli`がインストール済であること

## 各ライブラリのインストール

必要となるライブラリをインストールしていきます。
※[gatsby-starter-netlify-cms](https://github.com/netlify-templates/gatsby-starter-netlify-cms)をベースに作業する場合は、下記の`gatsby-transformer-remark`は既に入っているかと思います。

```shell
yarn add gatsby-transformer-remark gatsby-remark-prismjs prismjs
```

## 各ライブラリの説明

念のため各ライブラリをざっくりと説明します。

### gatsby-transformer-remark

* [gatsby-transformer-remark | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)
* [GitHub](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark)

`markdown`を`HTML`に変換するライブラリです。 
類似のライブラリはいくつかありますが、私はこれを使っています。

### prismjs

* [Prism](https://prismjs.com/)
* [GitHub](https://github.com/PrismJS/prism)

軽量なシンタックスハイライトライブラリです。 
いくつかテーマも用意されています。

### gatsby-remark-prismjs

* [gatsby-remark-prismjs | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/)
* [GitHub](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs)

`gatsby-transformer-remark`が`markdown`を`HTML`に変換する際に`prismjs`を用いるようにするライブラリです。

## 設定

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

さらに`gatsby-browser.js`に使用したい`prismjs`のテーマを指定します。 
このブログでは`prism-okaidia.css`を使用しているため下記のようになります。

```javscript:title=gatsby-browser.js
require("prismjs/themes/prism-okaidia.css")
```

あとは細かく`CSS`を指定して完了です。 
このブログの場合は`global.scss`に下記の通りに指定しています。

```scss:title=global.scss
pre[class*='language-'] {
  background-color: #1c1b1b;
  display: block;
  margin: 0 0 20px !important ;
  padding-right: 1rem;
  padding-left: 2rem;
  border-radius: 0 4px 4px 4px;
}

code[class*='language-'],
pre[class*='language-'] {
  color: #fff;
}

:not(pre)>code[class*='language-text'] {
  padding: 2px 10px 3px 12px;
  margin: 0 ;
  color : #f14668 !important ;
  text-shadow: none !important ;
  background-color: whitesmoke !important ;
}

.gatsby-highlight-code-line {
  background: #545454;
  display: block
}
```

※いくつか`!important`を指定しているのは、本来なら上位のスタイルである`prism-okaidia.css`が優先されてしまう箇所を変更するためです。 
そこまで細かいデザインに拘らない場合はこの指定は不要です。

## 使用方法

あとは`GitHub`や`Qiita`等と同じようにコードブロックを書くだけです。 
バッククォート3つで囲います。 ※下記は`\`でエスケープしているため注意。

````javascript
\```javascript
const hoge = 'hogehoge';
\```
````

これが下図のように表示されます。

![syntax](/img/syntax.png "syntax")

## タイトルを表示する

ソースファイルのタイトルを表示する場合は追加で`gatsby-remark-prismjs-title`を使用します。 
コードスニペットの前にタイトルを表示させるライブラリです。

* [gatsby-remark-prismjs-title | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-prismjs-title/)

### インストール

```shell
yarn add gatsby-remark-prismjs-add-title
```

### 設定

`gatsby-config.js`の`'gatsby-transformer-remark'`の`plugins`に追記する形で記載します。 
他のコードブロックに関わるライブラリより先に記載する必要があるので、先頭に書いておくと無難です。

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-prismjs-title',
          options: {
            className: 'your-custom-class-name'
          }
        }
      ]
    }
  }
]
```

タイトル部分も必要に応じてスタイルを設定しましょう。 
このブログは下記の通りとなっています。

```scss:title=global.scss
.gatsby-code-title {
  background: #2e96b5;
  color: #eee;
  padding: 6px 12px;
  font-size: 0.8em;
  line-height: 1;
  font-weight: bold;
  display: table;
  border-radius: 4px 4px 0 0;
}
```

### 使用方法

タイトルがある場合は`:title=xxx`を記載します。

````javascript
\```javascript:title=fuga.js
const fuga = 'fugafuga';
\```
````

これが下図のように表示されます。

![syntax-titled](/img/syntax-titled.png "syntax-titled")

## まとめ
今回は複数のライブラリを用いて`Gatsby`製のブログにシンタックスハイライトを導入しました。
技術系ブログを運営していく上では必須の機能なので、今回の記事が参考になりましたら幸いです。