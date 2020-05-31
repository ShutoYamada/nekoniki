---
templateKey: blog-post
url: 20200524_atompub_api
title: AtomPub APIでLivedoorブログの記事を取得する
date: 2020-05-24T12:13:03.454Z
description: |-
  このブログを立ち上げる前にLivedoorブログでつらつらと記事を書いていたことがあります。
  そちらはもう更新はしておらず、いずれは消さないとなぁ・・・なんて思っていますが、その前にAPIを使って記事を抜き出したので、今回はそのやり方をまとめます。
featuredpost: false
featuredimage: /img/livedoorblog.png
tags:
  - node
  - javascript
  - livedoor
  - atom
  - AtomPub API
  - API
  - XML
  - JSON
  - xml
  - json
  - http
  - HTTP
  - wsse
  - WSSE
  - other
---
![livedoor](/img/livedoorblog.png "livedoor")

## 前提条件

* `node`インストール済

## Livedoorブログ側の設定
`Livedoor`の管理画面にログインし、`AtomPub API`の設定を開きます。
ルートエンドポイントと、AtomPub用パスワードを取得しておきましょう。

![livedoor-atom](/img/livedoor-atom.png "livedoor-atom")



## 関連ライブラリをインストール

今回使用するライブラリは3つです。

### wsse

`WSSE認証`用のライブラリです。

* [GitHub](https://github.com/vrruiz/wsse-js)

```shell
yarn add wsse
```

### request

`HTTP`リクエスト用ライブラリです。

* [GitHub](https://github.com/request/request)

```shell
yarn add request
```

### xml2json

`XML`を`JSON`にパースするライブラリです。

* [GitHub](https://github.com/henrikingo/xml2json)

```shell
yarn add xml2json
```

## AtomPub APIについて

Livedoorブログの`API`は`AtomPub`というプロトコル仕様に準拠しています。 
ブログ周りを触ったことのない方には耳馴染みがないかもしれませんが、Webサイトの更新情報の規格としては割りかし有名かと思います。

## ソースコード

下記は今日の日付で投稿された記事のみを抽出するサンプルです。
記事の取得のエンドポイントは`/article`で、取得後のデータに対して`from`と`to`で絞り込みをかけています。

```javascript:title=atom.js
let wsse = require('wsse');
let request = require('request');
let parser = require('xml2json');

var token = new wsse.UsernameToken({ username: '【ブログユーザID】', password: '【AtomPub用パスワード】' });

// 記事を取得
var options = {
  url: 'https://livedoor.blogcms.jp/atompub/【ブログID】/article',
  method: 'GET',
  headers: {
    'Authorization': 'WSSE profile="UsernameToken"',
    'X-WSSE': token.getWSSEHeader({nonceBase64:true})
  }
};

// リクエスト実行
request(options, function(error, response, body) {

  // JSONにパース
  var json = parser.toJson(body);
  let obj = JSON.parse(json);

  // 今日の日付のエントリ
  let toDaysEntry = [];

  // from
  let from = new Date(new Date().setHours(0, 0, 0, 0));
  from.setDate(from.getDate() - 1);
  from.setHours(from.getHours() + 9);

  // to
  let to = new Date(new Date().setHours(0, 0, 0, 0));
  to.setHours(to.getHours() +9);

  // エントリが正しく取得できていたら
  if(obj.feed && obj.feed.entry){
    for(let i = 0 ; i < obj.feed.entry.length; i++){
      // エントリ
      let e = obj.feed.entry[i];
      // 日付型に変換
      let eDate = new Date(e.updated);

      // 今日の日付のエントリだけ抽出
      if(eDate > from && eDate < to){
        toDaysEntry.push(e);
      }
    }

    console.log('count : ' + toDaysEntry.length);
  }
});
```

### 実行

```shell
node atom.js
```

### 出力結果

```
count : 11
```

## まとめ
今回はLivedoorブログから`AtomPub API`を使って記事を取得するコードの紹介をしました。
主に役立つのはブログの引越しを行う時等です。移行先の`API`を使って投稿すれば、記事を丸ごと移行することができます。
記事数が多くなればなるほど役立ってくるソースなので、是非とも活用してみてください。

## 参考

* [AtomPub API について](http://help.blogpark.jp/archives/52372407.html)