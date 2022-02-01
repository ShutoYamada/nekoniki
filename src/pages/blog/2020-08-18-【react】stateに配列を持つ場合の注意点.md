---
templateKey: blog-post
url: 20200818_react_state_array
title: 【React】Stateに配列を持つ場合の注意点
date: 2020-08-18T07:37:55.099Z
description: |-
  Reactを初学者に教える機会があり、その時によくハマりがちなのが「stateに配列でデータを持たせた時に、正しく更新できていない」ケースです。
  エラーで落ちるわけでなく、renderがかからない等の気づきにくい不具合なので、原因特定がしにくいですが大体はこの記事の例に収まると思います。
featuredpost: true
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

```jsx
import {useState} from 'react';

const AnyComponent = () => {
  const [list, setList] = useState([1,2,3]);

  return (
    <>
      <p>配列の要素一覧</p>
      <ul>
      {list?.map((value) => {
        return (
          <li>{value?.toString()}</li>
        )
      })}
      </ul>
      <button onClick={() => {
        // 要素の追加
        list.push(100); // --> NG
      }}>
        push
      </button>
      <button onClick={() => {
        // 要素の削除
        list.splice(0,1); // --> NG
      }}>
        splice
      </button>
    </>
  )
}

export default AnyComponent;
```

詳しく解説すると、`useState`で取得した`list`が参照渡しであるため、
内容を破壊的に変更すると`setList()`を待たずして値を書き換えてしまうためです。
`React`のお作法として以下のような処理をやっていけないのと同じ理由でNGということです。

```javascript
let [list, setList] = useState([1,2,3]);
// これはNG
list = [4,5,6];
```

## 解決策
スプレッド演算子`...`や`Array.from()`を使って、別インスタンスとして配列を持たせてから変更しましょう。

```js
const [list, setList] = useState([1,2,3]);

// スプレッド演算子で配列を展開し、同じ値を持った別配列として再定義
let copyList = [...list];
// Array.from()でもOKです
// copyList = Array.from(list);

copyList.push(100); // -> OK
copyList.splice(0,1); // -> OK

// 略
setList(copyList);
```

### 応用：pushやspliceしたものをsetStateしたいだけの場合コールバックを使うのも手
上記の例は以下のように置き換えることもできます。

```js
const [list, setList] = useState([1,2,3]);

// push
setList((currentList) => {
  // 現在のstateの値に100を追加してsetする
  return [...currentList, 100];
})

// splice
setList((currentList) => {
  // 現在のstateの値から先頭1件を除いてsetする
  const afterList = [...currentList].splice(0,1);
  return afterList;
});
```

`useState`で返される二つ目の戻り値(以下、`setState()`とします)は、単純に「セットしたい値」を渡すだけでなく、「現在の`state`の値を引数に、セットしたい値を返す関数」を渡すこともできます。
これは旧式の書き方であるクラスコンポーネントの`this.setState`でも同じ仕様です。

`state`の値を一旦変数に書き出して、それを加工してさらにセットするような書き方をしている場合、
こちらの書き方の方がコード量も抑え目にできるので、興味のある方は試してみてください。

## まとめ
今回は`react`初学者が陥りがちな`state`内の配列の扱い方についてご紹介しました。
ぱっと見は動作しますが、`render`が正しいタイミングでかからない等の不具合の原因となるので、しっかりと頭に入れておきましょう。