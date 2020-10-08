---
templateKey: blog-post
url: 20201008_vue_create
title: 【Vue+Typescript】セットアップから実行まで
date: 2020-10-08T07:11:10.076Z
description: |-
  普段はもっぱらReactを使っていますが、最近Vueを使う機会がありました。
  その際のセットアップからプロジェクトを実行して動かすまでの手順をまとめたので記事にしたいと思います。
  ReactでTypescriptを使うことが多かったので、VueでもTypescriptでプロジェクトを作成しました。
featuredpost: false
featuredimage: /img/vue.png
tags:
  - vue
  - typescript
  - javascript
  - vscode
  - 環境構築
  - セットアップ
---
## 前提条件

- `Node`インストール済

## CLIインストール

まずは`CLI`をインストールします。 
`Vue`用のコマンドランツールで、`React`でいうところの`create-react-app`のようなものです。

```shell
yarn global add @vue/cli
```

### インストール後確認

`--version`コマンドを実行してインストールされているか確認します。

```shell
vue --version
```

下記のようにバージョンが表示されていればOKです。

```shell
@vue/cli 4.5.7
```

### ※プロキシ環境下で仕様する場合

`HTTP_PROXY`などの環境変数にプロキシ設定を通しておきましょう。

## プロジェクト作成

`create`コマンドでプロジェクトを新規作成します。

```shell
vue create ts_vue_app
```

下記のように`v2`系を使うか`v3`系を使うかを聞かれます。
先にオプションで使用する機能を選びたいので、ここではどちらも選ばずに、**[Manually select features]**
を選びます。

![vue_create_1](/img/vue_create_1.png "vue_create_1")

すると使用する機能を聞かれるので、`Typescript`と`Router`を選びましょう。

![vue_create_3](/img/vue_create_3.png "vue_create_3")

改めて`v2`系か`v3`系かを聞かれます。
`v3`系を選びましょう。

![vue_create_4](/img/vue_create_4.png "vue_create_4")

`class-style`を使うかを聞かれます。
使用するので`y`と入力しましょう。
※以降もいろいろ聞かれますが、全てデフォルトにしました。

![vue_create_5](/img/vue_create_5.png "vue_create_5")

続けて`yarn`か`npm`のどちらを使うかを聞かれます。
こちらは`yarn`を選択します。

![vue_create_2](/img/vue_create_2.png "vue_create_2")

しばらく待つとプロジェクトが作成されます。
`VSCode`で開いてみます。
また、`yarn install`でモジュール一式をインストールしましょう。

```shell
cd ts_vue_app && code ./
```

## VSCode拡張
`Vue`開発におけるオススメの拡張機能は以下の通りです。

### Vetur
シンタックスハイライトやスニペット等、`Vue`における開発に必要な機能が一式揃っています。
カスタマイズも効きやすいので、以下の公式ドキュメントを一読することをオススメします。

- [Vetur](https://vuejs.github.io/vetur/snippet.html)

インストールは下記コマンドで行います。
```shell
code --install-extension octref.vetur
```

## プロジェクト実行
次に、作成したプロジェクトを動かします。
まずはモジュール一式をインストールしましょう。

```shell
yarn install
```

それでは早速実行してみましょう。
実行は`yarn serve`で行います。

```shell
yarn serve
```

成功した場合は`localhost:8080`で下記画面が表示されます。

![vue_create_6](/img/vue_create_6.png "vue_create_6")

`src/components`や`src/views`以下のファイルが描画に関わるファイルなのでこれらを変更してみましょう。
`React`と同じようにホットリロードがかかるので、変更内容が即時反映されます。

## まとめ
今回は`Vue`+`Typescript`の環境構築手順と、オススメの`VSCode`拡張についてご紹介しました。

`React`に慣れた方だと特に`.vue`ファイルの記法が取っつきにくいように感じるかもしれません。
細かい記法や、ライブラリの紹介についてはまた後の機会としたいと思います。