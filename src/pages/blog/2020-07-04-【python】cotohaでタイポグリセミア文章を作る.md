---
templateKey: blog-post
url: 20200704_cotoha_python
title: 【Python】COTOHAでタイポグリセミア文章を作る
date: 2020-07-04T08:56:33.022Z
description: |-
  Pythonで自然言語処理を行った際のコードを紹介します。
  COTOHA APIという非常に便利なライブラリを使うことで随分と簡単に実装ができました。
featuredpost: false
featuredimage: /img/python.png
tags:
  - python
  - 自然言語処理
  - cotoha
  - api
---
## 注意事項

この記事は[Qiitaに投稿した記事](https://qiita.com/nekoniki/items/237b8fe46467b5dca28d)のリライト記事になります。

## 前提条件

* `python`インストール済(記事では`v3.6.6`を使用)

# はじめに

いきなりですが、以下の文章をざっと読んでみてください。

> こんちには みさなん おんげき ですか？　わしたは げんき です。 この ぶんょしう は いりぎす の ケブンッリジ だがいく の けゅきんう の けっか
> にげんんは たごんを にしんき する ときに
>
> その さしいょ と さいご の もさじえ あいてっれば じばんゅん は めくちちゃゃ でも ちんゃと よめる という けゅきんう に もづいとて
> わざと もじの じんばゅん を いかれえて あまりす。
> どでうす？　ちんゃと よゃちめう でしょ？

どうですか？意外とすんなり読めるのではないでしょうか。 この文章は(個人的には)割と有名なコピペで、正式名称を[タイポグリセミア](https://ja.wikipedia.org/wiki/%E3%82%BF%E3%82%A4%E3%83%9D%E3%82%B0%E3%83%AA%E3%82%BB%E3%83%9F%E3%82%A2)というらしいです。

カラクリをざっくりと説明すると、**人間は単語を認識する際に１文字ごとに理解するのではなく文字の集合として視覚的に認識**しています。
その際に、脳内で単語を瞬時に理解・予測しているため、**単語を構成する文字が多少入れ替わっても補正されて読むことができる**そうなのです。 
***※これらの補正は個人の知識やボキャブラリーに依存するため、個人差があります。***

今回は[COTOHA API](https://api.ce-cotoha.com/contents/index.html)で提供されている[構文解析API](https://api.ce-cotoha.com/contents/reference/apireference.html#parsing)を使って、入力された文章を解析してタイポグリセミア文章として出力します。

# 出力結果

```shell
before :
PythonとCOTOHAを使用して出力されたタイポグリセミア文章をブログに投稿
after :
pyohtn と cootha を しよう し て しゅりつょく さ れ た たぽせみりぐいあ ぶょしんう を ぶろぐ に とこうう
```

なんともそれっぽい結果に！！

# COTOHAについて

`COTOHA`とはNTTコミュニケーションズが提供する**自然言語処理・音声処理APIプラットフォーム**です。 今回の記事で紹介する`構文解析`以外にも`固有表現抽出`・`照応解析`・`キーワード抽出`・`類似度算出`・`文タイプ判定`・`ユーザ属性推定`・`感情分析`・`要約`などなど様々な機能が用意されています。

無料枠内でも各APIを**1000コール/日**使用できるため、軽く遊びで動かしてみることも可能です。 

ユーザの無料登録は[COTOHA API Portal](https://api.ce-cotoha.com/contents/index.html)からできます。 
いくつかの基本項目を入力すると、APIを利用するためのユーザIDとシークレットが発行されるので、もし以降のスクリプトをお手元で試したい場合は控えておいてください。

# 実装サンプル

以下の記事を参考にさせていただきました。 
どちらの記事も非常に分かりやすくまとまっているので非常にオススメです！

* [自然言語処理を簡単に扱えると噂のCOTOHA APIをPythonで使ってみた](https://qiita.com/gossy5454/items/83072418fb0c5f3e269f)
* [「メントスと囲碁の思い出」をCOTOHAさんに要約してもらった結果。COTOHA最速チュートリアル付き](https://qiita.com/youwht/items/16e67f4ada666e679875)

ベースは上の記事を参考にしていますが、APIのエンドポイント部分をちょっとだけいじってあります。 
元は`BASE_URL`に`nlp`まで含めてありましたが、COTOHA公式のフォーマットに合わせて省いています。

<details><summary>メインプログラム</summary><div>

```python:title=cotoha_api.py
# -*- coding:utf-8 -*-

import os
import urllib.request
import json
import configparser
import codecs

import re
import jaconv
import random


# COTOHA API操作用クラス
class CotohaApi:
    # 初期化
    def __init__(self, client_id, client_secret, developer_api_base_url, access_token_publish_url):
        self.client_id = client_id
        self.client_secret = client_secret
        self.developer_api_base_url = developer_api_base_url
        self.access_token_publish_url = access_token_publish_url
        self.getAccessToken()

    # アクセストークン取得
    def getAccessToken(self):
        # アクセストークン取得URL指定
        url = self.access_token_publish_url

        # ヘッダ指定
        headers={
            "Content-Type": "application/json;charset=UTF-8"
        }

        # リクエストボディ指定
        data = {
            "grantType": "client_credentials",
            "clientId": self.client_id,
            "clientSecret": self.client_secret
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()

        # リクエスト生成
        req = urllib.request.Request(url, data, headers)

        # リクエストを送信し、レスポンスを受信
        res = urllib.request.urlopen(req)

        # レスポンスボディ取得
        res_body = res.read()

        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)

        # レスポンスボディからアクセストークンを取得
        self.access_token = res_body["access_token"]


    # 構文解析API
    def parse(self, sentence):
        # 構文解析API URL指定
        url = self.developer_api_base_url + "nlp/v1/parse"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "sentence": sentence
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # 固有表現抽出API
    def ne(self, sentence):
        # 固有表現抽出API URL指定
        url = self.developer_api_base_url + "nlp/v1/ne"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "sentence": sentence
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # 照応解析API
    def coreference(self, document):
        # 照応解析API 取得URL指定
        url = self.developer_api_base_url + "beta/coreference"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "document": document
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # キーワード抽出API
    def keyword(self, document):
        # キーワード抽出API URL指定
        url = self.developer_api_base_url + "nlp/v1/keyword"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "document": document
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # 類似度算出API
    def similarity(self, s1, s2):
        # 類似度算出API URL指定
        url = self.developer_api_base_url + "nlp/v1/similarity"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "s1": s1,
            "s2": s2
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # 文タイプ判定API
    def sentenceType(self, sentence):
        # 文タイプ判定API URL指定
        url = self.developer_api_base_url + "nlp/v1/sentence_type"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "sentence": sentence
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body


    # ユーザ属性推定API
    def userAttribute(self, document):
        # ユーザ属性推定API URL指定
        url = self.developer_api_base_url + "beta/user_attribute"
        # ヘッダ指定
        headers={
            "Authorization": "Bearer " + self.access_token,
            "Content-Type": "application/json;charset=UTF-8",
        }
        # リクエストボディ指定
        data = {
            "document": document
        }
        # リクエストボディ指定をJSONにエンコード
        data = json.dumps(data).encode()
        # リクエスト生成
        req = urllib.request.Request(url, data, headers)
        # リクエストを送信し、レスポンスを受信
        try:
            res = urllib.request.urlopen(req)
        # リクエストでエラーが発生した場合の処理
        except urllib.request.HTTPError as e:
            # ステータスコードが401 Unauthorizedならアクセストークンを取得し直して再リクエスト
            if e.code == 401:
                print ("get access token")
                self.access_token = getAccessToken(self.client_id, self.client_secret)
                headers["Authorization"] = "Bearer " + self.access_token
                req = urllib.request.Request(url, data, headers)
                res = urllib.request.urlopen(req)
            # 401以外のエラーなら原因を表示
            else:
                print ("<Error> " + e.reason)

        # レスポンスボディ取得
        res_body = res.read()
        # レスポンスボディをJSONからデコード
        res_body = json.loads(res_body)
        # レスポンスボディから解析結果を取得
        return res_body



if __name__ == '__main__':
    # ソースファイルの場所取得
    APP_ROOT = os.path.dirname(os.path.abspath( __file__)) + "/"

    # 設定値取得
    config = configparser.ConfigParser()
    config.read(APP_ROOT + "config.ini")
    CLIENT_ID = config.get("COTOHA API", "Developer Client id")
    CLIENT_SECRET = config.get("COTOHA API", "Developer Client secret")
    DEVELOPER_API_BASE_URL = config.get("COTOHA API", "Developer API Base URL")
    ACCESS_TOKEN_PUBLISH_URL = config.get("COTOHA API", "Access Token Publish URL")

    # COTOHA APIインスタンス生成
    cotoha_api = CotohaApi(CLIENT_ID, CLIENT_SECRET, DEVELOPER_API_BASE_URL, ACCESS_TOKEN_PUBLISH_URL)

    # 解析対象文
    sentence = "PythonとCOTOHAを使用して出力されたタイポグリセミア文章をブログに投稿"

    # 整形前を表示
    print('before :')
    print(sentence)

    # 構文解析API実行
    result_json = cotoha_api.parse(sentence)

    # 整形前の文字列リスト
    word_list_base = []
    # 整形後の文字列リスト
    word_list = []

    alnumReg = re.compile(r'^[a-zA-Z0-9 ]+$')

    for i in range(len(result_json['result'])):
        for j in range(len(result_json['result'][i]['tokens'])):
            word = result_json['result'][i]['tokens'][j]['form']
            kana = result_json['result'][i]['tokens'][j]['kana']
            # 半角英数字か判定
            if alnumReg.match(word) is not None:
                # 1単語かそうでないかを判定
                if ' ' in word:
                    # 複数後で構成される場合は
                    word_list_base.extend(word.split(' '))
                else :
                    word_list_base.append(word)
            # 日本語
            else :
                # カタカナをひらがなに変換してリストに追加
                word_list_base.append(jaconv.kata2hira(kana))
            
    # 各単語を解析し4文字以上の文字の先頭と末尾以外を入れ替える
    for i in range(len(word_list_base)):
        # 4文字以上
        if len(word_list_base[i]) > 3:
            # まず1文字ずつのリストに分解
            wl_all = list(word_list_base[i])
            # 先頭文字と末尾文字を保持しておく
            first_word = wl_all[0]
            last_word = wl_all[len(wl_all) - 1]
            # 中の文字をリスト形式で取得
            wl = wl_all[1:len(wl_all) - 1]
            # シャッフルする
            random.shuffle(wl)
            word_list.append(first_word + ''.join(wl) + last_word)
        # 4文字未満ならそのまま
        else :
            word_list.append(word_list_base[i])

    # 整形結果を表示
    print('after :')
    print(' '.join(word_list))
```

</div></details>

<details><summary>設定ファイル</summary><div>

```config.ini
[COTOHA API]
Developer API Base URL: https://api.ce-cotoha.com/api/dev/
Developer Client id: 【クライアントID】
Developer Client secret: 【クライアントシークレット】
Access Token Publish URL: https://api.ce-cotoha.com/v1/oauth/accesstokens
```

</div></details>

使い方は`config.ini`にクライアントIDとシークレットを入力し、`cotoha_api.py`と同じ階層に置きます。 実行は下記の通りです。

```shell
python cotoha_api.py
```

# まとめ

`Python`や`自然言語処理`に関する知識はほとんどないにも関わらず実装まで漕ぎ着けることができました。 
そんな状態でも個人的には満足な結果が得られたので`COTOHA`は非常に扱いやすく、入門としても最適なのではないでしょうか。

この記事を読んで少しでも`COTOHA`に興味を持っていただけたら幸いです。

# 参考

* [COTOHA APIリファレンス](https://api.ce-cotoha.com/contents/reference/apireference.html)
* [自然言語処理を簡単に扱えると噂のCOTOHA APIをPythonで使ってみた](https://qiita.com/gossy5454/items/83072418fb0c5f3e269f)
* [「メントスと囲碁の思い出」をCOTOHAさんに要約してもらった結果。COTOHA最速チュートリアル付き](https://qiita.com/youwht/items/16e67f4ada666e679875)