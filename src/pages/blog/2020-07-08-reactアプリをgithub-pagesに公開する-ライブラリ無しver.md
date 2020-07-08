---
templateKey: blog-post
url: 20200708_react_githubpages
title: ReactアプリをGitHub Pagesに公開する(ライブラリ無しver)
date: 2020-07-08T12:37:31.879Z
description: |-
  今回は、Reactでアプリを作ってGitHub Pagesで公開する手順を紹介します。
  何回もやる作業なのですが、そんなに頻度が高いものではないので色々と忘れがちです。
  今回は、最もオーソドックスな方法を取るためgh-pages等のライブラリは使用しません。
featuredpost: false
featuredimage: /img/react.png
tags:
  - github
  - git
  - react
  - web
---
## 前提条件
- `react`を理解している

## プロジェクト作成
`create-react-app`で行います。
もちろん、既にあるプロジェクトを使っても構いません。

```shell
create-react-app hoge
```
## package.jsonの修正
`GitHub Pages`は`master`ブランチの`docs`ディレクトを`Web`ページとして公開することができます。
そこで、`package.json`の中身を修正して`docs`ディレクトリが生成されるようにします。

```json:title=package.json
{
  "scripts": {
    "build": "react-scripts build && mv build docs"
  },
  "homepage": "https://【GitHubユーザ名】.github.io/【リポジトリ名】"
}
```

`npm run build`コマンドで`build`が行われたあとに`build`フォルダを`docs`へ移動します。

```shell
npm run build
```

## リポジトリ設定
あとはリポジトリを指定して`push`するだけです。

```shell
git remote add origin https://github.com/【ユーザ名】/【リポジトリ名】.git
git add .
git commit
git push origin master
```
## Git側の設定
`GitHub`にログインして、対象のリポジトリを開きましょう。
`Settings`の`GitHub Pages`の項目で、`Source`を`master branch/docs folder`にします(下図参照)。

![githubpages](/img/githubpages.png "githubpages")

あとは少し時間を置いて先ほどの`package.json`で指定した`homepage`の`URL`にアクセスするだけです。

## まとめ
今回は`react`で作ったアプリを`GitHub Page`で公開する際の手順について紹介しました。
慣れてくると自然とできるようになりますが、最初のうちは取っつきづらいかもしれません。
別な方法として`gh-pages`といったライブラリを使う方法もありますが、そちらもいずれ紹介したいと思います。