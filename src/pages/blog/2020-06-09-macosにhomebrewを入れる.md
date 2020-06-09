---
templateKey: blog-post
url: 20200609_homebrew
title: MacOSにHomebrewを入れる
date: 2020-06-09T09:41:11.651Z
description: |-
  今回はMacOS向けにHomebrew(ホームブルー)をインストールする方法を紹介します。
  HomebrewはmacOSでは比較的メジャーなパッケージマネージャーで、これのインストールを前提としている技術記事も多いです。
featuredpost: false
featuredimage: /img/homebrew.png
tags:
  - other
  - Homebrew
  - homebrew
  - MacOS
  - Mac
  - mac
  - パッケージマネージャー
  - インストール解説
---
## インストール方法

[Homebrew公式](https://brew.sh/index_ja)にアクセスし、表示されているスクリプトをコピーします。

![](/img/homebrewinstall.png)

ターミナルにスクリプトをコピーして実行します。
```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

途中でパスワードを聞かれるので端末のログインパスワードを入力します。
`Installation Success`と表示されたら完了です。

### プロキシ環境下の場合
プロキシ環境下の場合は先に`.bash_profile`にプロキシ情報を追加する必要があります。
下記コマンドで`.bash_profile`を開きます。

```shell
vi ~/.bash_profile
```

開いたら、下記の内容を追加します。
﻿
```shell:title=.bash_profile
export HTTP_PROXY=【プロキシサーバ】
export HTTPS_PROXY=【プロキシサーバ】
export ALL_PROXY=【プロキシサーバ】
export http_proxy=【プロキシサーバ】
export https_proxy=【プロキシサーバ】
export all_proxt=【プロキシサーバ】　
```

完了したら`source`で反映させます。

```shell
source ~/.bash_profile
```

## インストール確認
正しくインストールされているかどうか`brew -v`で確認しましょう。

```shell
brew -v
Homebrew 2.2.13
Homebrew/homebrew-core (git revision 7429; last commit 2020-04-22)
Homebrew/homebrew-cask (git revision f3436; last commit 2020-04-22)
```

## まとめ
今回は`Homebrew`のインストール方法について紹介しました。
使う機会が非常に多いため、`Mac`を購入したら真っ先に入れておきたいですね。