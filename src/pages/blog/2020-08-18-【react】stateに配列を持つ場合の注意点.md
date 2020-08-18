---
templateKey: blog-post
url: 20200818_react_state_array
title: 【React】Stateに配列を持つ場合の注意点
date: 2020-08-18T07:37:55.099Z
description: |-
  Reactを初学者に教える機会があり、その時によくハマりがちなのが「stateに配列でデータを持たせた時に、正しく更新できていない」ケースです。
  エラーで落ちるわけでなく、renderがかからない等の気づきにくい不具合なので、原因特定がしにくいですが大体はこの記事の例に収まると思います。
featuredpost: false
featuredimage: /img/react.png
tags:
  - react
  - state
  - javascript
  - 配列
  - array
---
## 前提条件
- `react`の初級者向け
- コンポーネントの`state`に配列でデータを保持している

## 概要
`state`に配列としてデータを持っていて更新する場合、取得した配列を破壊的に変更してはいけません。
具体的には要素追加の`push`や要素削除の`splice`などがあたります。

```javascript

// state定義
this.state = {
  list : []
}

// ...略

let { list } = this.state;
// 要素の追加
list.push("Test"); // -> NG
// 要素の削除
list.splice(0,1); // -> NG

```

詳しく解説すると、`let { list } = this.state`で取得した`list`が参照渡しであるため、
内容を破壊的に変更すると`setState()`を待たずして値を書き換えてしまうためです。

```javascript
// 実質下記の記法と同じ
// setState以外の方法でstateを書き換えてもrenderが走りません
// 要素の追加
this.state.list.push("Test"); // -> NG
// 要素の削除
this.state.list.splice(0,1); // -> NG
```

## 解決策
スプレッド演算子`...`や`Array.from()`を使って、別インスタンスとして配列を持たせてから変更しましょう。

```javascript
// スプレッド演算子で配列を展開し、同じ値を持った別配列として再定義
let copyList = [...this.state.list];
// Array.from()でもOKです
// copyList = Array.from(this.state.list);

copyList.push("Test"); // -> OK
copyList.splice(0,1); // -> OK

this.setState({
  list : copyList,
})
```

## まとめ
今回は`react`初学者が陥りがちな`state`内の配列の扱い方についてご紹介しました。
ぱっと見は動作しますが、`render`が正しいタイミングでかからない等の不具合の原因となるので、しっかりと頭に入れておきましょう。