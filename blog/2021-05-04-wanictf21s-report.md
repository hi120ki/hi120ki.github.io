---
title: "WaniCTF'21-spring 開催記"
description: "WaniCTF'21-spring 開催記"
authors: [hi120ki]
tags: [CTF, WaniCTF, Writeup]
slug: posts/20210504
---

## 概要

大阪大学CTFチームWani Hackaseは初心者向けCTF大会WaniCTF'21-springを4/30(金) 10:00 ~ 5/2(日) 20:00の日程で開催しました。

353名の方に問題を解いていただき、3名の方が全完を達成されました。

<!-- truncate -->

[ランキングページ](https://wanictf.org/2021s/), [作問者writeup](https://github.com/wani-hackase/wanictf21spring-writeup)

![This is a image](/img/hugo/wanictf21s-chal.jpg)

![This is a image](/img/hugo/wanictf21s-score.jpg)

## 経緯

昨年11月のWaniCTF2020に引き続いて2回目の初心者向け大会開催です。前回と同じく学園祭[いちょう祭](https://ichosai.com/online/detail.php?id=18)のオンライン企画として開催しました。また、方針も同様に初心者向けの問題を中心に中級者向けの問題をいくつか加え、Wani Hackaseメンバーが時間を掛ければ解き切れるレベルの問題セットを提供することにしました。

## 作問

Wani Hackaseでは毎週2人が作問を行ってメンバー全員で解く勉強会を行っているので半年弱でおよそ1回大会を開催できる問題が揃います。大会開催1.5ヶ月前から作問してきた問題のブラッシュアップや大会用問題の新規作問をしていました。

作問方針も前回を踏襲し、非想定解のチェックも入念に行いましたが

- Forensics「MixedUSB」が作問作業がいくつか欠けておりstringsだけで解ける
- Crypto「Can't restore the flag?」が入力値の検証が不十分で大きな桁のマイナス値を送ることができ容易にフラグを抽出できる

という非想定解がありました。特に前者はチェック体制の弱さが原因だと思うのでチェック確認を口頭ではなくレビューシステムに組み込み、抜けがないように改善したいと思います。

## インフラ

> 概ね前回のWaniCTF2020との差分の紹介となっています。もしCTFインフラの全体像を知りたい方は[WaniCTF2020 開催記](https://hi120ki.github.io/blog/posts/20201130/)を先に読むことをおすすめします。

インフラ構成は

- スコアサーバー
- 問題サーバー
  - nc問題サーバー
  - pwn問題サーバー
  - web問題サーバー(2台)
- 監視サーバー
- NewRelic
- 運営サーバー監視 NewRelicクローラー
- 問題サーバー監視 Lambdaクローラー
- ホームページ(GitHub pages)
- Discord(外部向け)
- Slack(内部向け)
- AWS S3 (Web問題 `Wani Request 1`)
- AWS Serverless (Web問題 `exception`, `CloudFront Basic Auth`)
- DockerHub (Misc問題 `Git Master`)

となっています。

特に問題サーバーは事前にローカルでEC2インスタンスと同様のスペックの仮想マシンを用意して負荷を計測した上で各問題サービスを配置しました。(headless chromeを動かすWeb問題の負荷が大きいためWebカテゴリは2台に分散しました)

### スコアサーバー

WaniCTF2020で頂いたフィードバックを受けて改善を行ったオリジナルスコアボードWaniCTFd21sを使用しました。

プレイヤーが見れる箇所の変更(リンクを別タブで開く・スコアページで自分と近い順位のプレイヤーの点数推移グラフの追加など)は細かなものですが、実は運営側では大きな機能追加が入っていました。

以前のWaniCTFdは問題をスコアサーバーに登録するときに管理ページから一問ずつ手作業(コピペ)で入力・ファイルアップロードを行っていました。そのためWaniCTF2020ではWeb問題の一つで問題添付ファイルのアップロードを忘れており気付くまでguess問題となってしまいました。

![This is a image](/img/hugo/wanictf21s-old-score.jpg)

(以前使用していたWaniCTFd。手作業での登録を行っていました。)

そこで問題を管理しているGitHubリポジトリから自動でスコアサーバーに問題を同期するCIに組み込み可能なツール「**WaniCTFdCLI**」を[Laika](https://twitter.com/ki4l_)さんと制作しました。

WaniCTFdCLIはGolangで記述され、mainブランチへのコミットやプルリクエストが行われたときにGitHub Actions上で起動し

- [ctf.yml](https://github.com/wani-hackase/wanictf21spring-writeup/blob/main/ctf.yml)を読み込み問題のリストを取得
- 各問題の`README.md`から問題文を抽出
- 各問題の添付ファイルをzip化、ハッシュの取得
- スコアサーバーに保存されている問題データを取得し差分を算出
- 差分からスコアサーバーの問題・添付ファイルの操作APIを叩いて更新する

という処理を行います。

これによって問題のレビュー用のテストスコアサーバーへ何度も手作業で問題文やファイルを更新せずに済み、本番サーバーへの問題の登録も問題作成レポジトリからそのまま移すだけで正確に登録ができました。

![This is a image](/img/hugo/wanictf21s-cli.jpg)

(フォルダ構成と`ctf.yml`の記述方法のドキュメント)

![This is a image](/img/hugo/wanictf21s-ci-1.jpg)

![This is a image](/img/hugo/wanictf21s-ci-2.jpg)

(GitHub Actionsでスコアサーバーに問題が自動登録されている様子)

昨年12月にv0.0.1をリリースして以降、添付ファイルをzip化する機能の追加やエラーハンドリングの改善などを行い、すでにv0.0.8に到達し非常に安定して稼働しています。

また、スコアサーバーに関して今回の大会でいくつかフィードバックをすでにプレイヤーの方から頂いているので更に改善と機能追加を進めていきます。

### 監視

今回はスコアサーバーと監視サーバーの監視を[NewRelic](https://newrelic.com/jp)で行いました。月100GBのデータ収集まで無料なのでありがたく使わせていただきました。監視の基本的な機能は備わっていたので快適に内部監視・外部監視を行うことができました。

![This is a image](/img/hugo/wanictf21s-newrelic.jpg)

また問題サーバーについては前回と同じくPrometheus + Loki + Grafanaを使用しました。こちらもおおむね安定して稼働していました。

![This is a image](/img/hugo/wanictf21s-grafana.jpg)

そして問題サービスの外部監視クローラーは[AWS Lambda の新機能 – コンテナイメージのサポート](https://aws.amazon.com/jp/blogs/news/new-for-aws-lambda-container-image-support/)を使用してDocker化しました。これによって実質的な容量制限がなくなり様々なパッケージ(特にpwntools)を容量を考えることなく使えるようになりました。速度についても変わらず快適に実行されていたので継続して採用したいと思っています。AWS CDKを使えばコマンド一つでdockerイメージのビルドからAWSへのデプロイができるのでとても便利です。(以下のコードでAWSのリソースを定義しています)

```typescript
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";

export class CdkLambdaContainerStack extends cdk.Stack {
  readonly timeout: number = 300;
  readonly cron: string = "cron(0/10 * * * ? *)";

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const lambdaFn = new lambda.DockerImageFunction(this, "cdk-lambda-docker", {
      code: lambda.DockerImageCode.fromImageAsset("src"),
      timeout: cdk.Duration.seconds(this.timeout),
    });

    const rule = new events.Rule(this, "Rule", {
      schedule: events.Schedule.expression(this.cron),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));
  }
}
```

## 大会運営

### サーバー障害

Refererリクエストヘッダー問題とXSS問題で使用していたheadless chrome(puppeteer)にtimeout設定が抜けており、頻繁にサービスがクラッシュしていました。
また、このtimeoutに起因するクラッシュが発生するたびに残ったブラウザのプロセスによってメモリ使用量がどんどん増えていく現象に見舞われ、定期的にサービスの再起動を行っていました。

しかし3日目の早朝にクラッシュを起因としてサーバーが応答しなくなり、その時間運営が誰もいなかったため1時間ほどサービスが提供できていませんでした。申し訳ありませんでした。(内部監視も外部監視もアラートが立ちまくっていましたがSlackの夜間通知がオフになっていたため何も音が鳴らず寝ていました。本当にすいませんでした。)

![This is a image](/img/hugo/wanictf21s-alert.jpg)

(鳴り響くアラート)

### アンケートについて

前回と同様の内容のアンケートを大会終了後にお願いしました。ここで頂いたフィードバックを参考にインフラや作問内容・作問ワークフローの改善を進めていきます。回答して頂いた皆様ありがとうございました。

### 運営の様子

上記のサーバー障害に多少振り回されましたが、ステータスバッジや監視アラートなどのインフラの工夫で省力化が進んでいるため、相変わらずフラグの投入ログやサーバー負荷を見ながら雑談していました。今回は前回よりも参加者数が多く運営もとても盛り上がっていました。(やはり多くの方に自分が作った問題を解いていただけるのは楽しいです)

## 最後に

今回は前回と比べて約2倍のプレイヤーに参加いただくことができました。そしてツイッターやアンケートにて「面白かった」という感想を多くの方から頂きとても運営として嬉しく感じています。

プレイヤーの皆様、WaniCTF'21-spring運営メンバーに感謝を申し上げます。

また、色々とフィードバックを頂いているので、更に快適で楽しいCTF大会を目指し改善を進めていきます。

今回はご参加いただきありがとうございました。次の機会がありましたらぜひまた楽しんでいただければと思います！

> [https://kinako-mochimochi.hatenablog.com/entry/2021/05/03/011759](https://kinako-mochimochi.hatenablog.com/entry/2021/05/03/011759)
>
> (springということは、summerやfall, winterもあるのかな？)

summerはご勘弁を...
