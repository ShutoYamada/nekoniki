---
templateKey: blog-post
url: 20220324_api-gateway-image
title: API Gatewayで画像を受け取ったり返したりするサンプル
date: 2022-03-24T19:00:00.000Z
description: |-
  AWSのAPI GatewayとLambdaでREST APIを構築するケースは多いかと思います。
  その際に画像を扱う上でいくつかハマるポイントがあったので共有します。
  Lambdaプロキシ統合を用いたAPIを前提とします。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - api
  - lambda
  - image
  - jpeg
  - png
---

## バイナリメディアタイプを追加する
[AWS - REST API のバイナリメディアタイプの使用](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-payload-encodings.html)によると、以下のように書かれています。

> AWS Lambda プロキシ統合のバイナリペイロードを処理するには、関数のレスポンスを base64 でエンコードする必要があります。また、API の binaryMediaTypes を設定する必要があります。API の binaryMediaTypes 設定は、API がバイナリデータとして扱うコンテンツタイプのリストです。バイナリメディアタイプの例には、image/png または application/octet-stream が含まれます。ワイルドカード文字 (*) を使用して、複数のメディアタイプを対象にすることができます。例えば、*/* にはすべてのコンテンツタイプが含まれます。

ここでいうバイナリメディアタイプは、`API Gateway`のコンソール画面から設定できます。
左メニューから[設定]を選択し、画面下部の「バイナリメディアタイプ」に扱いたいメディアタイプを記載しましょう。
※画像全般を扱う場合は`image/*`と入れると良いです

![api_binary_media_type.png](/img/api_binary_media_type.png "api_binary_media_type.png")

## 画像を受け取るAPI
画像を受け取るAPIについては特別な処理は必要ないです。
`Lambda`上では、送られてきた画像(バイナリ)は`base64`にエンコードされた状態で`event.body`に格納されているので、デコードした上で処理を行いましょう。

実際には`S3`のバケットに格納するか、`DB`に格納するかの二択だと思います。

```js
exports.handler = async (event, context) => {
  try {
    // リクエストボディに設定された画像データはBase64エンコードされているので、デコードする
    const image = Buffer.from(event.body, 'base64');
    
    if(image) {
      
      // imageをS3に入れたり、DBに入れたり・・・

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          result: true,
        })
      };
    }
  } catch (e) {
    res.body = JSON.stringify({ success: false, message: "ERROR" + e.message });
  } finally {
    await client?.end();
    return res;
  }
};
```

## 画像を返却するAPI
画像を返却するAPIの`Lambda`は`base64`でエンコードした状態でレスポンスボディに格納する必要があります。
こちらも、画像の実体をどこで持つかによって取得方法は変わってきますが、概ね以下のようなレスポンスのイメージです。

```js
exports.handler = async (event, context) => {
  try {
    // imageは実際にはS3から取得したり、DBから取得したりする
    const imaeg = null;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png"
      },
      body: image.toString("base64")
    };
  } catch (e) {
    res.body = JSON.stringify({ success: false, message: "ERROR" + e.message });
  } finally {
    await client?.end();
    return res;
  }
};
```

あとは`API`を叩くだけなのですが、`Accept`をヘッダにつけて、値を目的の画像のメディアバイナリタイプとしましょう。
これを忘れると正常に画像が取得できません。

## まとめ
今回は`API Gateway`と`Lambda`を用いて作成する`REST API`において、画像(バイナリ)を扱う際の実装の簡単なサンプルを紹介しました。
忘れがちなのが`API Gateway`側で「メディアバイナリタイプ」を設定し忘れていたり、取得時に`Accept`をヘッダにつけていなかったり等です。
この場合、ログを見ても`Lambda`は正常に動いており、そこから先の`API Gatway`とのデータの授受で失敗しているのでなかなか気づきにくいです。

今回の内容が役立ちましたら幸いです。