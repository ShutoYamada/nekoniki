---
templateKey: blog-post
url: 20200713_javascript_iterator_generator
title: 【Javascript】知ってるようで知らないイテレータ・ジェネレータ
date: 2020-07-13T09:07:47.314Z
description: |-
  突然ですが、Javascriptのイテレータとジェネレータの定義について説明できますか？
  普段なんとなく使っている両者ですが、厳密な定義となるとなかなか調べる機会もないのではないでしょうか？
  そこで今回は、Javascriptにおけるイテレータとジェネレータについてご紹介します。
featuredpost: false
featuredimage: /img/js.png
tags:
  - javascript
  - iterator
  - iterable
  - iterator result
  - generator
  - 非同期
  - イテレータ
  - ジェネレータ
---
## 前提条件
- `Javascript`の基本的な文法が分かる

## イテレータ(`Iterator`)について
イテレータ(`Iterator`)について知る前にまず、イテレータリザルト(`Iterator Result`)について知る必要があります。

### イテレータリザルト(`Iterator Result`)の定義
イテレータリザルトは、プロパティに`value`と`done`を持つオブジェクトを指します。
例えば、下記の`result`もイテレータリザルトです。

```javascript
const obj = {
  value : 'hoge',
  done : false
}
```

`value`は`any`で`done`は`boolean`です。

### イテレータ(`Iterator`)の定義
イテレータは`next()`関数をプロパティに持つオブジェクトです。
next()`はイテレータリザルトを返す必要があります。

例えば下記の`iteratorObj`はイテレータです。

```javascript
const iteratorObj = {
  next : function () {
    return {
      value : 'fuga',
      done : false
    }
  }
}

console.log(iteratorObj.next()); // --> { value : 'fuga', done : false }
```

### 反復可能=イテラブル(`Iterable`)の定義
イテラブルであるとは、`[Symbol.iterator]()`を実行することでイテレータを返すオブジェクトを指します。
ここでの`Symbol.iterator`は予約語です。
例えば下記の`iterableObj`はイテラブルです。

```javascript
const iteratorObj = {
  next : function () {
    return {
      value : 'fuga',
      done : false
    }
  }
}

const iterableObj = {
  [Symbol.iterator] : function () {
    return iteratorObj;
  }
}
```

## イテラブルな型な型
イテラブルな型でメジャーなものは以下の通りです。
`Array`はなんとなく知っているという方も多いですが、実は`String`もイテラブルです。

- `Array`
- `String`
- `Iterator`(イテレータそのものがイテラブルである。`[Symbol.iterator]()`を実行した場合は自身を返す)
- ジェネレータ(後述)

## イテラブルの扱い方
下記にイテラブルの扱い方の`Tips`を紹介します。

### ループ処理`for(v of iterable)`
最もメジャーなのが`for(v of iterable)`構文です。

内部的には下記の4ステップを行なっています。
- `iterable[Symbol.iterator]()`を実行しイテレータを生成
- 生成したイテレータに対して`next()`を実行しイテレータリザルトを取得
- イテレータリザルトの`done`が`true`なら処理を終了
- `done`が`false`なら、`value`を`v`に代入して処理を実行

例えば、下記のような書き方を何気なく使ったことがあると思いますが、これはイテレータを取り出して使用しています。

```javascript
const array = ["A", "B", "C"];
// array[Symbol.iterator]()を実行しiteratorを取得
// iterator.next().done === trueなら処理を終了
for(const v of array) { // iterator.next().done === falseならvにvalueを代入し処理を行う
  console.log(v);
}

// => A
// => B
// => C
```

### スプレッド演算子`...`と組み合わせ
スプレッド演算子`...`と組み合わせることで出力される全てのイテレータリザルトの`value`の配列が生成できます。

```javascript
const array = [1, 10, 5];
console.log(Math.max(...array));
// => 10
```

また、下記のように分割代入することもできます。

```javascript
const array = ['hoge', 'fuga', 'puni'];
const [ a, b, c ] = array;
console.log(a);
// => hoge
console.log(b);
// => fuga
console.log(c);
// => puni
```

## ジェネレータ(`Generator`)について
ジェネレータ(`Generator`)はイテレータの生成をサポートする関数およびオブジェクトです。
ジェネレータを使わずに独自でイテレータを作成することもできますが、下記のような問題が発生します。
- `value`や`done`の値を内部的に管理する必要がある
- `done`の生成にバグが含まれていた場合、常に`done=false`となり`for(v of iterator)`構文等で無限ループが発生する

### ジェネレータ(`Generator`)の定義
ジェネレータ(`Generator`)は後述のジェネレータ関数から生成されたオブジェクトです。
ジェネレータはイテラブルでかつイテレータです。

### ジェネレータ関数の定義
ジェネレータ関数は、ジェネレータを生成する関数です。
`function*`で宣言し、内部で`yield`および`yield*`を用いることができます。

ジェネレータ関数は実行時にジェネレータを返却し、返却されたジェネレータの`next()`を実行していくことで関数中の`yield`を順に辿っていきます。

## ジェネレータの扱い方

### 基本形

下記がジェネレータの最も基本的な形です。

```javascript
// ジェネレータ関数
function* generatorFunc (n) {
  yield n;
  n++;
  yield n;
  n++;
  yield n;
  return n;
}

