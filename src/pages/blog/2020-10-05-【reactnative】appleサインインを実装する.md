---
templateKey: blog-post
url: 20201005_react-native-apple-authentication
title: 【ReactNative】Appleサインインを実装する
date: 2020-10-05T07:17:46.204Z
description: >-
  AppleサインインはiOS13で追加された、AppleIDでログインを行うことができる機能です。

  それだけなら便利な機能が増えたなぁで済む話ですが、GoogleログインのようにSNSログインを行なっているアプリには、このAppleサインインが必須となります。

  今回はreact-native-apple-authenticationを使ったAppleサインインの方法をご紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-apple-authentication
  - apple
  - 審査
  - リジェクト
  - ios
---
## 前提条件

* `react-native@0.63`
* `@invertase/react-native-apple-authentication@2.0.2`

## 公式サイト

今回は`react-native-apple-authentication`を利用します。

* [GitHub](https://github.com/invertase/react-native-apple-authentication)

## インストール

```shell
yarn add @invertase/react-native-apple-authentication
cd ios && pod install
```

### XCode側処理

`XCode`を開き`Signing & Capabilitie`から`Sign in with Apple`の機能を追加しておきます。

![sign_in_with_app](/img/sign-in-with-apple.png "sign_in_with_app")


## 実装
[公式](https://github.com/invertase/react-native-apple-authentication)の実装からログインに必要な最小構成のみを切り出したものが以下になります。

本来ならここに加えて、ログイン状態の管理やログアウト等々を付け足すことでようやく製品としての品質となりますが、簡単のため割愛しています。

ポイントは`appleAuth.performRequest()`で、ここの引数に何の動作をするのかと、スコープとして何を設定するのかを指定します。
大体はユーザ名とメールアドレスで事足りるかと思います。

```javascript
import React from 'react';
import {Button, View, Text} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';

class Test extends React.Component {
  /**
   * コンストラクタ
   * @param props
   */
  constructor() {}

  handleAppleLogin = async () => {
    try {
      // Appleサインイン処理実行
      const appleAuthRequestResponse = await appleAuth.performRequest({
        // 処理種別の指定
        requestedOperation: appleAuth.Operation.LOGIN,
        // スコープの指定
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // サインインが行われた場合はappleAuthRequestResponseが取得される
      const {
        user,
        email,
        nonce,
        identityToken,
        realUserStatus,
      } = appleAuthRequestResponse;

      // 取得したappleAuthRequestResponseやその中のプロパティを使って
      // 既存のユーザ管理の仕組みと紐づける...
    } catch (error) {
      // エラー・キャンセル時処理...
    }
  };

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <Button onPress={this.handleAppleLogin} title="Apple Login" />
      </View>
    );
  }
}
```

## おまけ
冒頭でも書いた通り、この`Apple`サインインは他の`SNS`ログインを実装している場合は必須の機能となります。
もし実装しないまま`AppStore`への公開申請を出すと、審査の段階で下記のようなリジェクト通知が届きます。

> #### Guideline 4.8 - Design - Sign in with Apple
> 
> We noticed that your app uses a third-party login service but does not offer Sign in with Apple. Apps that use a third-party login service for account authentication must offer Sign in with Apple to users as an equivalent option.
> 
>Next Steps
> 
> To resolve this issue, please revise your app to offer Sign in with Apple as an equivalent login option.
> 
> Resources
> 
> - Review the sample code on Apple Developer Support to learn more about implementing Sign in with Apple in your app.  
> - Read the Sign in with Apple Overview to learn more about the benefits Sign in with Apple offers users and developers.
> 
> Please see attached screenshot for details.

`Apple`の審査は厳しく、ここ以外でも何度もつまづく可能性があるため、必須の項目は早めに潰しておくといいと思います。

## まとめ
今回は`react-native-apple-authentication`を用いた`Apple`サインインについてご紹介しました。
他の`SNS`ログインを実装している場合は必須の機能(これを付けていないと審査段階でリジェクトされてしまいます)なので、早い段階で組み込んでおくことをオススメします。