---
templateKey: blog-post
url: npx-create-react-app-v5
title: npx create-react-appが失敗するようになったら
date: 2022-01-23T13:00:10.973Z
description: >-
  久しぶりにローカル環境でReactのプロジェクトを立ち上げようとnpx
  create-react-appのコマンドを叩いたら、何やら見慣れぬエラーに遭遇しました。

  原因がよく分からず、少しだけハマったのでその時の対処法をまとめます。
featuredpost: false
featuredimage: /img/npm.jpeg
tags:
  - react
---
## 発生したエラー
通常、`React`のプロジェクトを作る際は`create-react-app`コマンドを使うかと思います。
以下のような感じです。

```shell
npx create-react-app sample-app
```

ひと昔前は`npm`や`yarn`のグローバルに`create-react-app`を入れていましたが、この手のコマンドは最近では`npx`で使うのがベターです。

しかしながら上記のようなコマンドを流した際に、以下のエラーが発生して、プロジェクトを作ることができなくなっていました。

```
You are running `create-react-app` 4.0.3, which is behind the latest release (5.0.0).

We no longer support global installation of Create React App.

Please remove any global installs with one of the following commands:
- npm uninstall -g create-react-app
- yarn global remove create-react-app
```

## どうやら`create-react-app`が`v5`になったらしい
エラーにある通り、いつの間にか`create-react-app`のバージョンが`v5`となったらしく、自分の手元のバージョン(ここでは`4.0.3`)は使えなくなったようです。

対処法としてグローバルにインストールされているであろう`create-react-app`を`npm uninstall -g create-react-app`や`yarn global remove create-react-app`で削除してくれ、とのメッセージが表示されています。

しかしながら自分の手元ではグローバルインストールしておらず、`npx`を使っているはずなのに・・・
一応当該のコマンドは流しましたが、状況は改善しませんでした。

## キャッシュも削除しないとダメだった
自分の手元であれこれ試行錯誤+Google検索で似たような事例を調べた結果、どうやら`npx`のバグのため、キャッシュを削除しないといけないようです。

そのため、キャッシュ削除用のモジュールである`clear-npx-cache`を実行します。

参考：[npm - clear-npx-cache](https://www.npmjs.com/package/clear-npx-cache)

実行コマンドは以下の通りです。

```shell
npx clear-npx-cache
```

これで冒頭で紹介したエラーが発生しなくなり、正常のプロジェクトを作成できるようになりました。

## まとめ
ここ最近は`React`で真っ新なプロジェクトを作る機会も減ったため、ちょっとだけ戸惑いましたが解決してみればなんてことない内容でした。

とはいえプロジェクト作って新しいライブラリを使ってみるぞ、というモチベーションが出鼻を挫かれる感じになるので、こういうところでは極力ハマりたくはないですよね。
同様の事例にハマった方の解決に役立てれば幸いです。