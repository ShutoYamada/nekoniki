---
templateKey: blog-post
url: 20200526_reactnative_storage
title: react-native-storageで端末にデータを持たせる
date: 2020-05-26T09:02:18.238Z
description: |-
  ReactNativeでアプリを作る場合、だいたいはFirebaseなんかのmBasSを使ってデータのやり取りをするかと思います。
  しかし「そこまで大掛かりなデータを使うわけでもないんだよなぁ」なんてケースもちらほら見受けられます。
  そんな時にオススメなのがreact-native-storageです。
  ちょっとしたデータなら簡単に端末に持たせられ、インストールも簡単なので是非使ってみましょう！
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - ReactNative
  - react-native-storage
  - DB
  - db
  - storage
  - アプリ開発
  - 個人開発
---
## 前提条件・注意
- `react-native-cli`をインストールし、プロジェクト作成済
- `npm`もしくは`yarn`を使用
- `Typescript`での使用方法を記載します

## こんな場合にオススメ
- ローカルにRDBを持つほどではないデータ(単一のフラグや日付、文字列など)

ぱっと思いつくのは、**アプリの動作に関わる設定値**ですかね。
例えばアプリの設定画面からテーマカラーを変更できて、そのテーマカラーはアプリ内で`Enum`で定義されている場合、端末内に保持していれば大筋問題ないはずです。
**※上記の場合も、同一アプリを複数端末にインストールしていて、テーマカラーを共有したい場合等はサーバーサイドにデータを持たせておくべきだとは思います。**

## インストール
`yarn add`で`react-native-storage`をインストールします。
もちろん`npm install`でも可能です。

```shell
yarn add react-native-storage
```

## 使用方法
基本的な部分(`CRUD`)について記載します。
**※`CRUD`とは`CREATE`,`READ`,`UPDATE`,`DELETE`の4機能のことです**

### storageの作成
`react-native-storage`は`react-native`の`AsyncStorage`というモジュールをラップしています。
そのため作成時には`AsyncStorage`も一緒に使用する必要があります。

```javascript
import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

//ストレージの作成
var storage = new Storage({
    // 最大容量
    size: 1000,
    // バックエンドにAsyncStorageを使う
    storageBackend: AsyncStorage,
    // キャッシュ期限(null=期限なし)
    defaultExpires: null,
    // メモリにキャッシュするかどうか
    enableCache: true,
})
```

### 保存・更新
保存と更新は`save`で行います。
`key`には一意となる文字列を、`data`には任意のデータを渡します。
更新時は`key`をもとに対象データを上書きします。

```javascript

storage.save({
  key: 'test',
  data: {
    hoge : 'hogehoge',
    fuga : 100
  },
})

```

### 参照
参照は`load`で行います。
保存時に指定した`key`を渡します。
こちらは非同期処理になります。

```javascript
storage.load({
  key : 'test'
}).then(data => {
  // 読み込み成功時処理
  console.log(data);
}).catch(err => {
  // 読み込み失敗時処理
});

```

### 削除
削除は`remove`で行います。
参照と同様に`key`を指定します。

```javascript

storage.remove({
  key : 'test'
})

```

## 注意点
`react-native-storage`は基本的にデータの型を気にせずに突っ込めるので非常にありがたいですが、注意点もあります。
特に`Object`や`Date`型のデータを保存する時に遭遇しますが、一度`react-native-storage`を介すると、データ内のメソッドは消し飛びます。
例えば、下記のようなエラーが出ます。

```javascript

// 'DATE'をキーにして現在時刻を保存
storage.save({
  key: 'DATE',
  data: new Date(),
})

// Date型インスタンスを作成
let date : Date = new Date();

// 'DATE'をキーにstorageから読み出し
storage.load({
  key: 'DATE'
}).then((data) => {
  // 読み出したdataをdateに入れる  
  date = data;
}).catch((error) => {
  
});

// Date型のメソッドを使用
date.getTime();
// --> date.getTime is not a function...

```

これは`react-native-storage`が内部的にはデータを`JSON.perse()`した状態で保持しているためです。
そのため`Object`や`Date`型のメソッドを使いたい場合は、`Object.asign()`等を使って新しいインスタンスを作成するようにしましょう。
ちなみに上記のように`Date`型を使う場合は下記の通りでいいと思います。

```javascript

let date = new Date();

storage.load({key: 'DATE'}).then((data) => {
  // dataを引数にnew Date()することでDateインスタンスを新規作成
  date = new Date(data);
}).catch((error) => {

});

date.getTime(); // OK!!

```

## まとめ
今回は`react-native-storage`を紹介しました。
特に個人開発レベルのアプリだと、大掛かりにサーバサイドでデータを持つ必要がないケースが多いです。
そういった場合に、手軽に端末内にデータを保持させられるのは非常に便利ですよね。
ちなみにもう少し込み入ったデータを端末に保持させてクエリを投げたりしたい場合は`realm`がオススメです。
こちらもいずれ紹介しようと思います！

## 参考
- [GitHub](https://github.com/sunnylqm/react-native-storage)