---
templateKey: blog-post
url: 20200818_jupyterlab_install
title: 【Python】Jupyterlabのインストール
date: 2020-08-19T11:01:01.966Z
description: |-
  Pythonでデータ分析が盛んに行われており、中でもJupyter notebookを愛用されている方は多いかと思います。
  今回はそのJupyter notebookの進化版ともいえるJupyterlabのインストール方法をご紹介します。
featuredpost: false
featuredimage: /img/jupyterlab.png
tags:
  - python
  - jupyterlab
  - データ分析
  - インストール
  - 初期設定
---
## 前提条件

* `pip`を利用できる

## Jupyterlabの特徴

`Jupyterlab`はデータ解析・機械学習を行うための統合開発環境です。 機械学習やディープラーニング用のライブラリを動作させることもできます。 
最大の特徴は、プログラムの実行結果が直後に表示されるため、結果を確認しながら分析を進めることができます。

## インストール

```shell
pip install jupyterlab
```

## 実行

```shell
jupyter lab
```

正常にインストールができている場合、ブラウザが立ち上がり、下記の画面が表示されます。

![jupyterlab_setup1](/img/スクリーンショット-2020-08-19-20.08.15.png "jupyterlab_setup1")

今回はサンプルとして`Notebook`から`Python 3`を用いて、任意のスクリプトを実行させてみます。
実際に画面上の`Notebook`から`Python 3`を押下することで下記の画面に切り替わります。

![jupyterlab_setup2](/img/スクリーンショット-2020-08-19-20.12.40.png "jupyterlab_setup2")

`Notebook`は`.ipynb`というファイル単位で管理され、任意のスクリプトを記載することができます。

試しに`print('hoge')`と入力し、画面上部の「▶︎」で実行してみましょう。
下記のように、コードのすぐ下に実行結果が表示されます。

![jupyterlab_setup3](/img/スクリーンショット-2020-08-19-20.14.30.png "jupyterlab_setup3")

このように、実行結果を確認しながらスクリプトを走らせることができるので、データ分析を行う際に非常に便利です。

## まとめ
今回は`jupyterlab`のインストールから実際に実行してみるまでをまとめました。
長くなっていまうので様々なライブラリを用いるのは応用編としたいと思います。