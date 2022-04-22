---
templateKey: blog-post
url: 20220422_aws-route53-ses
title: 【AWS】Route53でドメインを取得して、SESを使ってメールを送る
date: 2022-04-22T19:00:00.000Z
description: |-
  今回はAWSのRoute53で取得したドメインを使ってSESからメールを配信できるようになるまでの手順を紹介したいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - route53
  - ses
---

## 注意
過去の[Zennのこの記事](https://zenn.dev/articles/faf5885cd50e48/edit)の再掲になります。

## 概要
今回は`AWS`の`Route53`で取得したドメインを使って`SES`からメールを配信できるようになるまでの手順を紹介したいと思います。

既にわかりやすく解説してくれている記事がいくつかありましたが(記事末尾の参考に載せてあります)、一部処理が端折られていたりしたので、それらを自分が噛み砕いてまとめた内容になります。
また、コンソールからではなく、`AWS CLI`からの操作をメインとしていきます。

注意ですが、ドメインを実際に取得するのでお金がかかります。
検証の場合は安い`TLD`を選択しましょう。
料金は下記の公式から参照できます。

https://aws.amazon.com/jp/route53/pricing/

### ①ドメインの取得
まずは`Route53`で任意のドメインを取得します。
ドメインは以降のコマンド中でも頻繁に登場するので`$domain`としておきます。

```shell
export domain=<取得したいドメイン>
```

### ドメインが取得できるか確認
まずはドメインが取得できるかを確認します。
一点注意なのですが、下記コマンドではリージョンを`us-east-1`としています。
これは、ドメインの取得がこのリージョンでしか行えないためです(以下リンク参照)。

https://docs.aws.amazon.com/ja_jp/general/latest/gr/r53.html

```shell
aws route53domains check-domain-availability \
  --region us-east-1 \
  --domain-name $domain
```

以下のレスポンスとなれば取得可能です。

```shell
{
    "Availability": "AVAILABLE"
}
```

### ドメインの取得

#### 連絡先のJSONファイル作成
ドメインを取得するにあたり「管理者」と「登録者」と「テクニカル担当」の3者の連絡先が必要になります。
これらは同一の連絡先でも問題ありませんので実際の運用に合わせてください。
以下のフォーマットで`JSON`を作成します。

個々の値の選択可能な範囲については以下のリンクを参照してください。
https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/domain-register-values-specify.html#contact-type-field

```json:contact.json
{
    "FirstName": "<First Name>",
    "LastName": "<Last Name>",
    "ContactType": "Person | Company",
    "OrganizationName": "<Organization Name>",
    "AddressLine1": "<Address 1>",
    "AddressLine2": "<Address 2>",
    "City": "<City Name>",
    "State": "<State Name>",
    "CountryCode": "JP",
    "ZipCode": "<Zip Code>",
    "PhoneNumber": "+81.NNNNNNNNNN",
    "Email": "<Mail Address>",
    "Fax": "",
    "ExtraParams": [
    ]
  }
```

3者の内容が異なる場合は3種類の`JSON`を作成します。
今回は全て同じ連絡先として以下コマンドでドメインを取得します。
※念の為1年のみ、自動更新はなしとしています。

```shell
aws route53domains register-domain \
  --region us-east-1 \
  --domain-name $domain \
  --duration-in-years 1 \
  --no-auto-renew \
  --admin-contact file://contact.json \
  --registrant-contact file://contact.json \
  --tech-contact file://contact.json
```

レスポンスとして`OperationId`が返って来れば登録の手続きが行われています。
しばらく待つと、登録した連絡先に確認のメールが届くので、その中のリンクを踏むことで登録が完了します。

#### ドメイン移管のロック
不正にドメインを移管されないようにロック処理を行います。

```shell
aws route53domains enable-domain-transfer-lock \
  --region us-east-1 \
  --domain-name $domain
```

これでドメインの取得に関わる手続きは完了です。

## ②ドメイン検証
早速取得したドメインを使って`SES`側で設定をしていきます。

### 注意：リージョンを確認する
`SES`を`Cognito`に紐づける用途の場合、リージョンが`us-east-1`,`us-west-2`,`eu-west-1`のいずれかである必要があります(下記参照)。 

https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/user-pool-email.html

そういった用途の場合、どのリージョンで作業を行うかに気をつけましょう。

### ホストゾーンIDの確認
ここまでの手順でドメインが正常に取得できたいた場合、ホストゾーンが自動で作成されているので、そのIDを取得します。
ホストゾーンは権威DNSサーバにおけるゾーンファイルのことです。

```shell
aws route53 list-hosted-zones
```

以下のようなレスポンスが得られます。

```json
{
    "HostedZones": [
        {
            "Id": "<Hosted Zone ID>",
            "Name": "<Domain>",
            "CallerReference": "<CallerReference>",
            "Config": {
                "Comment": "HostedZone created by Route53 Registrar",
                "PrivateZone": false
            },
            "ResourceRecordSetCount": 2
        }
    ]
}
```

このうちの`Hosted Zone ID`の値はこのあと頻繁に登場するので`$hostedZoneId`としておきます。

```shell
export hostedZoneId=<Hosted Zone ID>
```

### 検証トークンの取得
`SES`でドメインを使うためにはいくつか踏むステップがあります。
まずドメインに対しての検証トークンを取得し、それを`DNS`の`TXT`レコードに決められた書式で記載する必要があります。

検証トークンの取得を行います。

```shell
aws ses verify-domain-identity --domain $domain
```

以下のレスポンスが返ります。

```json
{
    "VerificationToken": "<YOUR_VERIFICATION_TOKEN>"
}
```

### 検証トークンをTXTレコードに書き込み
取得したトークンを`TXT`レコードに書き込みます。
書き込むフォーマットは以下のようになります。

参考:[https://docs.aws.amazon.com/ses/latest/DeveloperGuide/dns-txt-records.html](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/dns-txt-records.html)


| Name    |  Type    |  Value   |
| --- | --- | --- |
| _amazonses.<_YOUR_VERIFICATION_DOMAIN>.    | TXT    |   "<_YOUR_VERIFICATION_TOKEN_>"  |

このフォーマットに合わせて`JSON`を作成します。
ドメインとトークンは取得したものに置き換えてください。

```json:record-txt.json
{
   "Comment": "Add TXT Record",
   "Changes": [
      {
         "Action": "UPSERT",
         "ResourceRecordSet": {
            "Name": "_amazonses.<Domain>.",
            "Type": "TXT",
            "TTL": 1800,
            "ResourceRecords": [
               {
                  "Value":"\"<YOUR_VERIFICATION_TOKEN>\""
               }
            ]
         }
      }
   ]
}
```

この内容で書き込みを行います。

```shell
aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-txt.json
```

しばらく待った後で下記コマンドで登録の状態を確認しましょう。

```shell
aws ses get-identity-verification-attributes \
  --identities $domain \
  --query 'VerificationAttributes.*.VerificationStatus' \
  --output text
```

この結果が`Success`になっていれば成功です。
※いつ手続きが完了するかの明確な線引きはできませんが、30分経っても`Pending`のステータスの場合、どこかで手順を誤っている可能性があります。

## ③DKIMの設定
続いて`DKIM`の設定を行います。
`DKIM`は送信者のなりすましを防ぐ仕組みで、メールに対して署名を行います。
`DNS`側に公開鍵を登録(`CNAME`レコード)しておき、それを用いて認証を行います。

### DKIMトークンの発行
公開鍵となる`DKIM`トークンを発行します。

```shell
aws ses verify-domain-dkim \
  --domain $domain
```

レスポンスは以下のようになります。

```json
{
    "DkimTokens": [
        "<_YOUR_DKIM_TOKEN_1_>",
        "<_YOUR_DKIM_TOKEN_2_>",
        "<_YOUR_DKIM_TOKEN_3_>"
    ]
}
```

### CNAMEレコードの書き込み
`DKIM`トークンを`CNAME`レコードで書き込みます。

書き込むフォーマットは以下のようになります。

参考:[https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-authentication-dkim-easy.html](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-authentication-dkim-easy.html)


| Name    |  Type    |  Value   |
| --- | --- | --- |
|  <_YOUR_DKIM_TOKEN_1_>._domainkey.<_YOUR_VERIFICATION_DOMAIN_>.   | CNAME    |   <_YOUR_DKIM_TOKEN_1_>.dkim.amazonses.com  |
|  <_YOUR_DKIM_TOKEN_2_>._domainkey.<_YOUR_VERIFICATION_DOMAIN_>.   | CNAME    |   <_YOUR_DKIM_TOKEN_2_>.dkim.amazonses.com  |
|  <_YOUR_DKIM_TOKEN_3_>._domainkey.<_YOUR_VERIFICATION_DOMAIN_>.   | CNAME    |   <_YOUR_DKIM_TOKEN_3_>.dkim.amazonses.com  |

このフォーマットに合わせて`JSON`を作成します。
ドメインとトークンは取得したものに置き換えてください。
今回は3件レコードを登録するので、3種類のファイル作成が必要です。
それぞれ`record-cname1.json`,`record-cname2.json`,`record-cname3.json`とします。
以下は`record-cname1.json`の例です。

```json:record-cname1.json
{
   "Comment": "Add CNAME1",
   "Changes": [
      {
         "Action": "UPSERT",
         "ResourceRecordSet": {
            "Name": "<_YOUR_DKIM_TOKEN_1_>._domainkey.<Domain>.",
            "Type": "CNAME",
            "TTL": 1800,
            "ResourceRecords": [
               {
                  "Value": "<_YOUR_DKIM_TOKEN_1_>.dkim.amazonses.com"
               }
            ]
         }
      }
   ]
}
```

以下コマンドでレコードを登録します。

```shell
aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-cname1.json

aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-cname2.json

aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-cname3.json
```

`TXT`レコードの時と同様、しばらく待った後で下記コマンドを実行し`Success`となっていれば設定は完了です。

```shell
aws ses get-identity-dkim-attributes \
  --identities $domain \
  --query 'DkimAttributes.*.DkimVerificationStatus' 
```

## ④SPFの設定
`DKIM`と同様に`SPF`の設定を行います。
`SPF`は用途としては`DKIM`と同じくなりすまし防止ですが、方法が異なります。
こちらは`DNS`に`IP`アドレスを書き込み、その値と送信側の`IP`を比較します。

### カスタム Mail Fromドメインの有効化
カスタム Mail Fromドメインの有効化を行います。
https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/mail-from.html

自分が参考にした元記事(以下)に倣い、`bounce`というサブドメインを用います。
https://dev.classmethod.jp/articles/setting-up-aws-ses-with-aws-cli-1/

```shell
aws ses set-identity-mail-from-domain \
  --identity $domain \
  --mail-from-domain bounce.$domain
```

### レコードの登録
②や③の時と同様にレコードの登録を行います。

参考:[https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/send-email-authentication-spf.html](https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/send-email-authentication-spf.html)

今回は以下のように設定します。

| Name    |  Type    |  Value   |
| --- | --- | --- |
|  bounce.<_YOUR_VERIFICATION_DOMAIN_>   | MX    |  10 feedback-smtp.us-east-1.amazonses.com  |
|  bounce.<_YOUR_VERIFICATION_DOMAIN_>  | TXT    |   "v=spf1 include:amazonses.com ~all"  |

### JSONの作成
今回は2レコードなので、2件作成します。
種別が`MX`と`TXT`と異なっている点に注意してください。

```json:record-mx.json
{
   "Comment": "Add MX Record",
   "Changes": [
      {
         "Action": "UPSERT",
         "ResourceRecordSet": {
            "Name": "bounce.<Domain>.",
            "Type": "MX",
            "TTL": 300,
            "ResourceRecords": [
               {
                  "Value": "10 feedback-smtp.us-east-1.amazonses.com"
               }
            ]
         }
      }
   ]
}
```

```json:record-txt2.json
{
   "Comment": "Add TXT Record to use SPF",
   "Changes": [
      {
         "Action": "UPSERT",
         "ResourceRecordSet": {
            "Name": "bounce.<Domain>.",
            "Type": "TXT",
            "TTL": 300,
            "ResourceRecords": [
               {
                  "Value": "\"v=spf1 include:amazonses.com ~all\""
               }
            ]
         }
      }
   ]
}
```

以下コマンドで登録します。

```shell
aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-mx.json

aws route53 change-resource-record-sets \
  --hosted-zone-id $hostedZoneId \
  --change-batch file://record-txt2.json
```

これまでと同様に一定期間待った後で、確認コマンドが`Success`を返せばOKです。

```shell
aws ses get-identity-mail-from-domain-attributes \
  --identities $domain \
  --query 'MailFromDomainAttributes.*.MailFromDomainStatus'
```

## 　⑤送信できるか確認
最後に実際にメールが送信できるか確認します。
なお`SES`はデフォルトではサンドボックスの状態です。
この状態だと送信回数や送信先に制限があります。
送信先を事前に登録する必要があるので、まずはそこから行いましょう。

なお、以降は送信先を`$toAddress`とします。

```shell
export toAddress=<自分が保有しているメールアドレス>
```

### 送信先アドレスの検証
下記コマンドで送信先の検証を行います。

```shell
aws ses verify-email-identity \
  --email-address $toAddress
```

しばらく待つと送信先のメールアドレスに確認メールが届くので、その中の認証リンクを踏みます。
その上で以下の確認コマンドが`Success`を返せばOKです。

```shell
aws ses get-identity-verification-attributes \
  --identities $toAddress \
  --query 'VerificationAttributes.*.VerificationStatus'
```

### 送信検証
いよいよ送信の検証を行います。
取得したドメインを用いた任意の`From`アドレスから、先ほど検証完了した送信先アドレスへメールを投げます。

```shell
aws ses send-email \
  --from test@$domain \
  --to $toAddress \
  --subject "Subject Test" \
  --text "Body Test"
```

これで入力した内容の通りにメールが届けば完了です。

## まとめ
今回は`Route53`でドメインを取得し、`SES`を用いてメールを送信するところまでの手順をまとめました。
コンソール上でやると簡単ですが`CLI`ベースだとパラメータの渡し方などでちょっと苦労するなぁというのが通しでやってみての感想です。

本来はここから、サンドボックスの解除などをした上で使っていくかと思います。
要望がありましたらその内容も記事にしたいと思います。

今回の内容が役立ちましたら幸いです。

## 参考
- [[JAWS-UG CLI] Route53:#2 独自ドメインを取得する (route53domains)](https://qiita.com/tcsh/items/597e7644949bfe4ab405)

- [AWS CLIを利用してAmazon SESの設定をやってみた – メール送信編](https://dev.classmethod.jp/articles/setting-up-aws-ses-with-aws-cli-1)