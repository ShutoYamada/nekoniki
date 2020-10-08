---
templateKey: blog-post
url: 20201004_vscode_salesforce
title: 【Salesforce+VSCode】環境構築と拡張機能
date: 2020-10-04T05:03:49.817Z
description: |-
  SalesforceとVSCodeで開発を行う機会があったので、そのときの環境構築+便利拡張機能のメモです。
  Salesforceを使った開発自体がなかなかニッチなため、それなりに需要があるのかと思い記事にしました。
featuredpost: false
featuredimage: /img/salesforce.png
tags:
  - salesforce
  - apex
  - visualforce
  - vscode
  - 拡張機能
  - 開発
---
## 前提条件
- `node.js`インストール済(手元環境では`v10.18.1`)
- `VSCode`インストール済

## CLIインストール
`Salesforce`の各機能に関するコマンドラインツールです。
下記公式サイトにインストール手順があります。
- [Salesforce CLI のインストール](https://developer.salesforce.com/docs/atlas.ja-jp.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

`Node`が入っている前提なので、下記コマンドでグローバルインストールします。

```shell
npm install sfdx-cli --global
```

## 拡張機能の追加
やりたい事によっては不要なものもありますが、ここでは`Apex`と`Visualforce`でゴリゴリ開発をしていく人向けの拡張機能とします。

### ForceCode
`Salesforce`の環境切り分け等を行うことができるようになる拡張機能で
す。

#### インストール

```shell
code --install-extension johnaaronnelson.forcecode
```

### Apex,Visualforce
`Apex`,`Visualforce`は`Salesforce`における独自言語です。
それぞれのシンタックスハイライト等の機能を内包した拡張機能です。

#### インストール

```shell
code --install-extension salesforce.salesforcedx-vscode-apex
code --install-extension salesforce.salesforcedx-vscode-visualforce
```
### Salesforce Extension Pack
インテリセンス等の機能を持つ拡張機能です。

#### インストール

```shell
code --install-extension salesforce.salesforcedx-vscode
```

以上になります。

## まとめ
今回は`Salesforce`開発を`VSCode`で行う上で必要となる拡張機能を中心にまとめました。

`Salesforce`関連の資料は探しても見つからない(見つかっても古い)場合が多いので備忘録として残しておきます。