---
templateKey: blog-post
url: 20200622_reactnative_webview
title: react-native-webviewを使って既存Webページを使い回す
date: 2020-06-22T10:15:24.162Z
description: >-
  ReactNativeを使って既存Webサービスのアプリ版を開発している場合、一部のアプリ独自の機能(例えばプッシュ通知やカメラ)を除いては既存ソースを流用できる場合があります。

  例でいうと、ユーザ情報画面は既存のWebのマイページをそのまま表示するとかです。

  その場合、WebViewを使うことになると思います。

  ReactNativeでいうところのWebViewはreact-native-webviewを使うことになりますが、ここで問題になってくるのがReactNative側のコードとWebView側のコードの連携処理です。

  先のマイページの例でいうと、WebView側のマイページ画面のソースコードにReactNative側からユーザ情報を渡してあげなければ成立しません。

  今回はreact-native-webviewを導入した上で、WebViewとの値の受け渡し方法について調べました。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-webview
  - typescript
---
## 注意事項
この記事は[Qiita -【ReactNative】WebViewを使って既存資産を使い回す](https://qiita.com/drafts/4d9e5c16fa48bb8655f2/edit)のリライト記事です。

## 前提条件
- `react-native`でプロジェクト作成済

## ライブラリインストール
今回は`react-native-webview`を使用します。
- [GitHub](https://github.com/react-native-community/react-native-webview)

```shell
yarn add  react-native-webview
```
### iOSのみ
`pod install`を行います。

```shell
cd ios && pod install
```

## 使い方
単純にWebページを表示するだけでなく、アプリとWebページ間での値の受渡しができます。
よって、ログイン画面をWebページ側で作って、ログイン後画面をアプリで実装なんてこともできます。

### WebViewに値を渡す

`WebView`に値を渡す場合は`injectedJavaScript`を使います。
`injectedJavaScript`には文字列型で`Javascript`のコードを渡せます。

```typescript:title=WebViewComponent.tsx
import React from 'react';
import { WebView } from 'react-native-webview';

// WebViewに渡すコード
const injectedCode : string = `
    function fireInjectedJavaScript(){
        alert('ReactNativeから渡されたコードを実行しました!');
    }
`;

// WebViewで表示させるHTML
const html : string = `
      <html>
      <head>
      </head>
      <body>
        <h1>Title</h1>
        <form name="test">
            <input type="button" value="injectedJavaScript" onClick="fireInjectedJavaScript()">
        </form>
      </body>
      </html>
`;

// ...割愛

render(
    <WebView source={{html : html}} injectedJavaScript={injectedCode} />
);
```

`html`中のボタンで`fireInjectedJavascript()`を実行していますが、これは`ReactNative`側から渡された関数です。
よって、アプリで表示された場合のみ特定の処理を行うような作りにすることもできます。

渡したコードは`WebView`が描画された後に実行されるため、`jQuery`や`document.getElementById`なんかを使って`WebView`側の特定のフォームの値や表示をいじることもできます(上記のマイページの例ではこの方法を使ってユーザ情報を渡す)。

### WebViewから値を貰う
逆に`WebView`側から何らかのデータを受け取りたい場合は`onMessage`を使います。

```typescript:title=WebViewComponent2.tsx
import React from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

// WebViewで表示させるHTML
const html : string = `
      <html>
      <head>
        <script>
            // WebViewが読み込まれた時にデータを送信
            window.onload = function() {
                window.ReactNativeWebView.postMessage("onload")
            };

            // 定期的に実行(ポーリングなんかに使える？？)
            setInterval(function () {
                window.ReactNativeWebView.postMessage({hoge : "setInterval"})
            }, 2000)

            // 特定の処理実行時にデータを送信
            function firePostMessage(){
                window.ReactNativeWebView.postMessage("button click")
            }
        </script>
      </head>
      <body>
        <h1>Title</h1>
        
        <form name="test">
            <input type="button" value="postMessage" onClick="firePostMessage()">
        </form>
      </body>
      </html>
`;

// ...割愛

// onMessage発火時処理
public onMessageFromHtml(event : WebViewMessageEvent) {
    console.log(event.nativeEvent.data);
}

render(
    <WebView source={{html : html}} onMessage={onMessageFromHtml} />
);
```
上記の例では`WebView`読み込み時に実行と、定期的に実行、ボタンを押した時に実行、と３パターンを盛り込んでいます。
いずれの場合も`window.ReactNativeWebView.postMessage`を実行しており、`ReactNative`側では`WebViewMessageEvent`型で受け取ります。
渡された値自体は`WebViewMessageEvent`の`nativeEvent.data`の中に格納されています。
`nativeEvent.data`は`react`の`BaseSyntheticEvent`のジェネリクスとなっているため型は自由です(setIntervalのようにオブジェクトを渡すこともできます)。

## まとめ
今回は`react-natiev-webview`をインストールし、`ReactNative`と`WebView`間でのデータの受け渡し方法を紹介しました。
既存のソースを使いまわせるので非常に有効な手ではないかと思います。