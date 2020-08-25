---
templateKey: blog-post
url: 20200825_teratail_bot
title: 【GAS】Teratail APIで質問を取得してWebexTeamsに通知する
date: 2020-08-25T08:36:23.694Z
description: >-
  最近よくteratailを利用しています。

  以前は質問する側でしたが、段々と回答するに足る知識も身についてきたので今は回答メインです。

  人気のタグである「Javascript」や「HTML」はライバルも多く、なかなか回答待ちの質問に出会えないので、APIで自分が回答したいジャンルの質問を取得してWebex Teamsに通知するGASを組んでみました。
featuredpost: false
featuredimage: /img/002.jpg
tags:
  - gas
  - google
  - teratail
  - Cisco Webex Teams
  - 通知
  - 自動
  - bot
---
## 前提条件
- `GAS`が利用できる
- `teratail`アカウント開設済み
- `Webex Teams`を利用している

※最後の項目については通知先の話なので`Slack`等でも構いません。

## teratail アクセストークンを取得する
まずは`teratail`でアクセストークンを取得します。
[設定ページ](https://teratail.com/users/setting/profile)にアクセスし「アクセストークン管理」を開きます。

![teratail1](/img/teratail1.png "teratail1")

アクセストークン管理画面が表示されるので「新規作成する」を押下します。

![teratail2](/img/teratail2.png "teratail2")

トークン名を聞かれるので、入力して生成します。
下記のようにトークンが表示されるので控えておきます。

![teratail3](/img/teratail3.png "teratail3")

## Webex 設定
`Webex`側では`Bot`アカウントを作成してトークンを発行します。
`Bot`の作成については下記記事を参考にします。

- [ネコニキの開発雑記 | Cisco Webex TeamsのBotアカウントの作り方](https://nekoniki.com/20200617_teams_bot)

## GASの作成
あとはそれぞれ取得したアクセストークンを用いて`GAS`を組み上げます。
段階としては`1.質問の取得`, `2.質問をWebexTeamsに送信`です。

### 1.質問の取得

`https://teratail.com/api/v1/questions`のエンドポイントで質問一覧を取得できます。
その中から対象となるタグ(ソース中では`Javascript`と`HTML`)の質問のみ抽出します。
必要なのは`teratailのアクセストークン`です。

参考
- [teratail API v1.0](https://teratailv1.docs.apiary.io/)

```GAS
/**
 * 対象となる質問を取得
 */
function getTargetQuestions() {
  
  let result = [];
  
  // 取得対象のタグを取得
  const targetTags = ['Javascript', 'HTML'];
    
  // Teratail API
  const uri = 'https://teratail.com/api/v1/questions';
  const headers = {
    'Authorization' : 'Bearer ' + 【teratailのアクセストークン】,
  };
  const option = {
    'method': 'get',
    'contentType': 'application/json',
    'headers' : headers
  }
  
  // API実行
  const response = UrlFetchApp.fetch(uri, option);
  // JSONに整形
  const result = JSON.parse(response.getContentText());

  // 対象の質問リスト
  var targetList = [];
    
  if(result.questions) {
    
    const questions = result.questions;
    
    for(var i = 0; i< questions.length; i++){
      const question = questions[i];
      const modified = new Date(question.modified)
      const isTargetTag = question.tags.some(function(t){ return targetTags.indexOf(t) >= 0 })
      
      // 対象タグだったら
      if(isTargetTag) {        
        // targetListに投稿に必要なデータをまとめてpush
        targetList.push({ url : urlBase + question.id, title : question.title, countReply : question.count_reply })
      }
      
    }        
  }
    
  return targetList;
}
```

### 2.質問をWebexTeamsに送信
`https://api.ciscospark.com/v1/messages`で送信します。
必要なのは`送り先のルームID`と`Webexのアクセストークン`です。

```GAS
function main() {
  // 先のgetTargetQuestions()で対象の質問を取得
  const questions = getTargetQuestions();
  if(questions.length > 0){
    var text = '## 【Teratail新規質問】 \r\n';
    questions.forEach(function(q) {
      // タイトルと回答数でリンクを作成
      text += `- [${q.title}(${q.countReply})](${q.url}) \r\n`
    });
    
    // 投稿内容を作成
  var data = {
    // 投稿先
    'roomId': 【Webex送り先のルームID】,
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
      'Authorization': 'Bearer ' + 【Webexアクセストークン】
    },
    // 投稿内容を整形
    'payload': JSON.stringify(data)
  }
  
  // 投稿処理を実行
  var response = UrlFetchApp.fetch('https://api.ciscospark.com/v1/messages', options);
  }
}
```

## スケジュール設定
ここまでで任意のタグの質問を取得して通知を送るという処理はできました。
`GAS`はスケジュール設定もできるので、定期的に質問をチェックして通知を遅らせることもできます。
注意点として`teratail API`は`1時間あたり300リクエスト`という制限があるので、その条件を守ってスケジュールを設定しましょう。

## まとめ
今回は`teratail`から自分が指定したタグの質問を抽出して`Webex Teams`に自動送信するスクリプトの作成手順を紹介しました。
自分は、今回のスクリプトをベースに**「最終実行日時以降に更新があった質問」**かつ**「回答数が一定数以下」**の質問に絞って抽出しています。

いずれ記事にしようと思いますが、`teratail`でのスコア上げを目標に据えているので、非常に役立つツールができました。

## 追記
実は`teratail`のタグには`RSS`機能があります。
従って今回のように単純にタグを指定して質問を取得したい場合はそちらを利用するとより簡単に取得できるかと思います。