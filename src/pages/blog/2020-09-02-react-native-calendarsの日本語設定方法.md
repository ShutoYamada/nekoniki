---
templateKey: blog-post
url: 20200902_react_native_calendars_ja
title: react-native-calendarsの日本語設定方法
date: 2020-09-02T05:06:05.441Z
description: |-
  以前紹介したreact-native-calendarsの日本語化対応時の記事です。
  簡単に多言語対応できるため、非常に便利です。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react
  - javascript
  - react-native-calendars
  - カレンダー
  - 日付設定
---
## 前提条件
- `react-native-calendars`を使っている

以前に下記の記事で`react-native-calendars`をご紹介しました。
- [react-native-calendarsとreact-native-modalでカレンダーモーダルを作る](https://nekoniki.com/20200606_react-native_calendarmodal)

![calendar](/img/calendar.png "calendar")

`react-native`アプリにカレンダーの導入が簡単にできるライブラリですが、デフォルトだと英語表記です。
今回は、`react-native-calendars`の日本語対応方法を紹介します。

## `LocaleConfig`を設定
といってもやることは簡単で、`LocaleConfig`という設定をするだけです。
例えば、下記のように記載します。

```typesript
import {LocaleConfig} from 'react-native-calendars';

// react-native-calendarsの表示設定
LocaleConfig.locales['ja'] = {
  // 月の名前(フル)
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  // 月の名前(短縮表記)
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  // 曜日の名前(フル)
  dayNames: [
    '日曜日',
    '月曜日',
    '火曜日',
    '水曜日',
    '木曜日',
    '金曜日',
    '土曜日',
  ],
  // 曜日の名前(短縮表記)
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};

// デフォルトの表示設定を、今設定した`ja`に切り替え
LocaleConfig.defaultLocale = 'ja';
```

この通りに設定すると、表示は下記のようになります。

![calendar-ja](/img/calendar-ja.png "calendar-ja")

## まとめ
今回は`react-native-calendars`の日本語設定についてご紹介しました。
お手軽に多言語化できるので、個人的にはカレンダー系のライブラリではこれが一番使いやすいです。