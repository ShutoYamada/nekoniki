---
templateKey: blog-post
url: 20200917_react_warning_unmounted_component
title: 【React】Can't perform a React state update on an unmounted componentの原因と対処法
date: 2020-09-17T08:14:06.129Z
description: |-
  今回はReactで、非同期やタイマー処理を使った場合に発生するWarningの内容と対処法についてご紹介します。
  後片付けの処理を忘れると起こりがちなため注意が必要です。
featuredpost: false
featuredimage: /img/react.png
tags:
  - react
  - react-native
  - warning
  - 非同期
  - javascript
---
## エラーメッセージ

> Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.

意訳すると以下のようになります。
> 「**アンマウントされたコンポーネント**で`State`の更新を行っており、結果的に**メモリリークしている**のでちゃんと`componentWillUnmount`でタスクを処理してくれ」

## 発生するケース・原因
よくあるのが下記のような書き方をしている場合です。
`componentDidMount`で`State`を書き換える可能性のある処理を定期実行、もしくは`Promise`等の非同期で実行して、**その間のこのコンポーネントをアンマウント**したようなケースです。

予約された処理が実行される段階では、対象となるコンポーネントはアンマウントされているため更新ができなくなります。

例のように`setInterval`で定期実行していると、タスクを止めるコンポーネントが無くなってしまっているので、メモリリークに繋がります。

```javascript
import React from 'react';

class LeakComponent extends React.Component {
  // setIntervalのhandle
  _handle = 0;

  // コンストラクタ
  constructor(props) {
    this.state = {
      // 現在時刻
      now: new Date(),
    };
  }

  componentDidMount = () => {
    // 毎秒現在時刻をsetStateする処理を定義
    this._handle = setInterval(() => {
      this.setState({
        now: new Date(),
      });
    }, 1000);
  };

  render = () => {
    return <>{this.state.now.toString()}</>;
  };
}

export default LeakComponent;

```

## 対処法
コンポーネントがアンマウントされた後で`State`を更新するような処理が発生する可能性がある場合、`componentWillUnmount`でそれらのタスクを必ず処理するようにしましょう。

先ほどの例では、以下のような記載を追加すればOKです。

```javascript
componentWillUnmount = () => {
  // clearIntervalで設定された処理を解除
  clearInterval(this._handle);
};
```

## まとめ
今回は`Can't perform a React state update on an unmounted component...`の`Warning`の原因と対処法についてご紹介しました。
非同期等を絡めだすと頻出となる警告なので、そういった処理は外部ライブラリに任せてしまうのも手かもしれません。