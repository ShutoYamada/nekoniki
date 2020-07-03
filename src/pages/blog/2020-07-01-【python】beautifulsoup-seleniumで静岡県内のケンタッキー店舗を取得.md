---
templateKey: blog-post
url: 20200701_python_kfc
title: 【Python】BeautifulSoup + Seleniumで静岡県内のケンタッキー店舗を取得
date: 2020-07-01T09:35:13.104Z
description: |-
  個人的な話ですが、最近はPythonにハマっています。
  ライブラリが優秀で、ちょっとアレやりたいなと思うことがすぐにできるからです。
  今回は、スクレイピングの学習もかねて地元静岡県のケンタッキーの店舗を公式サイトから取得するスクリプトを作成してみました。
featuredpost: false
featuredimage: /img/python.png
tags:
  - python
  - beautifulsoup
  - selenium
  - bs4
  - スクレイピング
---
## 前提条件
- `python`インストール済(記事では`v3.6.6`を使用)

## はじめに
今回スクレイピングをするのは[ケンタッキーの店舗検索ページ](https://www.kfc.co.jp/search/fuken.html?t=attr_con&kencode=22)です。
URLは下記の通りとなっています。

```
https://www.kfc.co.jp/search/fuken.html?t=attr_con&kencode=22&start=1
```

パラメータの`kencode=22`が静岡県、`start=1`が1ページ目を表しています。
この記事を書いている`202年7月1日`現在では全25店舗なため、スクレイピングする必要はあまりありませんが、練習のため良しとします。

**※スクレイピング前に`robots.txt`等を確認して、スクレイピングが許可されたWebサイトかどうかを確認してください。**

今回は`robots.txt`が確認できなかったため[ご利用にあたって](https://japan.kfc.co.jp/using/?_ga=2.106814468.661407306.1593514071-424526192.1593514071)のページより、スクリプトによる自動解析等に制限がかけられていないことを確認しました。

## 前準備

### ChromeDriverインストール
`Selenium`を利用するにあたって`ChromeDriver`のインストールが必要です。
[ダウンロードページ](https://sites.google.com/a/chromium.org/chromedriver/downloads)より自身の`Chrome`のバージョンにあったドライバをダウンロードしてください。

取得したドライバは下記のディレクトリに格納すればOKです。

```
/usr/local/bin
```


### SeleniumとBeautifulSoup
今回は`Selenium`と`BeautifulSoup`を使用します。
それぞれ、ブラウザ操作とHTML解析を行うライブラリです。

```shell
pip install selenium
pip install bs4
```

## スクリプト

今回作成したスクリプトは下記の通りとなります。

```python:title=kfc.py
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# ChromeDriverオプションを設定
op = Options()
op.add_argument("--disable-gpu")
op.add_argument("--disable-extensions")
op.add_argument("--proxy-server='direct://'")
op.add_argument("--proxy-bypass-list=*")
op.add_argument("--start-maximized")
op.add_argument("--headless")
driver = webdriver.Chrome(chrome_options=op)

try :

    # ページング用パラメータ
    start = 1
    # 次へリンクの有無
    next = True

    # 「次へ」リンクが存在する限り実行
    while next != None:

        # サービス・都道府県から「静岡県」の結果が表示されたページを取得(startでページ数を指定)
        driver.get(f'https://www.kfc.co.jp/search/fuken.html?t=attr_con&kencode=22&start={start}')

        # 描画されるまで5秒程待つ
        time.sleep(5)

        # 描画されたHTMLをBeautifulSoupで解析
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # 「次へ」のリンクの有無をチェック
        next = soup.find('li', class_='next')

        # id=outShopの<ul>から
        for ul in soup.find_all('ul', id=['outShop']):
            # class=even or oddの<li>を取得し
            for li in ul.find_all('li', class_=['even', 'odd']):
                # <li>配下の<span>から店名と住所だけを抽出
                shop_name = li.find('span', class_ =['scShopName']).text
                address = li.find('span', class_=['scAddress']).text
                # 表示
                print(f'{shop_name} {address}')
        
        # 「次へ」が存在する場合はページ数をインクリメント
        if next != None:
            start+=1

except Exception as e:
    print('Error', e)

finally:
    # ドライバを終了する
    driver.quit()
```

ほぼコメントに書いてある通りですが、`<ul id="outShop">`配下の`<li>`を探索し、`<span class="scShopName">`と`<span class="scAddress">`のテキストを抜き出しています。

また、ページ中に「次へ」のリンクが存在する限り`&start=`のパラメータをインクリメントしてページングを行うようにしています。

**※複数回のリクエストが発生するスクレイピングの場合は、適切な間隔を開けましょう**

### 実行

```shell
python kfc.py
```

実行結果につきましては[ご利用にあたって](https://japan.kfc.co.jp/using/?_ga=2.106814468.661407306.1593514071-424526192.1593514071)より、転載が禁止されていますので記載を控えさせていただきます。

#### 実行時の注意点
今回はじめて`ChromeDriver`をダウンロードしてきた場合、スクリプト実行時に下記の警告が出ると思います。

![chromedriver1](/img/chromedriver1.png "chromedriver1")

その場合は【システム環境設定】の【一般】から【このまま許可】を選択してください(下図参照)。

![chromedriver2](/img/chromedriver2.png "chromedriver2")

## おまけ
今回のソースを`Git`に上げました。
- [GitHub | ShutoYamada
/
kfc-scraping-shizuoka](https://github.com/ShutoYamada/kfc-scraping-shizuoka)

## まとめ
今回はスクレイピングの学習をかねて`python`で`Selenium`と`BeautifulSoup`を用いたサンプルを作成しました。
今後、機械学習や統計の学習をするつもりなので、大量のデータを取得する手法として非常に有益な学習ができました。
ただ、取得先のサイトによって規約等が異なるので、ご利用の際はくれぐれもご注意ください。