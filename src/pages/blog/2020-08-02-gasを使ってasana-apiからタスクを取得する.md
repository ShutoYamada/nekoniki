---
templateKey: blog-post
url: 20200801_asana_gas
title: GASを使ってAsana APIからタスクを取得する
date: 2020-08-02T07:18:45.774Z
description: |-
  自分の所属する会社では、Asanaを用いてタスク管理を行っています。
  既にある機能だけでも十分便利なのですが、タスク一覧を取得して解析する必要がでてきたのでAsana APIを利用することにしました。
  そこで今回は、GASを用いてAsana APIからプロジェクトに紐づくタスクを取得する方法をご紹介します。
featuredpost: false
featuredimage: /img/asana.png
tags:
  - gas
  - asana
  - api
  - task
  - タスク管理
---
## 前提条件
- `Asana`に登録済み
- `GAS`を実行する環境を構築済み

## アクセストークンの取得
まずは`Asana API`のアクセストークンを取得する必要があります。
下記URLの開発者コンソールに`Asana`のアカウントを用いてログインしてください。
- [開発者コンソール](https://app.asana.com/0/developer-console)

メニューの【個人アクセストークン】のセクションから【新規アクセストークン】を選択します。
※赤で隠れている部分は既に作成してあるトークンなので、初回は表示されません。

![asana1](/img/asana1.png "asana1")

トークン名を聞かれるので、任意の値を入力してください。
【API利用規約に同意します】にチェックを入れて【トークンを作成】を押してください。

![asana2](/img/asana2.png "asana2")

正常にトークンが作成された場合、下記のようにトークンが表示されるのでコピーします。

![asana3](/img/asana3.png "asana3")

以上でアクセストークンの発行が完了しました。

## GASからリクエストを実行

プロジェクト下のタスクは`/projects/{project id}/tasks`のエンドポイントを使用します。
- 参考：[Get tasks from a project](https://developers.asana.com/docs/get-tasks-from-a-project)

サンプルとして下記のような関数を作成しました。
【アクセストークン】には先ほど取得したアクセストークンを、
【プロジェクトID】にはAsanaのプロジェクトIDを入力します。
※プロジェクトIDはアクセストークンを取得したアカウントが参照できるプロジェクトを指定する必要があります。

```javascript
/**
 * Asanaからタスクを取得する
 */
function getAsanaTasks() {
  
  // リクエストオプションを作成
  var options = {
    // GETメソッド
    'method': 'get',
    // JSON形式
    'contentType': 'application/json',
    // ヘッダ
    'headers': { 
      // 認証情報
      'Authorization': 'Bearer ‘ +【アクセストークン】
    },
  }
    
  // Asana APIを実行しタスクを取得する
  // ?opt_fields=でタスク名、期限、最終更新日を指定して取得する
  var response = UrlFetchApp.fetch(`https://app.asana.com/api/1.0/projects/【プロジェクトID】/tasks?opt_fields=name,due_on,modified_at,completed`, options);
  // 取得結果をJSONパース
  var result = JSON.parse(response);


  // 取得結果を配列に格納
  var list = [];  
  if(result.data){
    for(var i = 0; i < result.data.length; i++){
      list.push(result.data[i]);
    }
  }

  return list;
}
```

取得結果は`opt_fields`にどのフィールドを指定するかによって異なります。
私の場合、期限が近くなったにも関わらずメンテされていないタスクを取得する必要があったため「タスク名、期限、最終更新日」のフィールドを取得するようにしています。
このあたりは目的に合わせて柔軟にカスタマイズするといいかと思います。

## まとめ
今回は`GAS`を用いて`Asana API`を実行しプロジェクト配下のタスクを取得するサンプルを紹介しました。
単純に`REST API`を叩くだけなので、ご自身の利用環境に適した言語を選択するといいと思います。