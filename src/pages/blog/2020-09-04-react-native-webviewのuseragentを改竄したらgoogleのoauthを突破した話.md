---
templateKey: blog-post
url: 20200904_react_native_webview_useragent
title: react-native-webviewのuserAgentを改竄したらGoogleのOAuthを突破した話
date: 2020-09-04T10:14:29.708Z
description: >-
  react-native-webviewは以前ご紹介したとおり、既存のWeb資産をreact-nativeアプリ上で使いまわせるため非常に便利ですが、いくつか注意点があります。

  例えばOAuth認証をしている画面を描画した場合などです。特にGoogleはWebViewからのOAuth認証をブロックしているため、通常では利用することができません。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-webview
  - oauth
  - google
  - "403"
  - userAgent
---
## 前提条件
- `react-native-webview`を導入済み

## GoogleなどのOAuth等が行えない
`react-native-webview`で`Google`の`OAuth`を行う場合、`403`が返ってきて使用することができません。
これは、`Google`が[2016年に公開した記事](https://developers.googleblog.com/2016/08/modernizing-oauth-interactions-in-native-apps.html)でも語っているとおり、ネイティブの`web-view`からの認証をブロックしているためです。

`react-native`から`Google`の`OAuth`を行う場合、[google-signin](https://github.com/react-native-community/google-signin)などの専用ライブラリを使うことが推奨されています。

今回は、あくまで**裏技的**な方法で`react-native-webview`で`Google`の`OAuth`をできるようにした内容なので、実際にリリースするアプリ等で使用することはオススメしません。

## userAgentを改竄する
方法はいたって簡単で、`WebView`の`userAgent`を改竄するだけです。

どうやら`Google`側は`userAgent`の内容を参照しているようで、`403`が返るかどうかは下記のように分かれました。

```javascript
// NG
Mozilla/5.0 (Linux; Android 10; 【機種名】; wv)....

// OK
Mozilla/5.0 (Linux; Android 10; 【機種名】)....
```

どうやら`wv`の文字列の有無でチェックしているようです。

`react-native-webview`には`userAgent`というプロパティが用意されているので、そこに任意の内容を記載するだけで突破できました。

```javasctipt
import {WebView} from 'react-native-webview';

// ...略

<WebView source={{uri : "...任意のURL"}} userAgent={"test"} />
```

再度注意ですが、これはあくまで**裏技**のようなものです。
実際にアプリ開発を行う場合は、正規の方法で認証を行うようにしましょう。

## まとめ
今回は、`Google`の`OAuth`認証に関する`WebView`のブロックを`userAgent`の改竄という方法で突破できた件をご紹介しました。
内部的に`WebView`であるかどうかの判定はどうやっているのかな？と気になっていたので、`userAgent`で判別しているということが分かり、少し拍子抜けしました。
いずれこの抜け道も改修される可能性が高いので、認証を通す際は正規の手順で行いましょう。