---
templateKey: blog-post
url: 20200916_react_native_image_crop_picker
title: 【ReactNative】react-native-image-crop-pickerで画像を切り抜いて使用する
date: 2020-09-15T23:16:57.931Z
description: >-
  react-nativeで画像選択をしたい場合、だいたいはImagePickerを使っているかと思います。

  ただ、SNSのプロフィール画像設定UIでよくあるような「特定の形に画像を切り抜いて選択する」場合は、react-native-image-crop-pickerを使うのがおすすめです。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react
  - react-native
  - react-native-image-crop-picker
  - ui
  - 画像選択
---
## 前提条件
- `react-native 0.63.1`
- `react-native-image-crop-picker 0.33.2`

## 参考
- [GitHub](https://github.com/ivpusic/react-native-image-crop-picker)

## インストール
下記コマンドで`react-native-image-crop-picker`をインストールします。

```shell
yarn add react-native-image-crop-picker
```

### インストール(iOS)

`iOS`の場合は`pod install`を行います。

```shell
cd ios && pod install
```

さらに`Info.plist`に`NSPhotoLibraryUsageDescription`と`NSCameraUsageDescription`と`NSMicrophoneUsageDescription`のテキストを追加します。

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>ほげほげ</string>
<key>NSCameraUsageDescription</key>
<string>ほげほげ</string>
<key>NSMicrophoneUsageDescription</key>
<string>ほげほげ</string>
```

### インストール(Android)
`android/build.gradle`に下記を追加します。

```
allprojects {
    repositories {
      mavenLocal()
      jcenter()
      maven { url "$rootDir/../node_modules/react-native/android" }

      // ADD THIS
      maven { url 'https://maven.google.com' }

      // ADD THIS
      maven { url "https://www.jitpack.io" }
    }
}
```

さらに`android/app/build.gradle`に下記を追加します。

```
android {
    compileSdkVersion 27
    buildToolsVersion "27.0.3"
    ...

    defaultConfig {
        ...
        vectorDrawables.useSupportLibrary true
        targetSdkVersion 27
        ...
    }
    ...
}
```

## 使用方法
使用感は`ImagePicker`と変わらないです。
以下はアルバムから任意の画像を1枚選択肢、`500*500`の正方形に画像を切り抜くUI実装のサンプルです。
※他にも、複数選択や動画選択などの機能があります。

```javascript
import ImagePicker from 'react-native-image-crop-picker';

// ImagePickerで画像を切り抜いて保存
ImagePicker.openPicker({
  width: 500,
  height: 500,
  cropping: true, // Cropをさせる
  mediaType: 'photo', // 写真のみ
  includeBase64: true, // 出力結果にbase64を含める(trueの場合、出力に`data`のプロパティが含まれる)
}).then((image) => {
  console.log(image);
  // パスは image.path
  // ファイル名は image.fileName ※iOS限定
  // base64は image.data ※includeBase64の指定必須
});
```

## 出力
以下のようなUIになります。

![crop](/img/crop.png "crop")

## まとめ
今回は`react-native-image-crop-picker`のインストールと基本的な使い方についてご紹介しました。
本家の`ImagePicker`を拡張したような使い勝手なので、あちらを使ったことがある場合は難なく導入できるかなと思います。

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