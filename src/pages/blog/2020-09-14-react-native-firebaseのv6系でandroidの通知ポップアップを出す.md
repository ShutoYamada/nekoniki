---
templateKey: blog-post
url: 20200914_react_native_firebase_android_notification
title: 【ReactNative】react-native-firebaseのv6系でAndroidの通知ポップアップを出す
date: 2020-09-14T07:17:11.421Z
description: >-
  react-native-firebaseはreact-nativeアプリにFirebaseを簡単に組み込むことができるライブラリです。

  中でもよく利用するのがプッシュ通知で、基本はガイド通りに進めていけば問題なく動作しますが、Androidの特定バージョン以降ではプッシュ通知のポップアップが表示されません。

  今回は上記のケースの対処法をご紹介します。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react
  - firebase
  - プッシュ通知
  - android
  - oreo
---
## 前提条件
- `react-native-firebase`の`v6`系(記事中では下記モジュールを使用)
  - `"@react-native-firebase/app": "8.3.1"` 
  - `"@react-native-firebase/messaging": "7.7.2`
- `react-native`は`0.6`系以上(記事中は`0.63.1`)
- [公式](https://github.com/invertase/react-native-firebase)のセットアップに従い、プッシュ通知が受信するところまでは進んでいる前提

## はじめに
`react-native-firebase`でプッシュ通知が届く状態(トークンの取得やら、受信のイベントハンドラの設置やらが完了)にしても、`Android 8`以降の端末ではプッシュ通知のポップアップが表示されず、サイレントで通知が届くと思います。
これには、まず`Android`のプッシュ通知の仕様を知る必要があります。

### なぜ`Android 8`だとサイレント通知になる？
`Android 8(Oreo)`から**通知チャンネル**という機能が追加されました。
- [公式 | 通知チャネルを作成して管理する](https://developer.android.com/training/notify-user/channels.html)

これ以降、プッシュ通知で音やポップアップを表示する場合は**通知チャンネル(カテゴリと読み替えてもいいかもしれません)**を明示的に指定しなければなりません。
`react-native-firebase/messaging`を一通り組み込んだ段階では、この通知チャンネルの指定が出来ていない状態のため、`Android 8`以降ではサイレント通知となります。

### `v5`系まではソース上で指定ができた
この通知チャンネルの指定ですが、`v5`系までは`notifications()`というモジュール以下で指定ができました。
しかし、`v6`系では廃止されたらしく、指定には少し工夫が必要です。

### `v6`系で通知チャンネルを指定する方法

#### `MainActivity`の修正
指定は`Android`のネイティブコードの中で行います。
対象は`MainActivity.java`で`android/app/src/main/java/com/{appName}`にあります。

下記のようにソースを変更します。

```java
package hogehoge;

import android.os.Bundle;
import android.os.Build; // 追加
import android.app.NotificationChannel; // 追加
import android.app.NotificationManager; // 追加
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // チャンネル作成処理を実行
        createNotificationChannel();
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "appname";
  }

  /**
   * 通知チャンネルの作成
   */
  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // 通知ID
      String id = "notification";
      // チャンネル名
      CharSequence name = "お知らせ";
      // チャンネル説明
      String description = "アプリからのお知らせ情報を通知します。";
      // 重要度
      int importance = NotificationManager.IMPORTANCE_HIGH;
      //チャンネルインスタンスを作成
      NotificationChannel channel = new NotificationChannel(id, name, importance);
      // 説明を設定
      channel.setDescription(description);

      // チャンネルマネージャインスタンスを作成しチャンネルをセット
      NotificationManager notificationManager = getSystemService(NotificationManager.class);
      notificationManager.createNotificationChannel(channel);
    }
  }
}

```

#### `firebase.json`の作成
さらにデフォルトの通知チャンネルを指定するため`firebase.json`に記載を追加します。
未作成の場合は作成しましょう。

```shell
touch firebse.json
```

```json:title=firebase.json
{
  "react-native": {
    "messaging_android_notification_channel_id": "notification"
  }
}
```

## まとめ
今回は、`react-native-firebase`のプッシュ通知を`Android 8`以降のバージョンで通知ポップアップを表示させるため、通知チャンネルを設定する方法をご紹介しました。
通知の設定周りについては`iOS`の方が面倒な印象がありますが、`Android`も`OS`のバージョンによって対応が異なるため、それなりに手間がかかりますね。

## 参考文献
- [Qiita | React Native Firebase v6 + Android 8+ でプッシュ通知受信時のポップアップ表示させる](https://qiita.com/myzkyy/items/4c286c3d096c5aaa2b3c)

## ReactNativeの学習方法
`react-native`の学習には、大元である`react`の知識もさることながら、`iOS`や`Android`といったネイティブの知識も必要になってきます。

いずれかのバックボーンを元々持っている人にとっては取り掛かりやすいかもしれませんが、`Javascript`をようやく覚えて**「さあスマホアプリを作ろう！」**と思い立った方にはなかなか高いハードルです。

そういった場合、書籍や動画といった体系的にまとめられた教材を使用するのが有効です。

ひととおりの基本知識を蓄えてから各種ライブラリや`redux`といったフレームワークを利用することになるため、何は無くとも基礎固めをしていきましょう。

以下に管理人が実際に学習した教材を紹介します。

### React Native -JavaScriptによるiOS/Androidアプリ開発の実践

特に初心者〜中級者にオススメの書籍です。
`ReactNative`の体系的な知識をぎゅっと詰め込んだ一冊となっており、
お題目に沿って進めていくことで`TODOアプリ`を開発することができます。

**※ページ量が嵩むため、`Kindle`版の購入をオススメします。**

<div class="kaerebalink-box" style="text-align:left;padding-bottom:20px;font-size:small;zoom: 1;overflow: hidden;"><div class="kaerebalink-image" style="float:left;margin:0 15px 10px 0;"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" ><img src="https://thumbnail.image.rakuten.co.jp/ran/img/2001/0009/784/297/113/919/20010009784297113919_1.jpg" style="border: none;" /></a></div><div class="kaerebalink-info" style="line-height:120%;zoom: 1;overflow: hidden;"><div class="kaerebalink-name" style="margin-bottom:10px;line-height:120%"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" >Ｒｅａｃｔ　Ｎａｔｉｖｅ ＪａｖａＳｃｒｉｐｔによるｉＯＳ／Ａｎｄｒｏｉｄア  /技術評論社/〓木健介</a><div class="kaerebalink-powered-date" style="font-size:8pt;margin-top:5px;font-family:verdana;line-height:120%">posted with <a href="https://kaereba.com" rel="nofollow" target="_blank">カエレバ</a></div></div><div class="kaerebalink-detail" style="margin-bottom:5px;"></div><div class="kaerebalink-link1" style="margin-top:10px;"><div class="shoplinkrakuten" style="display:inline;margin-right:5px"><a href="https://hb.afl.rakuten.co.jp/hgc/g0000017.scg7kd52.g0000017.scg7l6f0/kaereba_main_202009292257020471?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F42b4a32dd1c21ede6c168baa30b83770%2F&m=http%3A%2F%2Fm.product.rakuten.co.jp%2Fproduct%2F42b4a32dd1c21ede6c168baa30b83770%2F" target="_blank" >楽天市場</a></div><div class="shoplinkamazon" style="display:inline;margin-right:5px"><a href="https://www.amazon.co.jp/gp/search?keywords=React%20Native&__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&tag=stym112204-22" target="_blank" >Amazon</a></div></div></div><div class="booklink-footer" style="clear: left"></div></div>