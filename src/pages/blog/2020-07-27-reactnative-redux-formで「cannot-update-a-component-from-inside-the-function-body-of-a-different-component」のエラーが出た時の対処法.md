---
templateKey: blog-post
url: 20200727_redux_form_warning
title: ReactNative+redux-formで「Cannot update a component from inside the
  function body of a different component」のエラーが出た時の対処法
date: 2020-07-27T07:01:26.149Z
description: |-
  先日、ReactNativeとredux-formを使ったアプリでWarningが出ました。
  ちょっと難解な内容だったので対処法をメモとして残します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - redux-form
  - warning
---
## 前提条件
- `react-native`を使用
- `redux-form`を使用

## 発生環境
- `react : 16.13.0`
- `react-native : 0.63.1`
- `redux-form : 8.3.5`

## Warning内容

```
Warning: Cannot update a component from inside the function body of a different component.
```

## 調査
調べたところ、同様のWarningが発生している例をいくつか見かけました。

- [【React】Warning: Cannot update a component from inside the function body of a different component.](https://qiita.com/koichiba/items/e0d772022baf94d48419)
- [redux-form で Warning: Cannot update a component from inside the function body of a different component.](https://qiita.com/yutomaeda5510/items/678bf450b0b856a65926)

原因はメッセージにある通りで、対象のコンポーネントを描画中に他コンポーネントの`setState`を呼んでいることが原因のようです。

しかし、どうも発生箇所は`redux-form`中の様子。
※正確には、`redux-form`の`validate`で各`Field`に対して`error`を発生させた場合に起きている。

[redux-formのIssue](https://github.com/redux-form/redux-form/issues/4619)を見ると、`react`のバージョンを`16.13.1`に上げればいいようなので上げてみることに。

```shell
yarn upgrade react --latest
```

しかしこれでも発生する。
ダメ元で`redux-form`のバージョンも最新にしてみる。

```shell
yarn upgrade redux-form --latest
```

これで直った。

## まとめ
今回は`Warning: Cannot update a component from inside the function body of a different component.
`の対処方法を記載しました。
ライブラリ依存の`Warning`や`Error`はちょくちょく見かけるので、初歩ではありますが何かあったら`Issue`をチェックするといいかと思います。