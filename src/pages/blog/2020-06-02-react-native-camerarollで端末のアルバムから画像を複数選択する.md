---
templateKey: blog-post
url: 20200602_react-native-cameraroll
title: react-native-camerarollで端末のアルバムから画像を複数選択する
date: 2020-06-02T11:55:27.594Z
description: "アプリを作っていると、画像を扱う機会も自然と増えます。

  \rよくあるUIで「FacebookやInstagramのようにカメラロール等のアルバムをグリッド表示して、画像を複数選択する」というものがあります。

  今回はreact-native-communityが提供しているreact-native-camerarollを使って同じようなUIを作る方法をご紹介\
  します。"
featuredpost: false
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - CameraRoll
  - react-native-cameraroll
  - カメラロール
  - アルバム
  - album
  - photo
  - image
  - 写真
  - iOS
  - Android
  - javascript
  - typescript
  - Facebook
  - Instagram
  - UI
---
## 前提条件
- `ReactNative`のプロジェクト作成済
- `native-base`インストール済(必須ではありませんが、サンプルコードで使っています)

## ライブラリのインストール
下記コマンドで`react-native-cameraroll`をインストールします。
以前は`react-native`の中にあった`CameraRoll`のモジュールのようです。
- [GitHub](https://github.com/react-native-community/react-native-cameraroll)

```shell
yarn add @react-native-community/cameraroll
```

## OSごとに設定
このライブラリに限らず、画像系を扱う場合はパーミッションの追加等々が必要です。
手元のOSに合わせて設定を行ってください。
いずれも`autoLink`が利いている前提です。
**※手動でリンクを行う場合は[公式のManual Installation](https://github.com/react-native-community/react-native-cameraroll#manual-installation)を参考にしてください。**

### iOS
まずは`pod install`を行います。

```shell
cd ios && pod install
```


続けて`Info.plist`を編集します。
パスは`ios/{アプリ名}/Info.plist`です。

`iOS 10`以降は`NSPhotoLibraryUsageDescription`が必須です。

```xml:title=Info.plist
<key>NSPhotoLibraryUsageDescription</key>
<string>使用目的を記載</string>
```

`iOS 11`以降は`NSPhotoLibraryAddUsageDescription`が必須です。

```xml:title=Info.plist
<key>NSPhotoLibraryAddUsageDescription</key>
<string>使用目的を記載</string>
```

### Android
`AndroidManifest.xml`を編集します。
パスは`android/app/src/main/AndroidManifest.xml`です。
`<manifest>`内に下記を追加してください。

```xml:title=AndroidManifest.xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

## 使い方
使用する関数は少ないです。
画像の保存を行う`save()`や削除を行う`deletePhotos()`もありますが、今回は下記の2種のみ使用します。

### アルバムを取得する`getAlbums()`
`getAlbums()`でアルバムの配列を取得します。
`count`がアルバム内の画像(動画)数、`title`がアルバム名です。

```typescript:Test.tsx
import CameraRoll from '@react-native-community/cameraroll';

// 引数で取得するアルバム種別を指定できる
// assetTypeは`All`,`Videos`,`Photos`のいずれか
CameraRoll.getAlbums({assetType : ‘All’}).then((albums : CameraRoll.Alubm[]) => {
  console.log(albums);
  // -> [ { "count" : 10, "title" : “test” }, ... ]
})
```

### 画像を取得する`getPhotos()`
`getPhotos()`で画像の配列(と付随する情報)を取得します。
引数の`first`のみ必須です。
`groupTypes`にAllを指定している場合`groupName`でアルバム名を指定しても絞り込まれないようです。

```typescript:Test.tsx
import CameraRoll from '@react-native-community/cameraroll';

CameraRoll.getPhotos({first : 100, groupTypes : 'All', groupName : 'Test'})
.then((obj : CameraRoll.PhotoIdentifiersPage) => {
  // obj.egges内に画像データが存在する
});
```

## サンプルコード
上記の内容を踏まえて、`アルバムの選択`と`その配下の画像をグリッド表示`して選択させるコンポーネントを作成しました。
内容は下記の通りとなっています。
分かりを良くするため多少冗長に書いている箇所もあります。
ご利用の際は、適宜修正することをオススメします。

```typescript:Test.tsx
import React from 'react';
import { Text, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { Container, Header, Body, Title, View, Picker, Content } from 'native-base';
import CameraRoll from '@react-native-community/cameraroll';

/**
* State
*/
interface State {
    // 画像リスト
    images : CameraRollImage[],
    // 選択中の画像URIリスト
    selectedImages : string[],
    // アルバムリスト
    albums : CameraRoll.Album[],
    // 画像取得先アルバム名
    selectedAlbumName : string,
}


/**
* カメラロールから取得した画像クラス
*/
interface CameraRollImage {
    filename: string;
    uri: string;
    height: number;
    width: number;
    fileSize: number;
    isStored?: boolean;
    playableDuration: number;
}


export default class CameraRollTestScreen extends React.Component<{}, State> {

    /**
     * constructor
     * @param props
     */
    constructor(props: {}){
        super(props);
        this.state = {
            images : [],
            selectedImages : [],
            albums : [],
            selectedAlbumName : 'All',
        }

        this.getAlbums = this.getAlbums.bind(this);
        this.getPhotoImages = this.getPhotoImages.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleAlbumChange = this.handleAlbumChange.bind(this);
    }


    /**
     * コンポーネント描画後処理
     */
    componentDidMount() {
        // アルバム取得
        this.getAlbums();
        // 画像取得
        this.getPhotoImages(this.state.selectedAlbumName);
    }


    /**
     * アルバム取得処理
     */
    public getAlbums() {
        // アルバムを取得
        CameraRoll.getAlbums({assetType : 'Photos'})
        .then((albums : CameraRoll.Album[]) => {
            // setState
            this.setState({ albums : albums });
        })
        .catch((err)=>{
            console.log("err",err)
        })
    }


    /**
     * 画像取得処理
     * @param selectedAlbumName 取得対象アルバム
     */
    public getPhotoImages(selectedAlbumName : string){
        // selectedAlbumNameに指定がない(=All)の場合はgroupTypesをAllにする
        let groupTypes : 'All' | 'Album' = selectedAlbumName === 'All'? 'All' : 'Album';

        // 指定した取得先から画像を取得する
        CameraRoll.getPhotos({first : 100, groupTypes : groupTypes, groupName : selectedAlbumName})
        .then((obj : CameraRoll.PhotoIdentifiersPage) => { 
            const images : CameraRollImage[] = obj.edges.map((asset : CameraRoll.PhotoIdentifier) => {
                return asset.node.image
            });

            this.setState({ images: images, selectedImages: []})
        })
    }


    /**
     * 画像クリック時処理
     * @param image クリックされた画像
     */
    public handleClick(image : CameraRollImage) {
        // 選択済みのuriリストをstateから取得
        let selectedImages = this.state.selectedImages;

        // 既にselectedImagesに格納済みの場合は削除する
        if(selectedImages.indexOf(image.uri) >= 0){
            selectedImages.splice(selectedImages.indexOf(image.uri), 1);
        }
        // selectedImagesにuriを追加
        else {
            selectedImages.push(image.uri);
        }
        // setState
        this.setState({selectedImages: selectedImages})
    }


    /**
     * アルバム選択処理
     * @param value 選択したアルバム
     */
    public handleAlbumChange(value : string) {
        // 選択したアルバムをstateに格納
        this.setState({selectedAlbumName : value});
        // 選択したアルバム下の画像を取得
        this.getPhotoImages(value);
    }


    render() {

        const { images, selectedImages, albums, selectedAlbumName } = this.state;

        // アルバム選択Pickerの作成
        let albumPickerItems : JSX.Element[] = [];
        albumPickerItems = albums.map((album : CameraRoll.Album, index : number) => {
            return(
                <Picker.Item key={'picker_' + index} value={album.title} label={album.title} />
            )
        })


        // 画像グリッドの作成
        let imageGrids : JSX.Element[] = [];
        imageGrids = images.map((image : CameraRollImage) => {

                // 選択時に表示するバッジ要素
                let badge : JSX.Element | null = null;
                // 選択した画像の場合、バッジを作成する
                if(selectedImages.indexOf(image.uri) >= 0){

                // 選択順を決定
                const selectedOrder : number = selectedImages.indexOf(image.uri) + 1;

                badge = (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selectedOrder.toString()}</Text>
                    </View>
                )
            }

            return (
                <TouchableHighlight key={image.uri} onPress={() => this.handleClick(image)}>
                    <View>
                        <Image style={styles.image} source={{uri: image.uri}} />
                        {badge}
                    </View>
                </TouchableHighlight>
            )
        })

        return(
            <Container>
                <Header>
                    <Body>
                        <Title>CameraRoll Test</Title>
                    </Body>
                </Header>
                <Content>
                    <Text>アルバムを選択</Text>
                    <Picker selectedValue={selectedAlbumName} onValueChange={this.handleAlbumChange} style={{borderColor : 'blue', borderWidth : 1, margin : 10}} >
                        <Picker.Item key={'all'} label={'All'} value={'All'} />
                        {albumPickerItems}
                    </Picker>
                    <Text style={styles.albumName}>{`表示中アルバム：${selectedAlbumName}`}</Text>
                    <Text>{`選択画像件数：${selectedImages.length.toString()}件`}</Text>
                    <View style={styles.imageGrid} >
                        {imageGrids}
                    </View>
                </Content>
            </Container>
        )
    }
}


const styles = StyleSheet.create({
    imageGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
    },
    badge: {
        position: "absolute",
        top: 10,
        left: 10,
        width : 15,
        backgroundColor : '#FFF',
        borderRadius : 10,
    },
    badgeText : {
        color : 'blue',
        textAlign : 'center'
    },
    picker : {
        borderColor : 'blue',
        borderWidth : 1,
        margin : 10
    },
    albumName : {
        color : 'blue'
    }
});

```

### 表示結果
![cameraroll](/img/cameraroll.png "cameraroll")

## まとめ
今回は`react-native-cameraroll`を使って、アルバムから画像を複数選択する`UI`をコーディングしてみました。
デザインは違えど大概のアプリで使われている`UI`ですので、是非一度お手元の環境でお試しください。