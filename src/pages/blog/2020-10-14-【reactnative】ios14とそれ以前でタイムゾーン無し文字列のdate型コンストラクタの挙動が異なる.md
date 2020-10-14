---
templateKey: blog-post
url: 20201014_react-native_ios_date_constructor
title: 【ReactNative】iOS14とそれ以前でタイムゾーン無し文字列のDate型コンストラクタの挙動が異なる
date: 2020-10-14T07:49:10.900Z
description: |-
  iOS14が公開されてまだまだ日が浅いですが、追加された機能に伴いReactNativeアプリにも変更が必要なものが多々あります。
  その中で自分が見つけたのは、Date型コンストラクタの挙動についてです。
  Qiitaにも同様の記事を記載しましたが、念のため個人ブログの方にも記載しておきます。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - ios
  - date
  - 日付
  - タイムゾーン
---
## 前提条件
- `react-native@0.63.1`
- `iOS14`
- `2020/10/14`時点の情報です(今後のアップデートで修正される可能性あり)

## コンストラクで文字列を渡している場合は注意
例えば以下のように文字列から`Date`型のコンストラクタを利用した場合です。
サンプル①は`ISO-8601`の拡張形式のタイムゾーンを指定していない形式です(この時点でオラオラ仕様なのも問題なのですが・・・)。

```javascript

// サンプル①
const sample1 = '2020-10-10T00:00:00';
// サンプル②
const sample2 = '2020/10/10 00:00:00';

// それぞれDate型にキャストする
const result1 = new Date(text1);
const result2 = new Date(text2);

// 結果を表示
console.log('result1 --> ', result1.toString());
console.log('result2 --> ', result2.toString());
```

この実行結果が`iOS14`前後で異なります。
それぞれ以下の通りです。

### 出力結果(iOS14未満)

```

result1 -->  Wed Oct 14 2020 09:00:00 GMT+0900 (JST)
result2 -->  Wed Oct 14 2020 00:00:00 GMT+0900 (JST)
```

### 出力結果(iOS14)

```

result1 -->  Wed Oct 14 2020 00:00:00 GMT+0900 (JST)
result2 -->  Wed Oct 14 2020 00:00:00 GMT+0900 (JST)
```

サンプル①の場合の結果が変わっているのが分かります。

## まとめ
そもそも渡している文字列が正しいフォーマットから少し外れたものであるのも悪いですが、どうやら`iOS14`前後でコンストラクタの挙動が異なるようです。

アプリで表示される時刻が、バージョンアップに伴いなぜかずれるという事象に遭遇し、あれこれ検証した結果判明した挙動でした。

同様の事象に悩んでいる方もいるかなと思ったので記事に残しておきます。