// ジェネレータを生成
var generator = generatorFunc(1);

// 最初のyieldの値がvalueに入る
console.log(generator.next()) // => { value : 1, done : false }
// 2つめのyieldに値がvalueに入る
console.log(generator.next()) // => { value : 2, done : false }
// 3つめのyieldに値がvalueに入る
console.log(generator.next()) // => { value : 3, done : false }
// 関数の実行が終了したのでdoneがtrueになった
console.log(generator.next()) // => { value : 3, done : true }
```

ここでのポイントは、先に述べたようにジェネレータ関数のよって生成されたジェネレータ`generator`の`next()`を実行するたびに、ジェネレータ関数内の`yield`を辿っている点です。
ジェネレータ関数の末端に達するタイミングで`done`が`true`で返却されます。

ジェネレータはイテラブルなイテレータなので、当然次のように記載することもできます。

```javascript
function* generatorFunc (n) {
  yield n;
  n++;
  yield n;
  n++;
  yield n;
  return n;
}
var generator = generatorFunc(1);

for(const v of generator){
  console.log(v);
}

// => 1
// => 2
// => 3
```

### ジェネレータの途中停止
ジェネレータは`return()`で途中終了することができます。
この場合、終了時の`yield`以降の実行されません。

```javascript
function* generatorFunc (n) {
  yield n;
  n++;
  yield n;
  n++;
  yield n;
  return n;
}
var generator = generatorFunc(1);

console.log(generator.next()) // => { value : 1, done : false }
console.log(generator.next()) // => { value : 2, done : false }
console.log(generator.return()) // => { value : undefiend, done : true }
// -> 2回目のn++は実行されず終了する
console.log(generator.next()) // => { value : undefiend, done : true }
```

### ジェネレータ・イテレータの委任(`yield*`)
`yield*`を用いることで、ジェネレータ中でイテレータを扱うことができます。
当然、ジェネレータもイテレータであるので、ジェネレータ中にジェネレータを扱うこともできます。

```javascript
function* generatorFunc (n) {
  // yield*でイテレータを渡せる
  yield* [n,++n,++n];
  return n;
}

var generator = generatorFunc(1);
// 以下結果は基本形の時と同じ
console.log(generator.next()) // => { value : 1, done : false }
console.log(generator.next()) // => { value : 2, done : false }
console.log(generator.next()) // => { value : 3, done : false }
console.log(generator.next()) // => { value : 3, done : true }
```

### ジェネレータに動的に値を渡す
next()の引数に値を渡すことで、ジェネレータ関数の値を動的にセットすることができます。
値は、`直前に実行されたyieldを受けた変数`に代入されます。

```javascript
function* generatorFunc () {
  const x = yield true ;
  const y = yield true ;
  yield { x, y };
  return { x, y }
}

var generator = generatorFunc();
console.log(generator.next(0)) // => { value : true, done : false }
// 直前にnext()を実行した際のyieldを受けた変数xに10が入る
console.log(generator.next(10)) // => { value : true, done : false }
// 直前にnext()を実行した際のyieldを受けた変数yに20が入る
console.log(generator.next(20)) // => { value : { x : 10, y : 20 }, done : false }
console.log(generator.next()) // => { value : { x : 10, y : 20 }, done : true }
```

## ジェネレータのもう一つの特徴
ここまでジェネレータの特徴として、「イテレータの生成が容易になる」という点にフォーカスしてきましたが、もう一つ大きな特徴があります。
それは、ジェネレータ関数を`任意のタイミングで停止・再開できる関数`として扱うことができるという点です。

例えば、ジェネレータ関数中に非同期処理を挟み込むことで、処理を同期的に扱うことができるようになります。
※この特製を応用したものとして、`redux-saga`等のライブラリが挙げられます。

## まとめ
今回は、`Javascript`におけるイテレータ`Iterator`とジェネレータ`Generator`について定義と使用方法をご紹介しました。
普段何気なく使っている`for (v in iterator)`構文も実はそれらを応用したものだと分かります。
あまり自作のイテレータ・ジェネレータを使うことはないかもしれませんが、基礎知識として覚えておいて損はないと思います。