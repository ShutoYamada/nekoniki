---
templateKey: blog-post
url: 20200623_reactnative_customfont
title: ReactNativeアプリにカスタムフォントを導入する
date: 2020-06-23T08:51:19.988Z
description: |-
  ReactNativeで作成したアプリに独自のフォントを導入したい場合があるかと思います。
  今回は、ReactNative製アプリに対してカスタムフォントを導入する場合の方法をご紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - カスタムフォント
  - ttf
---
## 前提条件

* `ReactNative`でプロジェクトが作成済みであること

## ttfファイルをダウンロードする

今回はサンプルとして[dafont](https://www.dafont.com)より任意のファイルをダウンロードします。
※もちろん、手元に目的のフォントがあるならそちらを利用しても構いません
この記事では`Brotherline`と`Highlight`という2種類のフォントファイルをダウンロードしたものとします。

## assetsフォルダの作成

プロジェクト直下に`assets/fonts`を作成し、その中に取得してきた`*.ttf`ファイルを配置します。

## assetsの設定

ここからは2通りの設定方法があります。

### 方法① package.jsonにrnpmを記載する

よく見かける方のやり方です。 先ほど作成した`assets/fonts`までのパスを記載します。

```json:title=package.json
{
    "rnpm" : {
        "assets": ["./assets/fonts/"]
    }
}
```

その上で`react-native link`を実行します。

```shell
react-native link
```

これでも問題なく動きましたが、下記の警告が出ていました。

```shell
warn Your project is using deprecated "rnpm" config that will stop working from next release. Please use a "react-native.config.js" file to configure the React Native CLI. Migration guide: https://github.com/react-native-community/cli/blob/master/docs/configuration.md
```

どうやら以降のリリースで`rnpm`が使えなくなるとのこと。 
`rnpm`は`ReactNative`のパッケージマネージャのことで、ざっくり説明するとネイティブモジュールへの操作を`ReactNative`のパッケージ名から類推して行ってくれる賢いヤツです。

代替方法としては警告文の中にある`react-native.config.js`を使います。

### 方法② react-native.config.js

プロジェクト直下に`react-native.config.js`を作成し、下記のような内容にします。 ほとんど`rnpm`で書いてある内容と同じです。

```javascript:title=react-native.js
module.exports = {
    assets: ['./assets/fonts/'],
};
```

あとは同じように`react-native link`を実行。

```shell
react-native link
```

これでカスタムフォントを使う準備が整いました。

# 実装

ここまできたら後は簡単です。 カスタムフォントを適用したい箇所のスタイルに`fontFamily`を指定すればOKです。

```typescript:title=HogeComponent.tsx
<Text style={{fontSize : 20, textAlign : 'center'}}>This text is default font.</Text>
<Text style={{fontSize : 20, textAlign : 'center'}}>この文章はデフォルトのフォントを使用</Text>
<Text style={{fontFamily : 'Highlight', fontSize : 20, textAlign : 'center'}}>This text is using Highlight.</Text>
<Text style={{fontFamily : 'Highlight', fontSize : 20, textAlign : 'center'}}>この文章はHighlightフォントを使用</Text>
<Text style={{fontFamily : 'Brotherline', fontSize : 20, textAlign : 'center'}}>This text is using Brotherline.</Text>
<Text style={{fontFamily : 'Brotherline', fontSize : 20, textAlign : 'center'}}>この文章はBrotherlineフォントを使用</Text>
```

## 出力結果

![customfont](/img/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e61702d6e6f727468656173742d312e616d617a6f6e6177732e636f6d2f302f3433353432392f37326462333131332d653766332d653032392d393037622d3237656263333034303530372e706e67.png)

# まとめ

今回は`ReactNative`でのカスタムフォントの使い方をまとめました。
実装例では部分的にフォントを変えるだけに留めましたが、アプリ全体のフォントを変えるには`Text`をラップした`FC`を作っておいて基本はそれを利用する等々の工夫が必要かもしれません(もしかしたらもっと簡単にできる方法もあるかも...)