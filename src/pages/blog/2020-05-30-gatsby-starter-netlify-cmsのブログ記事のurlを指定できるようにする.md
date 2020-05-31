---
templateKey: blog-post
url: 20200530_gatsby_cms_url
title: gatsby-starter-netlify-cmsのブログ記事のURLを指定できるようにする
date: 2020-05-30T14:37:32.439Z
description: |-
  GatsbyJSには様々なスターターが用意されており、gatsby-starter-netlify-cmsもその一つです。
  このブログもgatsby-starter-netlify-cmsをカスタムして作られています。
  基本的に痒いところに手が届く作りにはなっていますが、気になる箇所もいくつかあります。
  今回は「gatsby-starter-netlify-cmsでブログ記事のURL」を自由に指定できるようにする方法を紹介します。
featuredpost: false
featuredimage: /img/gatsby.jpg
tags:
  - Gatsby
  - GatsbyJS
  - gatsby
  - react
  - CMS
  - cms
  - Netlify
  - gatsby-starter-netlify-cms
  - ブログ
  - URL
  - url
---
## 前提条件

* `gatsby-starter-netlify-cms`で作られた環境があること

## そもそも記事URLとは？

記事URLは、個々の記事に割り当てられるURLのことです。 `gatsby-starter-netlify-cms`で環境を一通り作った場合、記事の投稿は`CMS`の投稿画面から行う(≒自分で記事の`md`ファイルを作らない)わけですが、そうした場合に記事URLは「記事の`md`ファイル名」となります。
記事の`md`ファイル名は`CMS`の投稿作成画面で入力した「TITLE」になります。
つまり、デフォルトのままではこの記事のURLは***"https://nekoniki.com/gatsby-starter-netlify-cmsのブログ記事のURLを指定できるようにする"***になるということです。

![cms_title](/img/cms_title.png "cms_title")

記事URLに日本語が入ってしまう点について、`SEO`的には問題ないのですが、エンコードされた時の見栄えが美しくない。
※`SNS`に記事を投稿した際にエンコードされてるっぽいリンクが入るのが個人的にはどうも好かないです。

## CMSで編集可能な項目を増やす
まず始めに取り掛かるのは、`CMS`の投稿画面で編集できる項目を増やすことです。
今回は[Qiita | Gatsby.js + NetlifyCMSのデータの流れまとめ(+投稿画面、URLのカスタマイズ)](https://qiita.com/program_diary/items/f9056dc0d3e017359acd)の記事を参考に`src/statc/admin/config.yml`を修正しました。
少し解説をすると、`collections`というのが`CMS`で編集可能なページ区分一覧(デフォルトでは`pages`と`blog`がある)で、その中の`fields`が対象ページを編集した際に画面から編集可能な項目です。
今回は`blog`の`fields`に`url`を追加しています。

```yml:title=config.yml
collections:
  - name: "blog"
    label: "Blog"
    folder: "src/pages/blog"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - {label: "Template Key", name: "templateKey", widget: "hidden", default: "blog-post"}
      - {label: "URL", name: "url", widget: "string"} // これを追加
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Publish Date", name: "date", widget: "datetime"}
      - {label: "Description", name: "description", widget: "text"}
      - {label: "Featured Post", name: "featuredpost", widget: "boolean"}
      - {label: "Featured Image", name: "featuredimage", widget: image}
      - {label: "Body", name: "body", widget: "markdown"}
      - {label: "Tags", name: "tags", widget: "list"}
```

正常に適用されれば`CMS`の投稿画面に`URL`の項目が追加されています。

![cms_url](/img/cms_url.png "cms_url")

## 入力したURLを反映させる
そもそも記事URLがどこで設定されているかという話になるのですが、大元は`gatsby-node.js`にあります。

```javascript{6,10}:title=gatsby-node.js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

`createFilePath`で取得した値を`slug`という名前で作成しており、これがURLになっています。
なので`md`ファイル名が記事URLになっているというわけです。

今回は`gatsby-node.js`を修正し、先ほど`CMS`で設定できるようになった`URL`を使うようにしました。

```javascript{7,12}:title=gatsby-node.js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    const url = node.frontmatter.url // URLを取得
    createNodeField({
      name: `slug`,
      node,
      // value,
      value: url? url : value // URLがあればそちらを使う
    })
  }
}
```

これで`CMS`で設定した`URL`が記事URLに反映されるようになりました。

## まとめ
今回は`CMS`の投稿作成画面で`URL`を自由に入力し、それが記事URLに反映されるようにしました。
当然ですが、この`URL`は一意である必要があるため、このブログでは基本的に「YYYYMMDD_xxx」の形式とするようルールを設けています。
この辺りは管理人の好みな部分も大きいので、ご自身のスタイルに合わせてご利用ください。

## 参考
- [Qiita | Gatsby.js + NetlifyCMSのデータの流れまとめ(+投稿画面、URLのカスタマイズ)](https://qiita.com/program_diary/items/f9056dc0d3e017359acd)