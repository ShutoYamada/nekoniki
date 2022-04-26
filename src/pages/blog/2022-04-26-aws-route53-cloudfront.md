---
templateKey: blog-post
url: 20220422_aws-route53-cloudfront
title: 【AWS】Route53でドメインを取得して、CloudFrontに適用する
date: 2022-04-26T19:00:00.000Z
description: |-
  今回はAWSのRoute53で取得したドメインを使ってCloudFrontに適用する方法(CLI)について紹介します。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - route53
  - cloudfront
---


## 概要
今回は`AWS`の`Route53`で取得したドメインを`CloudFront`に適用する方法を紹介したいと思います。

前提としてドメインは[前回のこの記事](https://nekoniki.com/20220422_aws-route53-ses)のような手法で取得済みで、以下のような定数に格納されているものとします。

```shell
export domain=<有効なドメイン>
```

また、このタイミングでホストゾーンについても特定しておきましょう。
下記コマンドからホストゾーン一覧を確認できます。

```shell
aws route53 list-hosted-zones
```

対象のホストゾーンのIDが確認できたらドメインと同様に定数に格納しておきます。

```shell
export hostedZoneId=<ホストゾーンID>
```

## 証明書の取得
ドメインを適用する前に`ACM`から証明書を発行します。
証明書についてのわかりやすい解説は下記リンクを参照してください。

参考:[GMOグローバルサイン | SSLサーバ証明書とは](https://jp.globalsign.com/ssl/about/#:~:text=SSL%E3%82%B5%E3%83%BC%E3%83%90%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%81%AF,%E3%81%8C%E5%90%AB%E3%81%BE%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%82)

今回は`*`付きのワイルドカード証明書を取得するものとします。
下記コマンドで取得できます。

```shell
aws acm request-certificate \
  --domain-name *.$domain \
  --validation-method DNS \
  --region us-east-1
```

以下のようなレスポンスが返って来れば証明書の作成は完了です。

```json
{
    "CertificateArn": "<証明書のARN>"
}
```

### CNAMEに追加

この証明書の情報を`DNS`(`Route53`)側に設定することでドメインの(利用権の)認証を行うことができます。
先ほど取得できた証明書の`ARN`を指定して下記コマンドを実行しましょう。

```shell
aws acm describe-certificate \
  --certificate-arn <証明書のARN>
```

レスポンスとして証明書の情報が`JSON`形式で返ってきます。
その中から`ResourceRecord`のプロパティを探し、`Name`と`Value`の値を控えます。

その内容を元に以下のような`JSON`を作成しましょう。
名前は`record-cname-certificate.json`とします。

```json:record-cname-certificate.json
{
    "Comment": "Add CNAME Certificate",
    "Changes": [
       {
          "Action": "UPSERT",
          "ResourceRecordSet": {
             "Name": "<ResourceRecordのName>",
             "Type": "CNAME",
             "TTL": 1800,
             "ResourceRecords": [
                {
                   "Value": "<ResourceRecordのValue>"
                }
             ]
          }
       }
    ]
 }
```

この`JSON`を使って`CNAME`レコードを`Route53`に追加します。
`CNAME`レコードは所謂「あだ名」のようなもので、正式名称に対する別名称の定義に用います。
詳しくは以下リンクが参考になります。

参考:[!JP | CNAMEリソースレコード（シーネームリソースレコード）](https://jprs.jp/glossary/index.php?ID=0212)

```shell
aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-cname-certificate.json
```

以下のようなレスポンスが返ってきた後、しばらく待てば反映が成功します。

```json
{
    "ChangeInfo": {
        "Id": "<ID>",
        "Status": "PENDING",
        "SubmittedAt": "<実行日時>",
        "Comment": "Add CNAME Certificate"
    }
}
```

## CloudFrontとの紐付け(Aliasレコードの追加)
いよいよ`CloudFront`側との接続を行います。
方法としては`CNAME`の時と同様に`Alias`レコードを`Route53`に追加します。

### `Alias`レコードとは
`Alias`レコードは`AWS`の`Route53`の独自拡張レコードです。
振る舞いとしては`A`レコードに近いです。

参考:[!JP | Aリソースレコード（Aレコード）](https://jprs.jp/glossary/index.php?ID=0161)

`A`レコードが「DNS名に対するIP」の対応付けを表すのに対して、`Alias`レコードは「DNS名に対する`AWS`リソースのDNS名」の対応付けを表します。

「`CNAME`となにが違うの？」と思われるかもしれませんが、パフォーマンスが変わってきます。
一般に同様のこと(DNS名→DNS名→IPの変換)を再現しようとした場合、「DNS名→DNS名」で`CNAME`レコード、「DNS名→IP」で`A`レコードといった具合に2回問い合わせが発生します。

それに対して`Alias`レコードは「DNS名」をそのまま`AWS`上のリソース(DNS名)に変換してくれるのでパフォーマンスを比べた場合こちらに軍配が上がります。

### Aliasレコードの追加
実際に`Alias`レコードを追加します。
扱いとしては`A`レコードなので`Type=A`と指定した以下のような`JSON`を用意します。
名前は`record-a.json`とします。

```json:record-a.json
{
   "Comment": "Add Alias Record to use front domain.",
   "Changes": [
      {
         "Action": "UPSERT",
         "ResourceRecordSet": {
            "Name": "<DNS名>",
            "Type": "A",
            "AliasTarget": {
               "HostedZoneId": "Z2FDTNDATAQYW2",
               "DNSName": "<CloudFrontのDNS名>",
               "EvaluateTargetHealth": false
            }
         }
      }
   ]
}
```

`CNAME`の時と同様に`Route53`に追加します。

```shell
aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-a.json
```

しばらく待った後に指定したドメイン(上記`JSON`中の`<DNS名>`)を参照して、`CloudFront`の配信内容が参照できれば成功です。

## まとめ
今回は`Route53`で取得したドメインを、`CloudFront`に紐づける方法について紹介しました。
コンソール上でやると簡単ですが最終的に`CloudFormation`や`CDK`に落とし込むことを考えると`CLI`ベースで進めた方が何かと楽になります。

今回の内容が役立ちましたら幸いです。