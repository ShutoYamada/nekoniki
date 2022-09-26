---
templateKey: blog-post
url: 20220926_aws-service-quotas
title: 【AWS】SESの秒間の送信制限の引き上げ申請
date: 2022-09-26T19:00:00.000Z
description: |-
  今回はAWS SES(Simple Email Service)の秒間のメール送信件数の制限引き上げの方法について作業メモを残します。メールを活用するようなサービス開発をされている場合はいつか通る道だと思うので是非参考にしてください。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - ses
  - servicequotas
---

## 前提
- `SES`のサンドボックス状態は解除済み

## Service Quotas
`SES`に限らず、`AWS`における制限の緩和は`Service Quotas`のコンソールから申請することができます。
`Service Quotas`の画面を開き、【AWSのサービス】を開くと`AWS`の各種サービスが表示されます。
その中から`SES`を選択しましょう。

![service-quotas1](/img/service-quotas1.png "service-quotas1")

## SESの現在の制限を確認
そのまま`SES`をクリックすると下記のような表示になるかと思います。

![service-quotas2](/img/service-quotas2.png "service-quotas2")

これが現在の制限値になります。
今回は秒間の送信数である`Sending rate`を引き上げたいため、こちらをクリックします。

## Sending rateの引き上げ
`Sending rate`の詳細画面に移ったら、【クォータの引き上げをリクエスト】を押下します。

![service-quotas3](/img/service-quotas3.png "service-quotas3")

すると下記のような画面が出るので、引き上げたい値を入力して【リクエスト】を押下します。

![service-quotas4](/img/service-quotas4.png "service-quotas4")

これで申請は完了です。
あとは`AWS`側からの回答待ちとなり、問題なく申請が通れば引き上げた上限で利用することができます。

## まとめ
今回は`Service Quotas`から`SES`の秒間の送信件数の引き上げリクエスト方法について作業メモを紹介しました。

`SES`に限らずクォータ制限のあるサービスを利用している場合には、サービスの拡大に伴って申請するような機会がいずれはあるかと思います。

特段面倒臭いフォーム入力もなかったのでリクエスト自体は気軽に出せそうですが、勿論大きすぎる値だと通りにくい等はあると思うので、適切な値を設定するようにしましょう。

今回の内容が役立ちましたら幸いです。