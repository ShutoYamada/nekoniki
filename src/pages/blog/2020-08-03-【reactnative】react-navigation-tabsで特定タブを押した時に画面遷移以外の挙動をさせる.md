---
templateKey: blog-post
url: 20200804_bottom_tab_onpress
title: 【ReactNative】react-navigation-tabsで特定タブを押した時に画面遷移以外の挙動をさせる
date: 2020-08-03T23:37:11.209Z
description: >-
  ReactNativeで画面遷移を扱う方法はいくつかあると思いますが、オーソドックスなのがreact-navigationを用いたものだと思います。

  その中でもタブナビゲータを利用しようとするとreact-navigation-tabsを使うことになりますが、タブを押下した際に画面遷移以外の処理を行いたい時があると思います。

  今回はそんな場合のTipsです。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-navigation
  - react-navigation-tabs
  - react-native
  - javascript
  - jsx
  - typescript
  - tsx
  - react
---
## 前提条件
- `react-navigation`インストール済み
- `react-navigation-tabs`インストール済み

## サンプル
今回は簡単なサンプルとして`redux`コンテナ化した`TabNavigatorContainer`を作成しました。
内部的には`HogeScreen`と`FugaScreen`の2種類の画面を行き来するだけですが、`FugaScreen`の呼び出しの際に、独自定義した`AnyAction`を`Dispatch`したいものとします。

要件によっては`AnyAction`は`FugaScreen`の`componentDidMount()`で行われるべきですが、あくまで画面遷移前の下処理として実行しておきたいものとします。

```tsx
import React from 'react';
import { Dispatch } from 'redux';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator, NavigationTabProp } from 'react-navigation-tabs';
// 任意の画面
import HogeScreen from '../HogeScreen';
import FugaScreen from '../FugaScreen';
// 任意のアクション
import AnyAction from '../AnyAction';
// createStoreしたStore
import store from '../store';

/**
 * TabNavigatorを作成
 */
export const TabNavigator = createBottomTabNavigator({
    'HOGE' : {
      screen : HogeScreen,
    },
    'FUGA' : {
      screen : FugaScreen,
      // tabBarOnPressで押下時の処理を独自定義
      tabBarOnPress : (props : { navigation : NavigationTabProp, defaultHandler : () => void }) => { 
        // 'FUGA'画面に関わるAnyActionをDispatch
        store.dispatch(AnyAction);
        // defaultHandler()で本来の'FUGA'画面への遷移処理を行う
        props.defaultHandler();
      }
    }
  },
  {
    initialRouteName: 'HOGE',
  });

/**
 * Container化
 */
const TabNavigatorContainer = createAppContainer(TabNavigator);
export default TabNavigatorContainer;
```

ポイントは`tabBarOnPress`を定義している点です。
これは、通常であれば画面遷移のみを行うところに独自の処理を挟むことができます。
ここではあらかじめ作成しておいた`store`に対して`AnyAction`を`Dispatch`しています。

`tabBarOnPress`を実装する場合は、引数として渡ってくる`defaultHandler`を実行しなければ画面遷移しなくなるという点に注意しましょう。
あくまでタブを押下した時の処理をオーバーライドしているというイメージです。

## まとめ
今回は`react-navigation-tabs`利用時にタブの押下処理を実装して、画面遷移以外の処理を行うサンプルをご紹介しました。
アプリ内で特定の画面に移動する時だけ事前処理を挟みたい、というケースはちょくちょく見かけるため覚えておくと便利かと思います。