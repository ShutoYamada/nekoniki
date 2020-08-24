---
templateKey: blog-post
url: 20200824_json_server
title: モックサーバ作成に最適なjson-serverのセットアップ
date: 2020-08-24T08:38:13.158Z
description: |-
  モックサーバを作る時、普段はswaggerを用いていたのですが、より簡易的なモックを作るならjson-serverを使用した方が便利だと知りました。
  今回はjson-serverのセットアップ方法についてご紹介します。
featuredpost: false
featuredimage: /img/js.png
tags:
  - node
  - javascript
  - npm
  - json
  - server
  - mock
  - other
  - サーバ
  - モック
  - セットアップ
---
## 前提条件

* `node`インストール済

## json-serverとは

`NodeJS`ベースのライブラリです。 
`json`で`REST API`のモックサーバを立てることができます。 
巷では`30秒でノーコーディングでサーバを立てられる`なんて触れ込みで紹介されてたりします。

- [公式(npm)](https://www.npmjs.com/package/json-server)

## インストール

```shell
npm install -g json-server
```

## サンプルデータの作成

下記の`JSON`を作成します。

```json:titel=hoge.json
{
  "hoge": [
    {
      "id": 0,
      "value": "HOGE"
    },
    {
      "id": 1,
      "value": "FUGA"
    },
    {
      "id": 2,
      "value": "PIYO"
    }
  ]
}
```

## 起動

```shell
npx json-server --watch hoge.json
```

`localhost:3000`でサーバが立ち上がります。

![json-server1](/img/json-server1.png "json-server1")

さらに`localhost:3000/hoge`にアクセスしてみると・・・

![json-server2](/img/json-server2.png "json-server2")

先ほどの`hoge.json`で指定した内容が表示されます。
`localhost:3000/hoge/{id}`で別個のデータを取得できますし、`POST`することでデータの追加も行うことができます。

## まとめ
今回は`json-server`を用いた簡単なモックサーバのセットアップ方法を紹介しました。
認証や複雑なクエリが絡むリクエストには対応できませんが、モックとして簡単に作成する分には十分だと思います。