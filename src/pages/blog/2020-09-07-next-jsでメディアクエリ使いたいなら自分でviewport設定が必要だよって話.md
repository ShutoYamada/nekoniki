---
templateKey: blog-post
url: 20200907_next_viewport_mediaquery
title: Next.jsでメディアクエリ使いたいなら自分でviewport設定が必要だよって話
date: 2020-09-07T07:53:26.816Z
description: |-
  Next.jsでゴリゴリにSSRなWebアプリを開発されている方には何を今更な話ですが、割と知らないとハマる内容なので紹介します。
  Next.jsでメディアクエリを使いたい場合の設定についてです。
featuredpost: false
featuredimage: /img/next_logo.png
tags:
  - next
  - react
  - javascript
  - viewport
  - meta
  - media
  - css
---
## 前提条件
- `Next.js`で`SSR`を行っている

## 結論：`viewport`の設定は自分で行う
いきなり結論ですが、`Next.js`でメディアクエリを使いたい場合は自分で`viewport`の設定(`meta`タグの配置)を行う必要があるようです。
素の`React`はこのあたりの処理は自動でやってくれていたので、知らないとハマるかもしれません。

下記の公式にも`meta`タグを自分で埋め込んだサンプルがあります。
- [next/head | Next.js](https://nextjs.org/docs/api-reference/next/head)

以下公式より引用。

> We expose a built-in component for appending elements to the `head` of the page:

```javascript
import Head from 'next/head'

function IndexPage() {
  return (
    <div>
      <Head>
        <title>My page title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <p>Hello world!</p>
    </div>
  )
}

export default IndexPage
```

## まとめ
今回は、`Next.js`でメディアクエリを使う場合に`viewport`の設定は自分で行わなければならない件を紹介しました。
`React`に慣れていると、**「あれ？メディアクエリが効かない。なんで・・・？」**となりがちです。
知っていないと若干ハマるかもしれないので一応シェアしておきます。