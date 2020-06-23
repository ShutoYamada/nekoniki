---
templateKey: blog-post
url: 20200526_windows_typescript_reactnative
title: WindowsOSでTypescript+ReactNativeの環境構築
date: 2020-05-26T08:36:19.817Z
description: |-
  以前にMacOSで「Typescript+ReactNative」の環境構築手順を紹介しましたが、今回はWindows版となります。
  基本的にやることは同じなのですが、一部必要なものやコマンドが違うため注意です。
featuredpost: true
featuredimage: /img/react-native.jpg
tags:
  - react-native
  - react
  - Windows
  - クロスプラットフォーム
  - アプリ開発
---
![react-native](/img/react-native.jpg "react-native")

## 前提条件
- `AndroidStudio`がインストール済
- `Node.js`がインストール済
- `VScode`がインストール済
- `npm`もしくは`yarn`がインストール済

**※例によってこの記事は[Qiitaに載せた内容](https://qiita.com/nekoniki/items/054c22f3072141bf6aea)のリライト記事です。
あちらの内容が若干古くなった感もあるので、改めて書き直しました。**

## react-native-cliインストール
まずは`react-native`の`CLI`をインストールします。
グローバルに入れておくのがオススメです。

```shell
yarn global add react-native-cli
```
## プロジェクトを作成
`react-native init`で新規プロジェクトが作成できます。
ここでは`sample`という名前でプロジェクトを作ります。

```shell
react-native init sample
```

作成できたらプロジェクト配下に移動しましょう。

```shell
cd sample
```

## Typescript関連のモジュールをインストール
`Typescript`に関するモジュールをインストールします。

```shell
yarn add --dev typescript
yarn add --dev react-native-typescript-transformer
yarn add --dev @types/react 
yarn add --dev @types/react-native
```
### 関連ファイルの作成
下記のコマンドを実行することで、`tsconfig.json`と`rn-cli.config.js`が作成されます。

```shell
yarn tsc --init --pretty --jsx react-native
copy nul rn-cli.config.js
```
`tsconfig.json`は`lib`と`allowSyntheticDefaultImports`の値を変えて、さらに末尾に`exclude`を追加しましょう。

```json:title=tsconfig.json
{
  "compilerOptions": {
  ...
  "lib": ["es2015"], // "es2015"を記入
  "allowSyntheticDefaultImports": true,  // コメントアウトを外す
  ...
  },
  // 下記を丸ごと追加
  "exclude": [
    "node_modules"
  ]
}
```

`rn-cli.config.js`は中身を下記の通りにします。

```js:title=rn-cli.config.js
module.exports = {
    getTransformModulePath() {
        return require.resolve("react-native-typescript-transformer");
    },
    getSourceExts(){
        return["ts","tsx"];
    }
}
```


## tslintとprettierをインストール
`tslint`や`prettier`を入れるかは好みな部分もありますが、個人的には意識せずに記法が統一されるのでオススメです。

```shell
yarn add --dev prettier
yarn add --dev tslint tslint-react
yarn add prettier --dev tslint-config-prettier tslint-plugin-prettier
```

`.prettierrc.js`がない場合は作成します。
自分は内容は下記の通りにしています。

```javascript:title=.prettierrc.js
module.exports = {
  bracketSpacing: false,
  jsxBracketSameLine: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
};


```

同様にして`tslint.json`も編集します。
ちなみに自分の`tslint.json`は下記設定で使っています。主には`rules`の中の値を変更するかと思います。
個人でやる分にはほとんど`false`でいいと思いますが、ラムダ式やインターフェースの名称、`import`のアルファベット順あたりは好みによって変更してください。

```json:title=tslint.json
{
    "extends": ["tslint:recommended", "tslint-react", "tslint-config-prettier"],
    "rules": {
        "jsx-no-lambda": false,
        "member-access": false,
        "interface-name": false,
        "prefer-for-of": false,
        "ordered-imports": false,
        "object-literal-sort-keys": false,
        "no-console": false
    },
    "linterOptions": {
        "exclude": [
            "config/**/*.js",
            "node_modules/**/*.js",
            "coverage/lcov-report/*.js"
        ]
    }

}
```


## その他設定

### srcを作成しとApp.jsを修正
デフォルトだとルート直下にソースが増えていくことになるので、`src`フォルダ下にまとめるようにします。
同じタイミングで`App.js`を`App.tsx`にリネームします。

```shell
mkdir src
move App.js src/App.tsx
```

`App.js`のパスが変わったので、参照している`index.js`を修正します。

```javascript:title=index.js
/**
 * @format
 */

import {AppRegistry} from 'react-native';
// import App from './App';  // 削除
import App from './src/App'; // 追加
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### package.jsonの修正
デフォルトだと`react-native run-android`で実行することができますが、簡略して`yarn run-android`で実行できるようにします。
`iOS`でのアプリ開発も視野に入れる場合は`run-ios`も追加しておきましょう。

```json:title=package.json
{
  "scripts": {
    ...
    "run-ios": "react-native run-ios",
    "run-android": "react-native run-android"
  },
}
```

### images.d.tsの作成
`JPEF`や`PNG`,`SVG`などの画像ファイルを`import`できるようにします。

```shell
copy nul images.d.ts
```

中身は下記のようにします。

```typescript:title=images.d.ts
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
```

## 実行
`AndroidStudio`の`AVD Manager`から好きなエミュレータを起動した状態で`yarn run-android`コマンドで実行します。

```shell
yarn run-android
```

エミュレータが立ち上がり、下記の通り表示されたら成功です。
**※タブレット端末で実行したため、ちょっと横に長いレイアウトになっています。**

![react-native-start-android](/img/react-native-start-android.png "react-native-start-android")

## まとめ
今回は`MacOS`で`Typescript+ReactNative`の環境構築から作成したプロジェクトの実行までをまとめました。
気づけばバージョンも`0.62`となり、ますます便利になっていく`ReactNative`ですが、初期設定周りがちょっと多めなのが初見殺しっぽいですね。
しかし、ワンソースで`iOS`と`Android`の両方のアプリが開発できるのはやはり魅力的なので、今後もオススメライブラリを紹介していきたいと思います。

## 参考
- [TypeScript-React-Native-Starter](https://github.com/Microsoft/TypeScript-React-Native-Starter)
