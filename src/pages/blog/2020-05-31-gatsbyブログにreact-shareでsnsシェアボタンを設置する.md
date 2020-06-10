---
templateKey: blog-post
url: 20200531_gatsby_react_share_sns
title: Gatsbyブログにreact-shareでSNSシェアボタンを設置する
date: 2020-05-31T00:29:57.661Z
description: |-
  今回は、Gatsbyで作られたブログにSNSシェアボタンを導入したいと思います。
  SNS関連のライブラリはいくつかありますが、今回はreact-shareを利用します。
featuredpost: false
featuredimage: /img/gatsby.jpg
tags:
  - Gatsby
  - GatsbyJS
  - React
  - react-share
  - sns
  - SNS
  - Facebook
  - LINE
  - Twitter
  - LinkedIn
  - ブログ
---
## 前提条件
- `gatsby`でブログ環境を作成済

※今回の記事はこのブログにSNSシェアボタンを導入した際の情報を公開するため、ファイル名が`gatsby-starter-netlify-cms`で作られたもの前提となっています。自作もしくは他スターターを利用の方は、適宜ファイル名を読み替えてください。

## ライブラリのインストール
下記コマンドで`react-share`をインストールしましょう。
`Facebook`や`Twitter`をはじめとした`SNS`へのリンクボタンのコンポーネンがまとまっているライブラリです。

- [GitHub](https://github.com/nygardk/react-share)

```shell
yarn add react-share
```

## 投稿記事のテンプレートに追加
あとは投稿記事のテンプレートにシェアボタンのコンポーネントを配置するだけです。
このブログでは`Facebook`,`LINE`,`LinkedIn`,`Twitter`の4種へのシェアボタンを追加します。
下記の例では、それらをまとめて`SNSSection`というコンポーネントにしています。

```javascript:title=blog-post.js
// ...
import { 
  FacebookShareButton, 
  FacebookIcon, 
  LineShareButton, 
  LineIcon,
  LinkedinShareButton, 
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';

// SNSシェアボタンセクション
// title : 記事タイトル
// articleUrl : 記事URL
const SNSSection = ({title
, articleUrl}) => {
  return (
    <div>
      <FacebookShareButton url={articleUrl}>
        <FacebookIcon size={50} round />
      </FacebookShareButton>

      <LineShareButton url={articleUrl} >
        <LineIcon size={50} round />
      </LineShareButton>

      <LinkedinShareButton url={articleUrl} >
        <LinkedinIcon title={title} size={50} round />
      </LinkedinShareButton>

      <TwitterShareButton title={title} via="@inouetakumon" url={articleUrl} >
        <TwitterIcon size={50} round />
      </TwitterShareButton>
    </div>
  )
}
```

あとはこの`SNSSection`を投稿記事の好きな位置に配置するだけです。
同じく`blog-post.js`の`BlogPostTemplate`に追記します。
さらに多少スタイルに手を加えることで、下記のようにシェアボタンが表示されます。

![sns_share](/img/sns_share.png "sns_share")


### 注意点
これで問題なく記事のシェアはできるのですが`gatsby-starter-netlify-cms`で作った記事はデフォルトではURLに日本語が含まれる可能性があり、エンコードされた`URL`で`SNS`に投稿されてしまいます。
その場合は[gatsby-starter-netlify-cmsのブログ記事のURLを指定できるようにする](https://nekoniki.com/20200530_gatsby_cms_url)の記事を参考に、記事URLを自身で設定するのがオススメです。

## まとめ
今回は`react-share`を使って`SNS`へのシェアボタンを`Gatsby`ブログに導入しました。
検索流入以外の導線を作るという意味では`SNS`は非常に有効な手段といえるので、早いうちに導入するのがオススメです！

## 参考
- [GitHub](https://github.com/nygardk/react-share)