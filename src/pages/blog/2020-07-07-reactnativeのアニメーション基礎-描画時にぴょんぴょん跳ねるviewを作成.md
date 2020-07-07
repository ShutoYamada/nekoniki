---
templateKey: blog-post
url: 20200707_reactnative_animatedview
title: ReactNativeのアニメーション基礎(描画時にぴょんぴょん跳ねるViewを作成)
date: 2020-07-07T08:45:33.876Z
description: |-
  ReactNativeはReactやReduxの知識さえあればだいたいのアプリは作ることができます。
  理由は、Reactで使った知識をそのまま流用できる点が多いためです。
  しかし、アニメーションは少し勝手が違って、Reactで使ったアニメーションをそのまま流用することは難しいです。
  今回は、ReactNativeで動きのあるアプリを実装するための方法を紹介します。
  具体的には、Animatedを使って描画時にぴょんぴょん跳ねるViewを作ります。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react
  - react-native
  - animated
  - typescript
  - javascript
  - js
  - jsx
  - ts
  - tsx
---
## 前提条件

* `react-native`のプロジェクト立ち上げ済
* `Typescript`で実装しています

## Animatedについて

`Animated`は`react-native`のモジュールです。 
そのためライブラリのインストールが必要なく、バニラの状態でも使えます。

[ReactNative | Animated](https://reactnative.dev/docs/animated)

簡単に解説すると、`Animated.Value`で指定したフレームに対応した値を出力し、その値を使ってコンポーネントの`style`を変更していく、というものです。

例えば、`0から500フレームの間で1回転させる(=rotateを操作する)`などです。 
この説明だけだと分かりにくいと思うので、実装に動作するサンプルを掲載します。

## サンプル

下記は`描画が終わったタイミングで2回だけその場でぴょんぴょん跳ねるView`の実装例です。

```typescript:title=Test.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface State {
    // Animated.Value(ここにアニメーションの値が格納されている)
    animatedValue : Animated.Value,
}

/**
 * Animation設定
 * 0〜300フレームの間で増減する値を宣言する
 * CSSでいうところの@keyframeのようなイメージ
 */
const interpolationConfig : Animated.InterpolationConfigType = {
    // 入力される値(フレーム)
    inputRange: [0, 75, 150, 225, 300],
    // 出力される値
    outputRange: [0, -15, 0, -15, 0],
}

export default class Test extends React.Component<{}, State> {

    /**
     * constructor
     * @param props 
     */
    constructor(props: {}){
        super(props);
        this.state = {
            // animatedValueを0で初期化
            animatedValue : new Animated.Value(0),
        }
    }
    
    /**
     * onLayout時処理
     */
    handleOnLayout = () => {
        // animatedValueを300まで1.5sかけて変化させる
        Animated.timing(this.state.animatedValue, {
            toValue: 300,
            duration: 1500,
            useNativeDriver : false,
        }).start();
    }

    render = () : JSX.Element => {

        const { animatedValue } = this.state;
        const translateY = animatedValue.interpolate(interpolationConfig);

        return(
            <View style={styles.container}>
                <Animated.View  style={[styles.jumpingView, { transform : [{translateY : translateY}] }]} onLayout={this.handleOnLayout} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex : 1, 
        alignItems : 'center',
        justifyContent : 'center'
    },
    jumpingView : {
        height : 100, 
        width : 100, 
        backgroundColor : '#94e4fe',
    }
});
```

### 動作イメージ

![animated](/img/animatied.gif "animated")

## ポイントを解説
続いてポイントを解説していきます。

### Animated.Valueで初期化
コンストラクタ内で`state`を初期化していますが、その際に`Animated.Value`を使っています。
これは、`<Animated.View>`を動かす際に使用する値で、初期値を`0`としています。

```ts
new Animated.Value(0)
```

### ViewではなくAnimated.Viewを使う
まず、上下している水色のViewは`<Animated.View>`を使っています。
`Animated.Value`で動かしたいコンポーネントは`<Animated.View>`を使うようにしましょう。

#### 補足.View以外を動かしたい場合は・・・
自作のコンポーネントを丸ごと`Animated.View`化したい場合は`createAnimatedComponent`を使うことで対応できます。

```ts
const AnimatedOriginalComponent = Animated.createAnimatedComponent(OriginalComponent);
```

### InterpolationConfigTypeで動作設定を作成
`Animated.InterpolationConfigType`型のインスタンスを作成し、目的のアニメーション動作に合致したフレームと出力値を設定します。
下記の例では、最終的に`View`を上下に動かしたい(=`translateY`を操作したい)ので、`outputRange`には`translateY`の値が入っています。
これにより、フレームが`0`から`300`に変化した際に`translateY`が`0`から`-15`の変化し、また`0`に戻るという動作を2回繰り返します。

```ts
const interpolationConfig : Animated.InterpolationConfigType = {
    // 入力される値(フレーム)
    inputRange: [0, 75, 150, 225, 300],
    // 出力される値
    outputRange: [0, -15, 0, -15, 0],
}
```

### Animated.timingでアニメーションを発火する
`Animated.timing`で`Animated.Value`を指定した時間をかけて変化させます。
サンプル中では`1.5`秒かけて`Animated.Value`の値を`300`に変化させています。

```ts
Animated.timing(this.state.animatedValue, {
    toValue: 300,
    duration: 1500,
    useNativeDriver : false,
}).start();
```

### interpolateでAnimated.Valueから対応する値を取得
`Animated.interpolate`で現在の`Animated.Value`から対応する値を取得します。
先ほど`InterpolationConfigType`の項で設定したインスタンスを元に値を取得します。

例.`Animated.Value`が`25`なら`-5`を取得する。

```ts
const translateY = animatedValue.interpolate(interpolationConfig);
```

ここで取得した値を`<Animated.View>`のスタイル(ここでは`translateY`)に指定しているので、フレーム値の変化に伴って`translateY`が変化し、上下しているように動きます。

```ts
<Animated.View  style={[styles.jumpingView, { transform : [{translateY : translateY}] }]} onLayout={this.handleOnLayout} />
```

## まとめ
今回は`Animted`を使って、描画時に上下する`View`の作成サンプルを紹介しました。
`React`や他のフレームワークから入った方には少し取っつきづらく感じるかもしれませんが、このサンプルを応用することで多種多様な動きをコンポーネントに持たせることができます。
アプリに動きが加わると一気にクオリティが上がるので、早いうちにマスターしておくといいかもしれません。