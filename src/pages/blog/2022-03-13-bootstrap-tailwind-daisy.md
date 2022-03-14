---
templateKey: blog-post
url: 20220313_bootstrap-tailwind-daisy
title: BootstrapとかTailwindについてざっくり調べた
date: 2022-03-13T19:00:00.000Z
description: |-
  普段はWebフロントやスマホアプリ開発をしていますが、基本的にBtoBが多いのでデザインが入ることは稀です。
  なので、BootstrapなどのCSSフレームワークに頼りがちなのですが、ここ何年かだとTailwindの隆盛が目につきます。
  実際に触ったこともあるので、どういうものかは理解できますが、改めてBootstrapなどと比べて「ここが違う」といったことをまとめた機会がなかったので調べてみました。
featuredpost: false
featuredimage: /img/coding.jpg
tags:
  - design
  - bootstrap
  - tailwind
  - daisy
  - css
---

## CSSフレームワークとUIライブラリの違い
`Bootstrap`や`Tailwind`についての記事を読むにあたって「CSSフレームワーク」と「UIライブラリ」という表現が散見されました。
明確な定義がされているわけではなさそうでしたが、どうも文脈的に以下のような使い分けで良さそうです。

### CSSフレームワーク
主には「クラス名」単位でデザインを提供する。
例えば`Bootstrap`における`btn`クラスが「ボタンの一般的なデザイン」を提供している。
ポイントは`JS`などを特に介していない単純な`CSS`ファイルの塊であるということで、極端な話 **「CDNからインポートして使えるかどうか」** がCSSフレームワークであるかどうかの指標といえる。

### UIライブラリ
ほぼ「コンポーネント」を提供するライブラリと考えてよい。
※なので厳密には「コンポーネントUIライブラリ」なのかも。

`Bootstrap`の例でいうと`react-bootstrap`などは「`Bootstrap`のデザイン`React`が使えるコンポーネント単位」で提供してくれているので、UIライブラリといえる。
その性質上、基本的には`NodeJS`などがマストである。

## Bootstrapとは
公式：https://getbootstrap.jp/

言わずと知れたCSSフレームワーク。
かつては`jQuery`に依存していたが、`v5`移行はそうでなくなった。
シェアも高く、長年この界隈で上位に居続けている。

## Tailwindとは
公式：https://tailwindcss.com/
ユーティリティファーストを謳っており、CSSプロパティのショートハンドのようなクラスを提供する。
従って、基本的に個々のクラスがデザインを持っているわけではなく、それらを組み合わせてデザインを作っていく。

## 同じものを実装して比較する
`Bootstrap`と`Tailwind`の違いを理解するためには同じようなUIを書いてみるといいかなと思い、実装してみました。

以下のようなボタンをサンプルとします。

![bootstrap-vs-tailwind.png](/img/bootstrap-vs-tailwind.png "bootstrap-vs-tailwind.png")

### Bootstrapで実装
まずは`Bootstrap`で実装したコード。

```html
<!-- header bodyなどは割愛-->
<div class="d-flex h-100">
  <button class="btn btn-warning m-auto">
    Click me
  </button>
</div>
```

### Tailwindで実装
続いて`Tailwind`。

```html
<!-- header bodyなどは割愛-->
<div class="bg-white h-full flex flex-col justify-center items-center">
  <button type="button" class="bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 px-4 py-2 focus:outline-none">
    Click me
  </button>
</div>
```

### Tailwindの方が基本的に記述は長くなる
- `Bootstrap`の`btn`にはボタンの丸みや色、枠線など諸々のプロパティがまとまっている
- 対して`Tailwind`は上記のプロパティを持つクラスを組み合わせる
- 従って、コードだけ見ると`Tailwind`の方が基本的には長くなる
  - 一応`Tailwind`側にも`@apply`という機能があり、それを使えば同等の短さにできる

### コードの記述の短さ=ベスト？
- 可読性と言う観点では短い方が良い場合が多い
- ただ、`Bootstrap`の方がカスタマイズがしにくい
  - ピクセルパーフェクトには向かない
  - デザイナ界隈から敬遠されるのはこういう理由？
  - 所謂「`Bootstrap`っぽさ」はこれが原因
- デザインが入る場合、`Tailwind`の方が柔軟に対応できそう
- とはいえ現代で`Tailwind`を使うと、漏れなく`NodeJS`が付いてくるので、デザイナの人によっては対応してもらえないかも
  - 今時はそうでもない？

## 余談
`Tailwind`にせよ`Bootstrap`にせよ、「モーダルの開閉」などの状態は`JS`で管理する必要があります。
かつては`jQuery`が担っていて、今では`Redux`や`Recoil`などの範疇です。

だた最近では、`JS`レスを謳っている`DaisyUI`というものがあるらしく、`Tailwind`をラップしているようです。

公式：https://daisyui.com/

## まとめ
今回は`Bootstrap`や`Tailwind`を比較して、それぞれの良し悪しを自分の中でまとめたものを記事にしました。
昨今ではデザイナでもゴリゴリ`JS`を触るし、プログラマでも`CSS`のことを分かってないといけないと思うので、そう言う意味では`Tailwind`が時代にマッチしているのかなと感じました。
如何せん流行り廃りの激しい分野なので、こまめに最新情報をチェックする必要があると思います。