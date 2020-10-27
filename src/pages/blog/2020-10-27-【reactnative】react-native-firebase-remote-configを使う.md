---
templateKey: blog-post
url: 20201027_react-native-firebase-remote-config
title: 【ReactNative】react-native-firebase/remote-configを使う
date: 2020-10-27T04:08:46.008Z
description: |-
  以前にreact-native-firebaseのセットアップ方法と各機能の簡単な説明についてご紹介しました。
  今回はその中の機能一つであるremote-configについてインストール方法や使い方を公式ソースに従ってご紹介します。
  アプリのバージョンを上げることなく内部的な設定値を更新でき、ABテストなどにも応用が効くため非常に有益な機能です。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react
  - react-native
  - react-native-firebase
  - remote-config
  - firebase
  - ios
  - android
---
## 前回の記事
- [【ReactNative】react-native-firebaseセットアップと機能一覧](https://nekoniki.com/20201013_react-native-firebase_setup)

## 前提条件
- `react-native@0.63.3`
- `@react-native-firebase/app@8.4.6`
- `@react-native-firebase/remote-config@9.0.11`
- [前回の記事](https://nekoniki.com/20201013_react-native-firebase_setup)のセットアップ作業が済んでいること

※セットアップが済んでいない場合は、`Firebase`のプロジェクト作成と`GoogleService-Info.plist`等のファイル組み込みを行うこと。

## Firebase Remote Configとは？
[公式「Firebase Remote Config」](https://firebase.google.com/docs/remote-config?hl=ja)には以下のように記載があります。

> アプリのアップデートを公開しなくても、アプリの動作と外観を変更できます。コストはかからず、1 日あたりのアクティブ ユーザー数の制限もありません。

とあるように「特定の設定値」を`Firebase`側管理にすることで、それらの変更を「アプリのアップデートなしに」行うことができます。

よくある「最新のバージョンに更新してください」のような表示も、`Remote Config`側で「強制アップデートが必要なバージョン数」という設定値を持たせておき、アプリ側のバージョンと突合することで実現できます。

## インストール

- [公式](https://rnfirebase.io/remote-config/usage)

既に`@react-native-firebase/app`をインストールされている方は1行目は不要です。

```shell
yarn add @react-native-firebase/app
yarn add @react-native-firebase/remote-config
```

### iOS
続いて`pod install`を行います。

```shell
cd ios && pod install
```

## Firebase側の設定
`Firebase`で作成済みのプロジェクトを開き、メニューから`Remote Config`を開きます。

以下のようにパラメータの入力画面が最初から開かれていると思うので、任意の値を入力します。

ここでは`test`というキーに対して`hoge`という値を設定します。

![remote-config1](/img/remote-config1.png "remote-config1")

入力が完了したら「パラメータを追加」を押して完了してください。

続いて以下のような画面に切り替わると思います。
これは現在このプロジェクトで保持している設定値の一覧です。

「ドラフト」の状態になっているものは、まだアプリケーション側には反映されておらず、画面上部の「変更を公開」を押すことで反映されます。

そのまま「変更を公開」を押して、入力内容を反映させましょう。

![remote-config2](/img/remote-config2.png "remote-config2")

## アプリ側の取得処理
大きく分けると3段階のフェーズがあり、それぞれ「初期値設定」「フェッチとアクティブ化」「値の取得」とします。

### 初期値設定
仮にアプリが`Firebase`と正常に通信できないまま動作した時用に、対応するキーに対して初期値を設定します。

```javascript
import React, { useEffect } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

function App() {
  useEffect(() => {
    remoteConfig()
      .setDefaults({
        // ここで先ほど作成した`test`というキーに`default`という初期値を設定する
        test: 'default',
      })
      .then(() => {
        console.log('初期値の設定が完了しました。');
      });
  }, []);
}
```

こうする事で、仮に`Firebase`から`test`の値を取得できなかった場合に`default`を値として扱うようになります。

### フェッチとアクティブ化
上記に追記してフェッチ・アクティブ化処理を記載します。
何をしているかというと、`Firebase`と通信して値を取得(フェッチ)して、端末内で有効化(アクティブ化)をしています。

イメージとしては`Firebase`側と同期を取っているフェーズで、取得した値を実際にコード上で扱うのは次の「値の取得」フェーズです。

```javascript
import React, { useEffect } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

function App() {
  useEffect(() => {
    remoteConfig()
      .setDefaults({
        // ここで先ほど作成した`test`というキーに`default`という初期値を設定する
        test: 'default',
      })
      .then(() => {
        console.log('初期値の設定が完了しました。');
        return () => remoteConfig().fetchAndActivate();
      })
      .then(fetchedRemotely => {
        if (fetchedRemotely) {
          console.log('フェッチ成功');
        }
        else {
          console.log('フェッチ失敗、もしくはフェッチ済み');
        }
      });
  }, []);
}
```

余談ですが、`remote-config`は読み取ってきた値をアプリケーション側にキャッシュとして保持します(デフォルトでは12時間)。
これは、値が頻繁に更新された場合にアプリケーション側の表示がコロコロと変わらないようにするためのものです。

もしキャッシュ時間を独自で定義したい場合は以下のように秒数指定ができます。

```javscript
// 10分間キャッシュ
remoteConfig().fetchAndActivate(600);
```

### 値の取得
ここまできたらあとは簡単です。
以下のようにして値を取得しましょう。

```javascript
// `test`の値を文字列型で取得
const test = remoteConfig().getValue('test').asString();
```

`getValue()`の後ろに`asString()`とあるように、目的の値の型によって`asBoolean()`や`asNumber()`など関数が違います。

また`getAll()`のように全ての値を一度に取得するような関数もあります。

```javascript
const parameters = remoteConfig().getAll();

Object.entries(parameters).forEach((kvp) => {
  const [key, entry] = kvp;
  console.log('Key: ', key); 
  console.log('Source: ', entry.getSource()); 
  console.log('Value: ', entry.asString()); 
});
```

## アプリ側で値が読み取れたか確認
実際に上記ソースをアプリケーションで動かしてみると、`Firebase`側のコンソール画面が下記のように変化すると思います。

![remote-config3](/img/remote-config3.png "remote-config3")

これは`remote-config`の値を正常に取得(フェッチ)できているということであり、実際にアプリ上で`test`というキーで`"hoge"`を扱うことができました。

## まとめ
今回は`Firebase Remote Config`の機能について`@react-native-firebase/remote-config`のインストールから使用方法までご紹介しました。

設定値はアプリ内部に持たせても機能しますが、バージョンアップの手間を減らすという意味で非常に有益だと思います。