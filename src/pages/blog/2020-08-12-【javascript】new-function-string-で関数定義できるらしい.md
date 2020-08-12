---
templateKey: blog-post
url: 20200813_new_function
title: 【Javascript】new Function(string)で関数定義できるらしい
date: 2020-08-12T23:16:21.544Z
description: |-
  最近たまたま知ったのですが、Javascriptでの関数定義の手法として面白い方法があったので紹介します。
  new Function(string)で文字列から関数が定義できます。
featuredpost: false
featuredimage: /img/js.png
tags:
  - javascript
  - function
  - 関数
---
## 前提条件
- `javascript`

## 構文

`new Function()`で関数を作成することができます。
任意の数の引数を先に渡し、最後に関数本体を文字列で渡します。

```javascript
let function = new Function ([arg1[, arg2[, ...argN]],] body)
```

## 例

以下のような方法で利用できます。

```javascript
// 引数がない場合は関数本体のみ指定
let dispMsg = new Function('alert("Hello World")');
dispMsg(); // --> alert("Hello World");

// 引数がある場合は本体より先に渡す
let dispMsg2 = new Function('msg', 'alert(msg)');
dispMsg2('Hoge'); // --> alert("Hoge");

// 複数引数も可能
let calc = new Function('x', 'y', 'return x + y');
calc(10, 5); // --> return 10 + 5
```

## 注意点

`new Function()`で生成する関数は、非常に汎用的ですが注意点があります。

### 引数以外の変数はグローバルしか参照できない。

`new Function()`で生成する関数で引数以外の変数を参照させる場合、グローバルスコープの変数しか参照できません。

例えば、下記のような例では`generateFunction`のスコープ内で定義された`msg`を参照することはできません。

```javascript
function generateFunction() {
  let msg = "Message";
  let function = new Function('alert(msg)')
  return function;
}

let f = generateFunction();
f(); // --> error

```

もしこれを実現する場合は、`msg`をグローバルスコープに置く必要があります。

```javascript
let msg = "Message";

function generateFunction() {
  let function = new Function('alert(msg)')
  return function;
}

let f = generateFunction();
f(); // --> alert("Message")
```

## まとめ
今回は`new Function()`を用いて関数を定義する方法を紹介しました。
この方法の最大のメリットは、関数本体を外部から受け取りことができることだと個人的には思います。
例えばサーバサイドから関数文字列を受け取って、クライアントサイドで実行する等のアクロバティックな使い方ができるかと思います。