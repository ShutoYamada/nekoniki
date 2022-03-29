---
templateKey: blog-post
url: 20220329_object-key-value-type
title: オブジェクトのプロパティをstirigでなくユニオン型で取得したい
date: 2022-03-29T19:00:00.000Z
description: |-
  TSで特定のオブジェクトのプロパティをObject.keysで取得したいケースでちょっとハマったのでメモ書きとして残します。
featuredpost: false
featuredimage: /img/typescript.png
tags:
  - typescript
---

## やりたかったこと
目的はシンプルで、以下のような`Hoge`型があったとします。

```typescript
const Hoge = {
  ["aaaa"]: "A",
  ["bbbb"]: "B",
} as const;
```

この`Hoge`のキーをループで回した場合、通常は以下のように書くと思います。

```typescript
Object.keys(Hoge).forEach((key) => {
    console.log(Hoge[key]); // --> "A"とか"B"とかを表示
});
```

しかし、これだとエラーが出ます。
内容は下記の通りです。

```
TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ readonly aaaa: "A"; readonly bbbb: "B"; }'.
  No index signature with a parameter of type 'string' was found on type '{ readonly aaaa: "A"; readonly bbbb: "B"; }'.
```

どうやら`Object.keys()`は`string[]`を返すらしく、`Hoge`のキーに合致しない可能性があるため当該のエラーが出ているようです。

どうにかして`Object.keys(Hoge)`のレスポンスは`string[]`ではなく`Hoge`のキー文字列のユニオン型の配列だと表現したいです。

## keyof typeofを使う
`Hoge`の`key`(あるいは`value`)のユニオン型は以下のようにして作ることができます。

```typescript
type HogeKeys = keyof typeof Hoge; // --> "aaaa" | "bbbb"
type HogeValues = typeof Hoge[HogeKeys]; // --> "A" | "B"
```

これを利用することで、先ほどの`Object.keys`のレスポンスを`string[]`ではなくします。

```typescript
// Object.keys(Hoge)をHogeKeys[]型とする
(Object.keys(Hoge) as (HogeKeys)[]).forEach((key) => {
    console.log(Hoge[key]);
});
```

これでエラーが出なくなりました。

## まとめ
`Typescript`は型付けができて非常に便利ですが、今回のようなケースや`Enum`を絡めたようなケースだと型パズルにハマってしまうことがあります。
都度調べるしかないですが、今回の内容は色々と応用が効きそうなので備忘録として記事にしました。

今回の内容が役立ちましたら幸いです。