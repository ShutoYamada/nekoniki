---
templateKey: blog-post
url: 20200604_csharp_texttospeech
title: 【GCP】C#でText-to-Speech
date: 2020-06-04T08:42:39.562Z
description: |-
  今回はC#でGoogle Cloud Platform(以下GCP)のText-to-Speechを動かしてみたサンプルを紹介します。
  Text-to-Speechはその名の通り指定した文字列を読み上げてくれるすごいやつです。
featuredpost: false
featuredimage: /img/text-to-speech.png
tags:
  - C#
  - .Net
  - Google
  - Google Cloud Platform
  - GCP
  - Text-to-Speech
  - 音声読み上げ
  - その他
  - other
---
## 前提条件
- `C#`が使用可能な環境

## 関連ライブラリのインストール
下記コマンドで`Google.Cloud.TextToSpeech`をインストールします。

```shell
Install-Package Google.Cloud.TextToSpeech.V1 -Pre
```

これで関連する諸々のモジュールがインストールされます。

## GCPサービスアカウント設定

[公式のクイックスタート](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries?hl=ja)を参考に`サービスアカウントキー`を取得します。

資料上では環境変数`GOOGLE_APPLICATION_CREDENTIALS `にサービスアカウントキーのパスを配置する例が記載されていますが、今回は**パスを外からモジュールに渡す**形式をとります。

## サンプルコード
実際に動かしてみたソールは下記の通りです。
`result.mp3`ファイルが作成されると思います。

```C#

using Grpc.Auth;
using Grpc.Core;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.TextToSpeech.V1;

public class Sample
{
	public static void Main(string[] args)
	{
		// サービスアカウントの鍵ファイルパス
		// 環境変数【GOOGLE_APPLICATION_CREDENTIALS】にjsonを置いても可能です
		// その場合、下記のGoogleCredentialの取得が不要となり、
		// TextToSppechクライアントのインスタンス作成時のコンストラクタ引数が不要になります。
		string credentialFile = "./hogehoge.json";

		// GoogleCredentialを取得
		GoogleCredential gc = GoogleCredential.FromFile(credentialFile).CreateScoped(TextToSpeechClient.DefaultScopes);
		Channel channel = new Channel(TextToSpeechClient.DefaultEndpoint.Host, gc.ToChannelCredentials());

		// TextToSpeechクライアントのインスタンスを生成
		TextToSpeechClient client = TextToSpeechClient.Create(channel);

		// 読み上げ内容を生成
		string body = "<speak>音声読み上げだよ!</speak>"; 
		SynthesisInput input = new SynthesisInput();
		input.Ssml = body;

		// Voice設定(話者、言語等)
		VoiceSelectionParams voice = new VoiceSelectionParams
		{
		    // 話者(ここではja-JP-Wavenet-Aを指定)
		    Name = "ja-JP-Wavenet-A",
		    // 言語
		    LanguageCode = "ja-JP",
		    // 性別
		    SsmlGender = SsmlVoiceGender.Neutral
		};

		// 音声ファイル設定(形式、読み上げ速度等)
		AudioConfig config = new AudioConfig
		{
		    // ファイル形式
		    AudioEncoding = AudioEncoding.Mp3,
		    // 読み上げ速度(0.25～4.0の範囲で指定)
		    SpeakingRate = 1.0,
		};

		// リクエスト実行
		var response = client.SynthesizeSpeech(new SynthesizeSpeechRequest
		{
		    Input = input,
		    Voice = voice,
		    AudioConfig = config
		});

		// ファイル書き込み
		using (Stream output = File.Create("./result.mp3"))
		{
		    response.AudioContent.WriteTo(output);
		}
	}
}

```

## まとめ
今回は`C#`で`GCP`の`Tet-to-Speech`を実装してみました。
音声読み上げといっても、なかなか流暢に読み上げてくれます。
電話発信サービスである`Twilio`なんかと組み合わせると、自動応答の仕組みができたりして面白いと思います。