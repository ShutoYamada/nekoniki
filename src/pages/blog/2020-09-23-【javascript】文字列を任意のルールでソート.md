---
templateKey: blog-post
url: 20200924_javascript_string_sort_custom
title: 【Javascript】文字列を任意のルールでソート
date: 2020-09-23T23:07:36.570Z
description: 初学者の方によく聞かれるのが、文字列の配列のソート方法についてです。通常通りsotr関数を使うと、文字コード順にはなりますが、そうではなくて任意のルールに基づいてソートする場合の方法がわからなくなるケースが多いようです。今回は簡単なサンプルを用いて任意ルールの文字列ソートを行う方法をご紹介します。
featuredpost: false
featuredimage: /img/js.png
tags:
  - javascript
  - typescript
  - js
  - ts
  - 配列
  - array
  - list
  - sort
  - ソート
  - 並べ替え
  - 文字列
  - string
---
## 前提条件
- `Javascript`をある程度理解している(`Typescript`でも可)

## 目標
以下のような文字列の配列が与えられたとします。
地元ネタな話で恐縮ですが、私が住む静岡市のローカル線**「静岡鉄道」**の駅名の配列です。

```javascript
let data = ['新静岡', '柚木', '音羽町', '狐ヶ崎', '草薙'];
```

上記は特にルールもなくバラバラに駅名が入っています。
これを[「NAVITIME | 静岡鉄道の路線図」](https://www.navitime.co.jp/railroad/00000730/%E9%9D%99%E5%B2%A1%E9%89%84%E9%81%93)に従って、上り線の駅順にしたいです。

上記の例でいうと、最終結果を以下のようにしたいです。

```javascript
let data = ['新静岡', '音羽町', '柚木', '草薙', '狐ヶ崎'];
```

## 方法
方法はいたって簡単で、ソートの基準となるマスタを用意します。
サンプルとしてわかりやすくするため`const`で直接定義していますが、本来なら`DB`や`Config`ファイルに格納されているべき情報です。

```javascript
// 新静岡から終点の新清水までの上り線駅順の配列
const SORT_LIST = ['新静岡',/*...略...*/ '音羽町',/*...略...*/ '柚木',/*...略...*/ '草薙',/*...略...*/ '狐ヶ崎',/*...略...*/ '新清水'];
```

この`SORT_LIST`を使って`sort()`を行います。
`sort()`は比較関数を渡すことで、配列中から連続する2要素を比較して並べ替えることができます。

- [MDN | Array.prototype.sort()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

`sort()`の中で比較対象となる要素を引数に`SORT_LIST`の`indexOf()`を取得することで、**上り線の駅順のマスタ配列に対して自身が何番目かを比較**することができます。

```javascript
const SORT_LIST = ['新静岡',/*...略...*/ '音羽町',/*...略...*/ '柚木',/*...略...*/ '草薙',/*...略...*/ '狐ヶ崎',/*...略...*/ '新清水'];
let data = ['新静岡', '音羽町', '柚木', '草薙', '狐ヶ崎'];

data.sort((a,b) => SORT_LIST.indexOf(a) - SORT_LIST.indexOf(b));
console.log(data);
```

### 出力結果

```shell
(5) ["新静岡", "音羽町", "柚木", "草薙", "狐ヶ崎"]
```

余談ですが、ソース中の`SORT_LIST.indexOf(a) - SORT_LIST.indexOf(b)`の順番を逆にすることで**下り線の駅順**にソートすることもできます。
別途`SORT_LIST_DESC`のようなものを作らなくてもいいです。

## まとめ
今回は`Javascript`における**文字列配列のソートを任意のルールで行う方法**をご紹介しました。
オーソドックスな方法で、一度覚えてしまえばなんてことないですが、初見だとなかなか思いつきにくいのかなと思い記事にしました。
この記事が初学者の方の役に立てば幸いです。