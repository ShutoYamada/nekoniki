---
templateKey: blog-post
url: 20200909_react-native-modal_duple
title: 【ReactNative】react-native-modalで複数モーダルの開閉が同時に行われない問題
date: 2020-09-29T09:36:00.555Z
description: |-
  react-native-modalはReactNative製アプリにモーダル機能を追加してくれる便利なライブラリです。
  しかしながら、複数のモーダルを画面に展開したい場合は少し工夫が必要になります。
  今回は、react-native-modalで複数のモーダルの閉じる処理・開く処理を同時に行う方法について解説します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react-native-modal
  - javascript
  - typescript
  - モーダル
---
## 前提条件

- `react-native@0.61.5`
- `react-native-modal@11.5.3`

## 問題となるコード

`A`と`B`という2種類のモーダルがある画面です。 
それぞれ以下の機能を持ちます。

- `A`は**Aモーダルを非表示にする**ボタン
- `B`は**Bモーダルを非表示にしてAモーダルを表示する**ボタン

素直に記載していくと以下のようになるのではないでしょうか？
※下記は`Typescript`のコードですが、`Javascript`でも大筋は同じだと思います。

```javascript
import React from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextStyle,
  TextProps,
  SectionList,
  Image,
  findNodeHandle,
  Alert,
  Button,
} from 'react-native';

import Modal from 'react-native-modal';

export interface Props {}

export interface State {
  dispA: boolean;

  dispB: boolean;
}

export default class ModalTestScreen extends React.Component<Props, State> {
  /**
   * constructor
   * @param props
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      dispA: false,
      dispB: false,
    };
  }

  toggleA = () => {
    this.setState({
      dispA: !this.state.dispA,
    });
  };

  toggleB = () => {
    this.setState({
      dispB: !this.state.dispB,
    });
  };

  toggleAandB = () => {
    this.setState({
      dispB: !this.state.dispB,
    });
  };

  render() {
    const {dispA, dispB} = this.state;

    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button title="Aモーダル表示" onPress={this.toggleA} />
        <Button title="Bモーダル表示" onPress={this.toggleB} />
        <Modal
          isVisible={dispA}
          style={{alignContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#FFF',
              alignContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}}>Aモーダル</Text>
            <Button title="Aモーダル非表示" onPress={this.toggleA} />
          </View>
        </Modal>
        <Modal
          isVisible={dispB}
          style={{alignContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#FFF',

              alignContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}}>Bモーダル</Text>
            <Button
              title="Bモーダル非表示&Aモーダル表示"
              onPress={this.toggleAandB}
            />
          </View>
        </Modal>
      </View>
    );
  }
}
```

しかし上記のコードだと下記のような挙動になります。

![modal-result1](/img/modal-result1.gif "modal-result1")

