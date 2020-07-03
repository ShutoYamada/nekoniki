---
templateKey: blog-post
url: 20200611_props_type
title: Typescript+ReactでPropsを定義するときのTips
date: 2020-06-11T13:46:25.614Z
description: |-
  ReactもしくはReactNativeをTypescriptで書いていると、コンポーネントに渡すPropsを定義することは日常茶飯事です。
  そんな時、知っているとちょっと便利なTipsをご紹介します。
featuredpost: false
featuredimage: /img/react.png
tags:
  - react
  - react-native
  - typescript
  - javascript
  - 型
  - Tips
  - 便利
---
## 前提条件
- `react`もしくは`react-native`のプロジェクト
- `Typescript`を導入している

## 全てのプロパティをオプションにする(`Partial`)
がっつりコンポーネントの再利用を突き詰めていくと、割と細かい単位でコンポーネントを作成することになります。
個人的には、コンポーネントが細かくなればなるほどプロパティは必須のものが少なくなる印象です。
例えば、コンポーネントのスタイル等、親から指定したい場合とそうでない場合のもの等です。
そんな時、プロパティに`?`を付けてオプション化していることはないでしょうか？

```javascript
type CustomButtonProps = {
  // ボタンの背景色
  bgColor? : string
  // ボタンの文字色
　color? : string
  // デバッグフラグ
  isDebug? : boolean
}
```

全てのプロパティをオプションにしたい場合は`Partial`が便利です。
下記の通り書いても、同じ結果が得られます。

```javascript
type CustomButtonProps = Partial<{
  bgColor: string
  color: string
}>
```

## union(`|`)
例えば`style`の`width`のように`100`や`"50%"`のように複数の型を受けたい場合に使用します。

```javascript
type CustomViewProps = {
  // stringもしくはnumberのいずれか
  width : string | number
}
```

## intersection(`&`)
`union`と対の存在なのが`intersection`です。
複数の型の両方の性質を持たせたい場合に利用します。

```javascript
type Hoge = {
  a : string
  b : number
}
type Fuga = {
  c : boolean;
  d : string | number | boolean
}

// objはHogeとFugaの両方の性質(プロパティ)を持つ
const obj : Hoge & Fuga = {
  a : '',
  b : 0,
  c : false,
  d : ''
};
```

## プリミティブ型の値を細分化(リテラル)
プリミティブ型の中でも特にこの値だけを受け付けたい、といった場合はリテラル型がオススメです。
例えば、先の`union`型と併用し、下記のように記載することで`type`は`0`か`1`か`2`しか許さない型になります。

```javascript
// Hogeのtypeは0か1か2のみ許可
type Hoge = {
  type : 0 | 1 | 2
}
```


ちなみに先の`Partial`で登場した`?`を付けたオプションプロパティはデフォルトでは`undefined`です。
一見すると`undefined`を複合させた`union`型なのでは？と思ってしまいます。

```javascript
// 下記の2通りの書き方は同じ??
type Hoge = {
  fuga? : string
}

type Puni = {
  fuga : string | undefined
}
```

何が違うのかというと、`?`の場合は`fuga`プロパティが存在しないことを許容しています。
`string | undefined`の場合、`undefined`を渡さないとなりません。

```javascript
type Hoge = {
  fuga? : string
}

type Puni = {
  fuga : string | undefined
}

// これはOK
const hoge : Hoge = {}
// Property 'fuga' is missing in type '{}' but required in type 'Puni'
const puni : Puni = {}
```

## 特定のプロパティのみ抽出(`Pick`)
`Pick`で既存の`type`から特定のプロパティを抽出することができます。
既に作成したプロパティを部分的に使いまわしたい時に便利です。

```javascript
// a,b,cの3つのプロパティを持つABC
type ABC = {
  a : string
  b : string
  c : string
}

// ABCからa,bを持つABを作成
type AB = Pick<ABC , 'a' | 'b'>
```

## まとめ
ざっと紹介した限りでも、様々な`Props`の定義パターンがあるように思えます。
個人的には`union`やリテラルは使用頻度が高いと思うので、覚えておいて損はないと思います。