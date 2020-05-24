---
templateKey: blog-post
title: Gatsbyの環境構築
date: 2020-05-24T02:56:27.590Z
description: |-
  今回は、このブログの基盤となっている「GatsbyJS」のセットアップ方法について紹介します。
  GatsbyはReactベースの静的サイトジェネレータで、非常に高速で動作します。
  このブログの画面間の遷移もサクサクと動いているので、通常のReact製アプリに比べると動作が早いことが分かると思います。
featuredpost: false
featuredimage: /img/how-to-build-simple-website-with-gatsbyjs-postcss-pt1.jpg
tags:
  - react
  - gatsby
  - npm
  - ブログ
  - gatsby-starter-netlify-cms
  - Netlify
  - Gatsby
  - GatsbyJS
---
![Gatsby](/img/how-to-build-simple-website-with-gatsbyjs-postcss-pt1.jpg "Gatsby-logo")

## 前提条件

* `npm`もしくは`yarn`をインストール済

## インストール

下記の手順に従って`gatsby-cli`をインストールします。

```shell
yarn global add gatsby-cli
```

## サイト作成・実行手順
下記手順に従ってサイトを作成し、実行します。

### サイトの作成

`gatsby new`コマンドでサイトを作成します。 
今回は[Quick Start | GatsbyJS](https://www.gatsbyjs.org/docs/quick-start)に従って`gatsby-site`という名前で作成します。

```shell
gatsby new gatsby-site
```

### developサーバの起動

作成したサイト直下に移動し、`gatsby develop`コマンドでデバッグ実行します。

```shell
cd gatsby-site
gatsby develop
```

デフォルトでは`localhost:8000`で立ち上がります。 
`http://localhost:8000`にアクセスすると、下記の通り表示されます。

![gatsby-default](/img/gatsby-start.png "gatsby-default")

※ホットリロードなので`src/pages`配下のソースを変更すると表示が変更されると思います。余裕がある方は試してみましょう！

## ビルド
`gatsby build`コマンドでビルドを行います。

```shell
gatsby build
```

また、ビルドした内容を自身の環境で確認する場合は`gatsby serve`コマンドで行えます。

```shell
gatsby serve
```

## スターターキットを使ってブログを構築する

これで`Gatsby`の大まかな概要は掴めたかなと思います。
しかしながらコツコツとソースを書いてブログを構築するのはなかなか大変です。
そこで`Gatsby`にはいくつかのスターターキットが用意されています。
主だったものは下記のページで確認できます。
- [Starter Library | GatsbyJS](https://www.gatsbyjs.org/starters/?v=2)

今回はその中の[gatsby-starter-netlify-cms](https://github.com/netlify-templates/gatsby-starter-netlify-cms)を使用したいと思います。
※このブログも同ライブラリを使っています。

### ダウンロード
`GitHub`からソースをcloneします。

```shell
git clone https://github.com/netlify-templates/gatsby-starter-netlify-cms.git gatsby-demo-app
```

### 動作確認

各種モジュールをインストールし、実行します。
```shell
yarn install
yarn start
```
正常なら`localhost:8000`で下記の通り表示されると思います。
デフォルトでは`Kaldi`のコーポレートサイトのような見た目になっているので、不要な要素や部品を削除していく必要があります。
例) プライバシーポリシーページの追加、製品ページの削除等

![Kaldi](/img/kaldi.png "kaldi")

## まとめ
今回は`GatsbyJS`の概要と簡単な扱い方を紹介しました。
`GatsbyJS`には今回紹介した`gatsby-starter-netlify-cms`以外にも様々なライブラリがあり、自身のWebサイトを自由にカスタマイズでき、かつ高速動作するというメリットがあります。
`Wordpress`などは、最初からなんでも揃っている分、動作がやや遅いというデメリットもあるため一長一短なのかなという印象です。
正直、**自分のポートフォリオサイト**や**個人開発のプロダクトサイト**なら手間もなく作れるため、非常に有益な技術だと思います。
大元の`React`や`Wordpress`に比べたら、書籍やブログ記事も少ないため手探りで作業する必要がありますが、それを差し引いても学んでおいて損はないのかなと思います！

## 参考

- [GatsbyJS公式](https://www.gatsbyjs.org)
- [GitHub](https://github.com/gatsbyjs/gatsby)