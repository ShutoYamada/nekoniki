---
templateKey: blog-post
url: 20201007_react-native-safari-view
title: 【ReactNative】SafariViewを使う
date: 2020-10-06T23:14:09.634Z
description: |-
  Appleの審査結果の中で、外部ブラウザを呼び出している場合にSafari Viewの使用を勧められることがあります。
  これは、iOSのアプリ上でSafariと同様の挙動が行えるモジュールです。
  今回はReactNativeアプリでSafariViewを使う方法をご紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - safariview
  - ios
  - react-native-safari-view
  - react-native-webview
  - javascript
---
## 前提条件
- `react-native@0.63`

## ライブラリ
今回は`react-native-safari-view`を使います。
- [GitHub](https://github.com/naoufal/react-native-safari-view)
ちなみに`SafariView`は`iOS9`以降で利用可能です。

## インストール
```shell
yarn add react-native-safari-view
cd ios && pod install
```

## 使用方法
使用方法は`SafariView`の`show()`で表示したい`Web`ページの`URL`を指定するだけです。

```javascript
import React, { Component } from "react";
import { View, Button } from "react-native"
import SafariView from "react-native-safari-view";

class SafariViewSample extends Component {
  constructor(props) {
    super(props);
  }

  handlePressButton = () => {
    // isAvailable()でSafariViewが利用可能かチェック
    SafariView.isAvailable()
      .then(SafariView.show({
        // urlに表示させたいURLを指定
        url: "https://www.google.com/"
      }))
      .catch(error => {
        // エラー処理
        // iOS8以前などのSafariViewを利用できないOSは
        // ここでメッセージを表示する等で対応します。
        console.log("Safari View not available");
      });
  }

  render = () => {
    return (
      <View>
        <Button title="Open Safari View" onPress={this.handlePressButton} />
      </View>
    );
  }
}
```

## `react-native-webview`との違い
外部の`WEB`ページを表示させるライブラリとしては`react-native-webview`というものが有名です。
- [GitHUb](https://github.com/react-native-webview/react-native-webview)

あちらとの最大の違いは、**コンポーネントであるか否か**だと思います。
`react-native-safari-view`がボタンを押す等の関数の実行結果として`SafariView.show()`を実行した結果`SafariView`が表示されるのに対して、`react-native-webview`は`WebView`というコンポーネントを`render`の中に組み込んで描画します。

言い換えると、`react-native-webview`は`react`のライフサイクルの中に組み込むことができます。

また`react-native-webview`には`injectJavaScript`や`postMessage`といったプロパティが用意されており、「`WebView`の中で特定のボタンを押した際のイベントをアプリで拾わせる」のように**アプリとWEBページの挙動を連動させる**ことができます。

`react-native-safari-view`には今のところ(2020/10/07現在)そういった機能は用意されていないので、`SafariView`で入力した結果をアプリで直接受け取るということは基本的にできません。

## まとめ
今回は`SafariView`を`react-native`製アプリで使用するためのライブラリである`react-native-safari-view`を紹介しました。

有名どころだと`react-native-webview`を使うかもしれませんが、`iOS`に限定すればこういったライブラリもあるため、使い分けだと思います。
