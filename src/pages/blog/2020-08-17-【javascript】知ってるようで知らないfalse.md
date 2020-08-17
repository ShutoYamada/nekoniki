---
templateKey: blog-post
url: 20200818_javascript_bool
title: 【Javascript】知ってるようで知らないfalse
date: 2020-08-17T23:04:03.889Z
description: |-
  Javascriptの条件分岐でif(obj)のような書き方をします。
  objの型は様々だと思いますが、実際に真偽値として扱った際にどういった基準でtrue,falseと判定されるのかご紹介します。
featuredpost: false
featuredimage: /img/js.png
tags:
  - javascript
  - 真偽値
  - boolean
  - bool
  - number
  - "null"
  - undefined
  - "0"
  - 空文字
  - NaN
---
## 前提条件
- とくになし

## falseと判定されるのは6パターン
いきなり結論になりますが、真偽値として扱った際に`false`とされるのは6パターンしかありません。
以下、順を追って説明します。

### 1.boolean型のfalse
まず一番オーソドックスなのが、`boolean`としての`false`です。
当然`false`は`false`として扱われます。

```javascript
let t = true;
let f = false;

if(t) {
  // ここには入るが
}

if(f) {
  // ここには入らない
}
```

### 2.undefined型
これはご存知の方が多いかと思います。
`undefined`型も`false`として扱われます。
よくあるのがオブジェクトのプロパティを`if`でチェックしてからロジックを書くという手法です。
これは、オプショナルチェイニング演算子を使っても書くことができます。

```javascript
let obj = {
  a : "hoge"
}

let b = "";
if(obj.b) {
  // obj.bはundefinedなのでここには入らない
  b = obj.b;
}

// オプショナルチェイニング演算子を使っても書ける
b = obj?.b || "";
```

### 3.null型
上記とほぼ同じ使用感ですが`null`型も`false`です。
`undefined`との明確な違いは、`null`は開発者が意図的に`null`にすることが多いですが、`undefined`は上記例にもあるように外部から取得したデータ等、値が正確に取得できているかわからない場合に用いられます。

```javascript
let obj = {
  a : "hoge",
  b : null
}

if(obj.b) {
  // obj.bはnullなのでここには入らない
  // 以下略
}
```

### 4.number型の0
旧式のシステムだと`number`型でフラグを持っていたりしますが、そういった場合に`if`が意図しない挙動を起こしたらだいたいこれが原因です。
`Javascript`では`number`の`0`が`false`となるため、意図せず値を`0`にしたものを条件分岐で使用してしまうケースに注意が必要です。

```javascript
if(0){ 
  // 入らない
}
```

### 5.NaN
`NaN`も`false`になります。
これが原因で条件分岐が不具合を起こすというよりは、その前段階の処理が誤っていて出力が`NaN`になってしまった、というケースが多いです。
ちなみに`Infinity`は`false`にはなりません。

```javascript
if(NaN) {
  // 入らない
}

if(Infinity) {
  // 入る
}
```

### 6.string型の空文字
`string`型の空文字`""`も`false`になります。
`Web`系のシステムで、ラベルとして表示する文字列が存在する場合のみ要素として追加する、といった場合に用いられることが多いです。

```javascript
const str = "";
if(str) {
  // 入らない
}
```

## まとめ
今回は`false`として扱われるケースの全6種を紹介しました。
特に`number`の`0`や`string`の`""`は覚えておかないと思ってもみない動作を引き起こす可能性があります。
条件分岐が絡むロジックというのはシステムの規模に関わらず遭遇するため、覚えておくといいでしょう。