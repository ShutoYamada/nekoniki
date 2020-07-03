---
templateKey: blog-post
url: 20200625_nobundle_url
title: 【ReactNative】No bundle URL presentエラーの対処法メモ
date: 2020-06-25T13:06:37.191Z
description: |-
  以前にMacでReactNativeの環境構築方法を紹介しました。
  久しぶりにゼロからプロジェクトを作ってビルドしてみると「No bundle URL present」が・・・
  今回は、その際の対処法を紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-cli
  - エラー
  - bundle.js
  - javascript
---
**※この記事は[Qiita](<>)に載せたもののリライト記事です。**

## 前提条件

* `react-native`のプロジェクト作成済
* `Mac`環境

## エラー内容

`Xcode`, ```VSCode``Homebrew```, `Nodebrew`, `cocoapods`, `npm`, `yarn`,`react-native-cli`などなど色々入れて新規にプロジェクトを作成。

```shell
react-native init Puni
cd Puni/ios
pod install
react-native run-ios
```

すると、`Simurator`が立ち上がり`bundle`も動いている様子。 
しかしながら下記のように`No bundle URL present`のエラーに遭遇。

![nobundle](/img/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e61702d6e6f727468656173742d312e616d617a6f6e6177732e636f6d2f302f3433353432392f34323135326336622d343361332d313161342d623332652d6462616636646161313832392e706e67.png)

どうやらアプリから`bundle`が見れていないようなのだが・・・
類似の事例を調べてみたら[React Native「No bundle URL present」エラー対策集](https://qiita.com/wktq/items/9139f4c0bdf52bd71c93)のような記事を発見。
パッケージを入れ直したり、キャッシュを消してみたり、と一通り試してみたが解消されず。

## 解決策

下記のような記事を発見。

[main.jsbundle file showing in my iOS project but still throwing “No bundle url present”](https://stackoverflow.com/questions/57822215/main-jsbundle-file-showing-in-my-ios-project-but-still-throwing-no-bundle-url-p)

なにやら`main.jsbundle`がうまく作成されていないっぽい？

解決策にある通りにコマンドラインから`main.jsbundle`を作り直してみる。

```shell
react-native bundle --entry-file='index.js' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios'
```

さらに`Xcode`から`xcworkspace`を開き、`main.jsbundle`の`Target Membership`を設定しなおす(下図)

![xcode_puni](/img/xcode_puni.png)

ダメ元で`react-native run-ios`を実行すると・・・
**直った!!**

## まとめ

何が悪さをして`main.jsbundle`が作成されていない(クラッシュしてる？)のかは今のところ分かっていないが、あるとすれば`react-native-cli`とかその他諸々の特定のバージョンの組み合わせのように思える。

`react-nativeのIssue`を`main.jsbundle`で調べた(リンクは[こちら](https://github.com/facebook/react-native/issues?utf8=✓&q=is%3Aissue+is%3Aopen+main.jsbundle))ら似たような事例が出ていたので、いずれ解消・再発するかもしれません。