---
title: "電車の遅延情報を LINE で受け取る [GAS x LINE Notify]"
description: "Google Apps Script と LINE Notify API を使って電車の遅延情報を LINE に自動で投稿するシステムを作ります"
authors: [hi120ki]
tags: [Google Apps Script, LINE, API]
slug: posts/20190803
---

Google Apps Script と LINE Notify API を使って電車の遅延情報を LINE に自動で投稿するシステムを作ります

## LINE Notify に登録して API Key を取得する

<!-- truncate -->

[LINE Notify](https://notify-bot.line.me/ja/)でアカウントを作成

マイページ → アクセストークンの発行(開発者向け) からトークンを発行

## Google Apps Script でコードを書く

遅延情報は[鉄道遅延情報の json](https://rti-giken.jp/fhc/api/train_tetsudo/)から受け取ります

> 2019/08/03 追記
>
> 鉄道遅延情報の API アドレスが変更されました。
>
> https://tetsudo.rti-giken.jp/free/delay.json

```javascript
function main() {
  var message = getDelayInfo();
  sendLinePost(message);
}

// 発行された LINE Notify アクセストークン
var LINE_TOKEN = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// LINE に引数を投稿
function sendLinePost(message) {
  var token = LINE_TOKEN;
  var options = {
    method: "post",
    payload: "message=" + message,
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}

// 鉄道遅延情報を受け取りたい鉄道路線が Json 内にあれば message を返す
function getDelayInfo() {
  var json = JSON.parse(
    UrlFetchApp.fetch(
      "https://tetsudo.rti-giken.jp/free/delay.json",
    ).getContentText(),
  );

  // 鉄道路線名
  var lineName = "xxxx";

  for (var i = 0; i < json.length; i++) {
    if (json[i]["name"] === lineName) {
      message = lineName + "が遅延しています";
    }
  }
  return message;
}
```

そして Google Apps Script のトリガーを

`実行する関数 : main`

`イベントのソースを選択 : 時間主導型`

`時間ベースのトリガーのタイプを選択 : 分ベースのタイマー`

`時間の間隔を選択（分） : 15分おき`

に設定する

これで 15 分おきに指定した路線が遅延していないかチェックし，もし遅延している場合は LINE でメッセージが来ます
