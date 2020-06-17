---
templateKey: blog-post
url: 20200617_teams_bot
title: Cisco Webex TeamsのBotアカウントの作り方
date: 2020-06-17T08:41:30.886Z
description: |-
  このご時世、テレワークを導入した企業も多く、大体は何かしらのツールを用いてコミュニケーションを取っているかと思います。
  なんとなくSlackが主流なのかなと思ってたりしますが、私の所属する会社ではCisco Webex Teamsを利用しています。
  普通に利用するだけだとつまらないので、今回はCisco Webex TeamsのBotアカウントの作成方法を紹介します。
featuredpost: false
featuredimage: /img/1702.png
tags:
  - GAS
  - Cisco Webex Teams
  - Bot
---
## 前提条件

* `Cisco Webex Teams`のアカウント作成済
* `GAS`の動作環境作成済

## そもそもCisco Webex Teamsとは？

`Cisco`社が提供するチームコラボレーションツールです。

以下、[公式](https://www.webex.com/ja/team-collaboration.html)より抜粋

> 外出先、デスク、または会議室など、Webex Teams は場面を問わずプロジェクトの促進、関係の強化、およびビジネス課題の解決をサポートします。作業を進めるのに必要なすべてのチームコラボレーションツールを提供するとともに、使用している他のツールと連携して業務をシンプルにします。

使用感としては`Slack`とそんなに変わりはないように思えます。 ビデオ会議ツールである`Cisco Webex Meeting`等のツールもあります。

## Botを作る

`Bot`は本来、他のサービスと連携させてナンボですが、そこまで解説すると割と限定的になりそうなので、今回はあくまで`Bot`を作って、おまけとして投稿ができる`GAS`のスクリプトを載せるだけに留めます。

### 開発者サイトにログイン

[Developer](https://developer.webex.com/)にアクセスし、Teamsアカウントでログインします。

![teams_dev](/img/temas_dev.png)

### TeamsAppの作成
画面右上のアカウントアイコンから【My Webex Apps】を選択します。

### 新規Appの作成
【Create New App】を押下し【Bot】を選択する。

![teams_bot](/img/teams_bot.png)

入力する必要事項は下記の通りです。
- Bot Name : ボット名(日本語)
- Bot Username : メンションを付ける時に指定する名称(末尾に@webex.botが付く)
- Icon : アイコン
- Description : 概要
上記を入力し、アカウントを作成します。

### AccessTokenの作成
作成したアカウント詳細からアクセストークンを生成します。
`Bot's Access Token`と`Bot ID`が必要になるので控えておきます。

![teams_token](/img/teams_token.png)

## Botの活用

### GASサンプル
下記に`GAS`での投稿サンプルを記します。

```javascript:title=send.gs
/**
 * 投稿処理
 */
function send(text) {
  
  // 投稿内容を作成
  var data = {
    // 投稿先
    'roomId': '【投稿先のルームID】',
    // 本文(マークダウン)
    'markdown': text
  };
  
  // リクエストオプション
  var options = {
    // post
    'method': 'post',
    // json
    'contentType': 'application/json',
    // ヘッダ
    'headers': { 
      // 認証情報
      'Authorization': 'Bearer ' + '【APIトークン】'
    },
    // 投稿内容を整形
    'payload': JSON.stringify(data)
  }
  
  // 投稿処理を実行
  var response = UrlFetchApp.fetch('https://api.ciscospark.com/v1/messages', options);
}
```

## まとめ
今回は`Cisco Webex Teams`の`Bot`アカウントを作成し、`GAS`での投稿サンプルを紹介しました。
本来はここから、別な外部サービスと連携します。
例えば、`Git`の`push`や`pull`やマージリクエストを通知する等です。
組み合わせ次第で色々できるので、是非試してみてください！