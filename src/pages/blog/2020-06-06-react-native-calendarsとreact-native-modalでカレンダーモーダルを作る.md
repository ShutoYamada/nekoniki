---
templateKey: blog-post
url: 20200606_react-native_calendarmodal
title: react-native-calendarsとreact-native-modalでカレンダーモーダルを作る
date: 2020-06-06T13:45:36.425Z
description: >-
  日付選択のUIは色々あると思いますが、個人的にはカレンダーが一番直感的かなと思います。

  そこで今回はReactNativeアプリを対象に、カレンダーを表示させるライブラリであるreact-native-calendarsと、モーダルを表示させるライブラリのreact-native-modalを使って、カレンダーモーダルを作りたいと思います。
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - ReactNative
  - UI
  - カレンダー
  - モーダル
  - 日付選択
  - react-native-calendars
  - react-native-modal
  - native-base
  - 便利
---
## 前提条件
- `ReactNative`のプロジェクトが作成済
- `Typescript`を使う

## ライブラリのインストール

### デザイン(`native-base`)
みんな大好き`native-base`です。
細かいデザインを気にしなくても完成度の高い見た目になるので重宝しています。

- [GitHub](https://github.com/GeekyAnts/NativeBase)

```shell
yarn add native-base
```

### カレンダー(`react-native-calendars`)
まずは`react-native-calendars`です。
こちらは`WIX`が作成したライブラリで、カレンダーを使うならこれ一択かなといった感じもします。
カレンダーのUIやスタイルを自由にカスタマイズできますが、今回は一番オーソドックスな表示に留めます。

- [GitHub](https://github.com/wix/react-native-calendars)

```shell
yarn add react-native-calendars @types/react-native-calendars
```

### モーダル(`react-native-modal`)
次に`react-native-modal`を入れます。
こちらもシンプルなモーダルライブラリとしては一番メジャーだと思います。

- [GitHub](https://github.com/react-native-community/react-native-modal)

```shell
yarn add react-native-modal @types/react-native-modal
```

### 最後に
忘れずに`pod install`を実行しましょう。

```shell
cd ios && pod install
```

## サンプルコード

モーダル上でカレンダーから日付を選択して、決定ボタンで確定する方式としました。
呼び出す際のパラメータとして、表示フラグである`visible`と確定時処理である`onConfirm`は必須となります。

```typescript:title=CalendarModal.tsx
import React, {Component} from 'react';
import { StyleSheet　} from 'react-native';
import {Icon, Text, View, Button } from 'native-base';
import Modal from 'react-native-modal'
import { Calendar, DateObject } from 'react-native-calendars';

/**
 * テーマカラー
 */
const THEME_COLOR : string = '#36C1A7';

/**
 * react-native-calendarsの形式(YYYY-MM-DD)にフォーマットする
 * @param date 
 */
const formatDate = (date: Date): string => {

    let format : string = 'YYYY-MM-DD';

    // 年
    format = format.replace(/YYYY/g, date.getFullYear().toString());
    // 月
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    // 日
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));

    return format;
};

/**
* Props
*/
interface Props {
    // 表示フラグ
    visible : boolean,
    // 選択中日付の初期値
    defaultDate?: Date,
    // 選択可能最小日付
    minDate? : Date,
    // 選択可能最大日付
    maxDate? : Date,
    // 日付決定時処理
    onConfirm : (date : Date) => void,
}

/**
* State
*/
interface State {
    selectedDate: Date,
}

/**
* カレンダーモーダル
*/
export default class CommonCalendar extends React.PureComponent<Props, State> {

    /**
    * コンストラクタ
    * @param props
    */
    constructor(props: Props){
        super(props);

        this.state = {
            selectedDate : this.props.defaultDate? this.props.defaultDate : new Date(),
        }

        this.handlePressDay = this.handlePressDay.bind(this);
        this.handlePressConfirmButton = this.handlePressConfirmButton.bind(this);
    }

    /**
    * 日付押下時処理
    * @param date
    */
    public handlePressDay(date : DateObject) {
        // selectedDateを更新
        this.setState({
            selectedDate : new Date(date.year, date.month - 1, date.day),
        })
    }

    /**
    * 決定ボタン押下時処理
    */
    public handlePressConfirmButton() {

        const { selectedDate } = this.state;

        if(this.props.onConfirm) {
            this.props.onConfirm(selectedDate);
        }
    }

    /**
    * 描画処理
    */
    render() {

        const { visible, minDate, maxDate, onConfirm } = this.props;
        const { selectedDate } = this.state;
        const selectedDateText : string = formatDate(selectedDate);

        return (
            <Modal isVisible={visible}>
                <View style={styles.container}>
                    <Text style={styles.title}>日付を選択してください</Text>
                    <Calendar current={selectedDate}
                        markedDates={{[selectedDateText] : {selected: true, selectedColor: THEME_COLOR}}}
                        minDate={minDate}
                        maxDate={maxDate}
                        renderArrow={(direction : 'left' | 'right') => {
                            if(direction === 'left') {
                                return (
                                    <Icon type="FontAwesome5" name="arrow-left" style={styles.arrow} />
                                );
                            }
                            else {
                                return (
                                    <Icon type="FontAwesome5" name="arrow-right" style={styles.arrow} />
                                );
                            }
                        }}
                        theme={{
                            todayTextColor : THEME_COLOR
                        }}
                        onDayPress={this.handlePressDay} />
                    <Button block style={styles.confirmButton} onPress={this.handlePressConfirmButton} >
                        <Text style={styles.confirmButtonText}>決定</Text>
                    </Button>
                </View>
            </Modal>
        );
    }
}

/**
* スタイル定義
*/
const styles : StyleSheet.NamedStyles<any> = StyleSheet.create({
    container : {
        backgroundColor : '#FFF',
        padding : '5%'
    },
    title : {
        color : THEME_COLOR,
        fontWeight : 'bold',
        textAlign: 'center'
    },
    arrow : {
        color : THEME_COLOR,
    },
    confirmButton : {
        marginTop : '5%',
        backgroundColor : '#FFF',
        borderColor : THEME_COLOR,
        borderWidth : 1,
        borderRadius : 10
    },
    confirmButtonText : {
        color : THEME_COLOR,
        fontWeight : 'bold',
        textAlign : 'center'
    },
});
```

### 呼び出し

```typescript:title=App.tsx
import CalendarModal from './CalendarModal';

// ...略

<CalendarModal visible={true} onConfirm={(d : Date)=>{ Alert.alert(d.toString()) }} />
```

## 表示結果

![calendar](/img/calendar.png "calendar")

## まとめ
今回は、モーダル上でカレンダーを表示して日付を選択する`UI`を作るため`react-native-calendars`と`react-native-modal`の2種類のライブラリを使いました(`native-base`も使ってますが、必須ではないためカウントしてません)。
複数ライブラリを組み合わせて自分の目的に合った`UI`が作れるようになると、開発できるアプリの幅がぐっと広まるので、是非チャレンジしてみてください！