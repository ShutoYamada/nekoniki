---
templateKey: blog-post
url: 20220608_aws-move-domain
title: 【AWS】他のAWSアカウントにドメインを移す
date: 2022-06-08T19:00:00.000Z
description: |-
  今回は異なるアカウントにドメインを移管する方法について紹介したいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cli
  - route53
---


## 前提
前提として以下のような状態であるとします。
操作は`CLI`を利用します。

- アカウントAでドメインを取得している(`example.com`)
- アカウントBにドメインを移管したい
- アカウントBからロールを払い出して、アカウントAのIAMユーザがスイッチロールする形式とする

最後の項目についてはオプションです。
アカウントB側でドメインを受け取るという操作が必要ですが、ロールを使わずとも同じことができるので、ロールを使わない場合はIAMユーザをそのまま使うものと置き換えてください。

## ロールの作成(アカウントB側)
アカウントB側でロールを作成します。
以下の4つの権限を持てるようにポリシーをアタッチします。

- route53domains:TransferDomainToAnotherAwsAccount
- route53domains:RejectDomainTransferFromAnotherAwsAccount
- route53domains:CancelDomainTransferToAnotherAwsAccount
- route53domains:AcceptDomainTransferFromAnotherAwsAccount

さらに信頼ポリシーを以下のように記載します。
こうすることでアカウントA側からアカウントB側にあるこのロールを扱うことができます。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::【アカウントAのID】:root"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

### CLIの設定
`CLI`に操作者(アカウントA側の`IAM`ユーザ)の`profile`を追加します。

```shell
aws configure --profile acount-a
```

`IAM`ユーザのアクセスキー、シークレット等々を入力します。
以降の操作主体をこの`acount-a`にしたい場合は、以下のようにデフォルトに設定します。

- Windowsの場合

```shell
set AWS_DEFAULT_PROFILE=account-a
```

- Mac,Linuxの場合

```shell
export AWS_DEFAULT_PROFILE=account-a
```

さらに、この`account-a`から使用できるロールを`profile`として宣言します。
`~/.aws/config`を編集して以下のようにロールを宣言します。

```diff
[default]
region=us-east-1
output=json
[profile account-a]
region = us-east-1
output = json
+ [profile role-b]
+ region = us-east-1
+ role_arn = 【アカウントBで作ったロールのARN】
+ source_profile = account-a
```

これで以降の`CLI`実行時に`--profile role-b`とオプションをつけることでスイッチロールした状態でコマンド実行することができます。

## ドメインの移管(アカウントA側)
それではアカウントA側からドメイン移管を行います。
もしドメインの移管ロック状態にある場合はまずは解除します。

```shell
aws route53domains disable-domain-transfer-lock \
--domain-name example.com
```

その上で移管処理を行います。

```shell
aws route53domains transfer-domain-to-another-aws-account \
--domain-name example.com \
--account-id 【アカウントBのID】
```

レスポンスとして以下が返ります。

```json
{
    "OperationId": "xxxxxxxxxxxxxxx",
    "Password": "xxxxxxxxxxxxxx"
}
```

この中の`Password`は後で使います。

## ドメインの受け取り(アカウントB側)
今度はアカウントB側でドメインを受け取ります。

```shell
aws route53domains accept-domain-transfer-from-another-aws-account \
--profile role-b \
--domain-name example.com \
--password 【先ほどのPassword】
```

特に問題がなければアカウントB側の登録済みドメインに移管されます。

## ホストゾーンの移行
ここまでの作業がドメインの移管です。
大概はホストゾーンの移行もセットで行うかと思いますので、ここで手順を紹介します。
厳密には「移行」というより、ドメインの移管先で新たにホストゾーンを作り、そこに移管元から参照してレコードを作成する、といった流れです。
その際に、以降元のホストゾーンに`NS`レコードと`SOA`レコードしかない場合はこの手順は不要です。
**今回はNSおよびSOAレコード以外がなかったため、具体的な移行処理はありません。**
上記以外のレコードがある場合については、[別の AWS アカウントへのホストゾーンの移行](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/hosted-zones-migrating.html)の手順を参考にしてください。

### 移行先にホストゾーンを作成(アカウントB側)
まずは移行先にホストゾーンを作成します。

```shell
aws route53 create-hosted-zone \
--name example.com \
--caller-reference 2022-06-08-13:00 \
--profile role-b
```

これで移行先にホストゾーンが作成されました。
デフォルトで`NS`と`SOA`の2種類のレコードはできていると思います。

### 移行元のホストゾーンを削除

削除したいホストゾーンのIDを確認します。

```shell
aws route53 list-hosted-zones
```

対象のホストゾーンのIDを確認した上で、下記を実行します。

```shell
aws route53 delete-hosted-zone \
--id 【移行元のホストゾーンID】
```

これで移行元のホストゾーンが削除されました。

## まとめ
今回はAWSアカウント間でのドメインの移管についての手順と、それに伴うホストゾーン周りの処理をまとめました。

いろいろ試行錯誤しながら`AWS`を触って`AWS Organizations`の機能を後から知ったようなケースでは、今回のように別アカウントにドメインを移管するようなケースが出てくるかと思います。
最初からベストプラクティスの構成にするのはなかなか難しいですが、こうやってリカバリできる方法が用意されているので便利ですね。

今回の内容が役立ちましたら幸いです。

## 参考
- [AWS | AWS CLI を使用して、ある AWS アカウントから別の AWS アカウントに Route 53 ドメインを移管する方法を教えてください。](https://aws.amazon.com/jp/premiumsupport/knowledge-center/route-53-transfer-domain-other-account/)
- [別の AWS アカウントへのホストゾーンの移行](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/hosted-zones-migrating.html)
- [AWS CLI Commond Reference | disable-domain-transfer-lock](https://docs.aws.amazon.com/cli/latest/reference/route53domains/disable-domain-transfer-lock.html)
- [AWS CLI Commond Reference | transfer-domain-to-another-aws-account](https://docs.aws.amazon.com/cli/latest/reference/route53domains/transfer-domain-to-another-aws-account.html)
- [AWS CLI Commond Reference | accept-domain-transfer-from-another-aws-account](https://docs.aws.amazon.com/cli/latest/reference/route53domains/accept-domain-transfer-from-another-aws-account.html)