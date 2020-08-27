---
templateKey: blog-post
url: 20200828_reactnative_font_size
title: 【ReactNative】フォントサイズや要素サイズを端末によって変動させる
date: 2020-08-27T23:08:53.588Z
description: >-
  ReactNativeでアプリ開発をしていて、いざリリースができるとなった段階で「特定の端末だとフォントや要素が大きすぎる/小さすぎる」という状況に遭遇することがあると思います。

  たいていは使い慣れた実機やエミュレータで開発しているため、別なサイズの端末に切り替えた時にサイズ周りのレイアウトが崩れてしまいます。

  今回は、端末によってサイズを調整してくれるライブラリを紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - javascript
  - react-native-size-matters
  - サイズ
  - ios
  - android
  - 端末
  - レイアウト
  - デザイン
---
## 前提条件
- `react-native`プロジェクトを作成済み

## インストール
使用するのは`react-native-size-matters`というライブラリです。
- [GitHub](https://github.com/nirsky/react-native-size-matters)

その名の通り、`size`に関わる値を端末サイズによって変換してくれます。

```shell
yarn add react-native-size-matters
```

## 使用方法
主な使用方法は`scale`と`verticalScale`と`moderateScale`という3種類のメソッドを使います。

```javascript
import { View, Text } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// ...略

render() {
  return(
    <View style={{width : scale(20), height: verticalScale(20)}}>
      <Text style={{fontSize : moderateScale(16)}}>hoge</Text>
    </View>
  )
}
```

それぞれ`350 x 650`というスクリーンサイズを基準として、現在のスクリーンサイズに適した値を返してくれます。
`scale`が基準となり、`verticalScale`はその高さバージョンです。
`moderateScale`は`scale`を拡張したような関数で、デフォルトでは`scale`の算出結果の`0.5`倍の値になりますが、第二引数で係数を指定できます。
これにより、部分的により小さくしたい/大きくしたいという場合に利用できます。

```javascript
scale(10); // -> この値が20となるスクリーンの場合
moderateScale(10); // -> この値は15になる(デフォルト係数が0.5)
moderateScale(10, 0.1); // -> 11になる(係数を0.1にしたため)
```

## まとめ
今回は`react-native`アプリのサイズ調整に役立つライブラリ`react-native-size-matters`を紹介しました。
端末に関わるレイアウト崩れはアプリ開発の終盤で対応することになることが多いので、早い段階から導入することでその辺りの手間を省けるように思います。