`B`モーダルの閉じる処理は成功しましたが、そのまま`A`モーダルを開くことができません。
原因ですが、`react-native-modal`の[Git](https://github.com/react-native-community/react-native-modal)に下記の記述がありました。

> ### I can't show multiple modals one after another
Unfortunately right now react-native doesn't allow multiple modals to be displayed at the same time. This means that, in react-native-modal, if you want to immediately show a new modal after closing one you must first make sure that the modal that your closing has completed its hiding animation by using the onModalHide prop.

意訳ですが、`react-native-modal`は連続したモーダルの開閉に対応していません。
特定のモーダルが閉じた直後に別なモーダルを開くには`onModalHide`プロパティを使用する必要があります。

### onModalHideプロパティとは
モーダルが閉じて、画面上の閉じるアニメーションが完了した後に実行されるイベントハンドラです。
モーダルが閉じた際に実行させたい関数を渡します。

## 修正後のコード
以下が修正後のコードになります。
`toggleAandB`がなくなり、`B`モーダル内のボタン押下時には`toggleB`を、
さらに`B`モーダルの`onModalHide`のタイミングで`toggleA`を実行することで、
**Bモーダルが閉じる→その後にAモーダルを開く**を実現しています。

```javascript
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextStyle,
  TextProps,
  SectionList,
  Image,
  findNodeHandle,
  Alert,
  Button,
} from 'react-native';

import Modal from 'react-native-modal';

export interface Props {}

export interface State {
  dispA: boolean;
  dispB: boolean;
}

export default class ModalTestScreen extends React.Component<Props, State> {
  /**
   * constructor
   * @param props
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      dispA: false,
      dispB: false,
    };
  }

  toggleA = () => {
    this.setState({
      dispA: !this.state.dispA,
    });
  };

  toggleB = () => {
    this.setState({
      dispB: !this.state.dispB,
    });
  };

  render() {
    const {dispA, dispB} = this.state;

    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button title="Aモーダル表示" onPress={this.toggleA} />
        <Button title="Bモーダル表示" onPress={this.toggleB} />
        <Modal
          isVisible={dispA}
          style={{alignContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#FFF',

              alignContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}}>Aモーダル</Text>
            <Button title="Aモーダル非表示" onPress={this.toggleA} />
          </View>
        </Modal>
        <Modal
          onModalHide={this.toggleA}
          isVisible={dispB}
          style={{alignContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#FFF',

              alignContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}}>Bモーダル</Text>
            <Button
              title="Bモーダル非表示&Aモーダル表示"
              onPress={this.toggleB}
            />
          </View>
        </Modal>
      </View>
    );
  }
}
```

以下、実行結果です。

![modal-result2](/img/modal-result2.gif "modal-result2")

## まとめ
今回は、`react-native-modal`を利用して際に、複数モーダルの開閉を連続して行いたい場合の記述方法についてご紹介しました。
機能が複雑なアプリになるにつれ、意図しないところで連続してモーダルを呼び出すような処理の流れになることはしばしば見受けられます(そもそもそういったフローごと見直すのも手だと思います)。
そういった場合に、今回の記事が参考になったら幸いです。

## ReactNativeの学習方法
`react-native`の学習には、大元である`react`の知識もさることながら、`iOS`や`Android`といったネイティブの知識も必要になってきます。

いずれかのバックボーンを元々持っている人にとっては取り掛かりやすいかもしれませんが、`Javascript`をようやく覚えて**「さあスマホアプリを作ろう！」**と思い立った方にはなかなか高いハードルです。

そういった場合、書籍や動画といった体系的にまとめられた教材を使用するのが有効です。

ひととおりの基本知識を蓄えてから各種ライブラリや`redux`といったフレームワークを利用することになるため、何は無くとも基礎固めをしていきましょう。

以下に管理人が実際に学習した教材を紹介します。

### React Native -JavaScriptによるiOS/Androidアプリ開発の実践

特に初心者〜中級者にオススメの書籍です。
`ReactNative`の体系的な知識をぎゅっと詰め込んだ一冊となっており、
お題目に沿って進めていくことで`TODOアプリ`を開発することができます。

**※ページ量が嵩むため、`Kindle`版の購入をオススメします。**

<div class="kaerebalink-box" style="text-align:left;padding-bottom:20px;font-size:small;zoom: 1;overflow: hidden;"><div class="kaerebalink-image" style="float:left;margin:0 15px 10px 0;"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" ><img src="https://thumbnail.image.rakuten.co.jp/ran/img/2001/0009/784/297/113/919/20010009784297113919_1.jpg" style="border: none;" /></a></div><div class="kaerebalink-info" style="line-height:120%;zoom: 1;overflow: hidden;"><div class="kaerebalink-name" style="margin-bottom:10px;line-height:120%"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" >Ｒｅａｃｔ　Ｎａｔｉｖｅ ＪａｖａＳｃｒｉｐｔによるｉＯＳ／Ａｎｄｒｏｉｄア  /技術評論社/〓木健介</a><div class="kaerebalink-powered-date" style="font-size:8pt;margin-top:5px;font-family:verdana;line-height:120%">posted with <a href="https://kaereba.com" rel="nofollow" target="_blank">カエレバ</a></div></div><div class="kaerebalink-detail" style="margin-bottom:5px;"></div><div class="kaerebalink-link1" style="margin-top:10px;"><div class="shoplinkrakuten" style="display:inline;margin-right:5px"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" >楽天市場</a></div><div class="shoplinkamazon" style="display:inline;margin-right:5px"><a href="https://www.amazon.co.jp/gp/search?keywords=React%20Native&__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&tag=stym112204-22" target="_blank" >Amazon</a></div></div></div><div class="booklink-footer" style="clear: left"></div></div>