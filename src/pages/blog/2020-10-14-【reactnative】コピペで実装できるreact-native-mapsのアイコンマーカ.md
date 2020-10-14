---
templateKey: blog-post
url: 20201015_react-native-maps_marker_icon
title: 【ReactNative】コピペで実装できるreact-native-mapsのアイコンマーカ
date: 2020-10-14T10:04:43.687Z
description: |-
  ReactNativeアプリで地図機能を実装するならreact-native-maps一択だと思います。
  さらに細かく情報をプロットしていくならMakerコンポーネントは必須ですが、カスタムするにはスタイル周りを学習する必要があります。
  今回は、コピペで動くそれっぽいMakerをご紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-maps
  - marker
  - map
  - 地図
  - プロット
  - アプリ開発
---
## 前提条件

* `react-native@0.63.1`
* `react-native-maps@0.27.1`
* `native-base@2.13.14`

※`native-base`はアイコン表示のために使用しているだけなので、アイコンの中身を文字にしたい場合は不要です。

## ソース

```javascript
import React from 'react';
import {Marker} from 'react-native-maps';
import {Icon, View} from 'native-base';

// サンプルマーカー
const SampleMarker = () => {
  return (
    <Marker
      coordinate={{
        latitude: 34.971698,
        longitude: 138.3890637,
      }}>
      <View style={{justifyContent: 'center'}}>
        <View
          style={{
            top: 2,
            width: 38,
            height: 38,
            alignSelf: 'center',
            justifyContent: 'center',
            borderRadius: 38 / 2,
            backgroundColor: '#36C1A7',
          }}>
          <Icon
            type="FontAwesome5"
            name="utensils"
            style={{
              color: '#FFF',
              textAlign: 'center',
              fontSize: 20,
            }}
          />
        </View>
        <View
          style={{
            top: -2,
            width: 0,
            height: 0,
            alignSelf: 'center',
            backgroundColor: 'transparent',
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: 20,
            borderBottomWidth: 0,
            borderTopColor: '#36C1A7',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
          }}
        />
      </View>
    </Marker>
  );
};

export default SampleMarker;
```

## 表示
![marker_icon](/img/marker_icon.png "marker_icon")

## まとめ
今回は`react-native-maps`で表示するカスタムマーカーについて、コピペ実装できるデザインのものをご紹介しました。
もちろん動的にプロットする場合は`props`に緯度経度等の情報を渡す必要があります。
そのあたりはご自身のソースコードに合わせてカスタマイズしてみてください。