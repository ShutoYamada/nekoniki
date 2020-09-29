---
templateKey: blog-post
url: 20200930_target_container_is_not_a_dom_element
title: 【React】Target Container is not a DOM elementエラーの対処法
date: 2020-09-29T23:42:27.162Z
description: |-
  Reactを学習し始めて、基本的なことは大体身についたからいよいよ独自で考えたアプリを作ってみよう・・・
  と取り掛かった際に遭遇しやすいのがこのエラーです。
  今回は「Target Container is not a DOM element」エラーの対処法についてご紹介します。
featuredpost: false
featuredimage: /img/react.png
tags:
  - react
  - エラー
  - react-native
  - dom
---
## 前提条件
- `react`を使用していること

## エラー内容
だいたい以下のようなエラーが出るかと思います。

```
Error: Target container is not a DOM element.
```

## 原因
ざっくりとした解説ですが、`render`なり何なりの描画処理を行う場合は必ず実際の`HTML`要素である`DOM Element`を参照して行います。
その起点となる`DOM Element`が見つからない or `DOM Element`でない要素を指定していることが原因です。

ただ、実際には呼び出している関数の中で最終的にこのエラーが出ているだけの場合が多く、自身がコーディングしているソースが原因でこのエラーが発生することは稀です。

## 対応方法

### `root`より後に`<script>`を書く
`index.html`から自分の手でゴリゴリ書いている場合はこの対応方法で直る可能性があります。

`index.js`内で`ReactDOM.render()`を行いますが、その対象となるタグ(だいたいは`id="root"`のタグ)より後に`<script src="./bundle.js"></script>`の記載をしましょう。

### `<Provider>`を`div`タグで囲う
`react-redux`の`<Provider>`を使っている場合はこれで直る可能性があります。

`<Provider>`を`<div>`で囲うようにしましょう。

```javascript
<div>
  <Provider store={store}>
    {/* ...略... */}
  </Provider>
</div>
```

## まとめ
今回は、初学者がよく遭遇するであろう`Target container is not a DOM element`の対応方法についてご紹介しました。

このエラーに遭遇する段階では、まだエラー処理の知見もなく、原因不明のまま悶々とするというケースが多いので、そういった方の参考になれば幸いです。