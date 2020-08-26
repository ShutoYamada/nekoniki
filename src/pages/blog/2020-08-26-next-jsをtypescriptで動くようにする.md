---
templateKey: blog-post
url: 20200826_nextjs_setup
title: Next.jsをTypescriptで動くようにする
date: 2020-08-26T07:28:46.400Z
description: |-
  Reactを学習し始め、だんだんと知識を深めてくるにつれて自然とNext.jsを知るようになると思います。
  ルーティングやらSSRやら、React単体だとどうも手間がかかる部分を吸収してくれるナイスなライブラリです。
  今回はcreate-next-appで作成したプロジェクトをTypescript対応させるまでの手順を紹介します。
featuredpost: false
featuredimage: /img/next_logo.png
tags:
  - react
  - next
  - javascript
  - ssr
  - node
  - npm
  - yarn
  - セットアップ
  - other
---
## 前提条件
- `node`導入済み
- `next : 9.5.2`
- `react : 16.13.1`

## `create-next-app`インストール
`Next`版の`create-react-app`です。
- [npm](https://www.npmjs.com/package/create-next-app)

```shell
yarn global add create-next-app
```

## プロジェクト作成
任意のディレクトリで下記コマンドを実行します。
プロジェジェクト名は`next-sample`とします。

```shell
create-next-app next-sample
```

作成したら`next-sample`直下に移動します。

```shell
cd next-sample
```

## `tsconfig.json`の作成
まず`tsconfig.json`を作成します。

```shell
touch tscofig.json
```

## `@types`系のインストール
`Typescript`で記載するので`@types`系のモジュールが必要になります。
下記コマンドでインストールします。

```shell
yarn add --dev typescript @types/react @types/node
```

## `*.js`ファイルをリネーム
今回扱うバージョンでは`pages/_app.js`と`pages/index.js`というファイルを`*.tsx`形式にリネームします。

```shell
mv pages/_app.js pages/_app.tsx
mv pages/index.js pages/index.tsx
```

## 実行
`yarn dev`コマンドでデバッグ実行します。
正常に完了した場合、下記の表示がされます。

```shell
ready - started server on http://localhost:3000
```

これに従い`http://localhost:3000`にアクセスします。

![next_setup](/img/next_setup.png "next_setup")

無事表示がされていました。
ホットリロードも効いているため、先ほどリネームした`pages/index.tsx`を編集すれば表示も変わります。

## GitHubに公開しました
- [GitHub | ShutoYamada/next-sample](https://github.com/ShutoYamada/next-sample)

## まとめ
今回は`Next.js`で作成したばかりのプロジェクトを`Typescript`対応させる手順を紹介しました。
これを基準にあれこれカスタマイズしながら学習していこうと思います。