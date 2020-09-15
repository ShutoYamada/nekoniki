---
templateKey: blog-post
url: 20200916_react_native_image_crop_picker
title: react-native-image-crop-pickerで画像を切り抜いて使用する
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