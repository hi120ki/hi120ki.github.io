---
title: "外部公開するDockerイメージを作るときは COPY . に気をつけよう"
description: "外部公開するDockerイメージを作るときは COPY . に気をつけよう"
authors: [hi120ki]
tags: [Docker, Git, Security]
slug: posts/20210502
---

English article is [here](./2021-05-03-docker-git-leak-en.md).

## 要約

以下の条件を満たすときに**Dockerイメージ内に残留する.gitフォルダーから機密情報が流出する**恐れがあります。

<!-- truncate -->

- 過去に機密情報をcommitしたが消していない
- .gitフォルダーとDockerfileが同じ階層のディレクトリにある
- DockerfileでCOPYやADD命令でカレントディレクトリを指定してファイルを移している(例 : `COPY . /app`)
- Dockerイメージを誰でもダウンロードできる場所にアップロードする

Dockerfileを変更せずにできる対策としては

- .dockerignoreファイルで.gitフォルダーを指定する

が挙げられます。

## WaniCTF'21-spring 「Git Master」

4/30 ~ 5/2に大阪大学CTFサークルWani Hackaseが開催した初心者向けのCTF大会[WaniCTF'21-spring](https://wanictf.org/)でこのテーマを扱った問題「Git Master」を出題しました。

この問題では以下のDockerfileとDockerHubのリンクが与えられます。

> https://hub.docker.com/r/wanictf21spring/nginx_on_ubuntu
>
> ホームページをみんなで開発したいので、イメージを公開するです。
>
> 昔、秘密の文字列をコミットしたことがあるけど大丈夫だよね...？
>
> Writer : okmt, hi120ki

```dockerfile
FROM ubuntu:20.04

LABEL maintainer="wanictf21spring@gmail.com"

RUN apt update \
 && apt install -y nginx

EXPOSE 80

COPY . /var/www

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
```

該当のイメージの中の`/var/www`ディレクトリ以下にhtmlファイルなどとともに.gitフォルダーが含まれていてそこからFLAGを取り出すというのが解法になります。([作問者writeup](https://github.com/wani-hackase/wanictf21spring-writeup/tree/main/mis/git_master))

## .gitフォルダーがDockerイメージの中に残留した原因

なぜDockerイメージの中に.gitフォルダーが残ってしまったかというとまずこのプロジェクトのディレクトリ構成が

```text
.
├── .git/
├── Dockerfile
├── docker-compose.yml
└── html/
```

となっており.gitフォルダーとDockerfileが同じ階層のディレクトリに存在しています。

そして`COPY . /var/www`を実行してしまったからです。`COPY . /var/www`の`.`はカレントディレクトリを指し、その階層のファイルとフォルダーをDockerイメージの中に取り込みます。よってDockerイメージの中に本来移したいファイルに加えて.gitフォルダーがコピーされてしまいます。

## 機密情報流出のシナリオ

.gitフォルダーとDockerfileが同じ階層のディレクトリに存在し、カレントディレクトリを指定した`COPY`命令で.gitフォルダーがDockerイメージの中に残留します。よって機密情報流出のシナリオは

1. 過去に機密情報をcommitしたが消していない
2. .gitフォルダーとDockerfileが同じ階層のディレクトリにある
3. DockerfileでCOPYやADD命令でカレントディレクトリを指定してファイルを移している(例 : `COPY . /app`)
4. Dockerイメージを誰でもダウンロードできる場所にアップロードする

となります。

2番や3番は多くの場面で見られるので、もし該当するプロジェクトのDockerイメージをDockerHubのpublic repositoriyなどの誰でもダウンロードできる場所にアップロードしている場合は確認したほうがいいかもしれません。

> multi stage buildを使っていて.gitフォルダーが公開されるイメージに含まれないなど様々なシチュエーションが考えられます。上の条件を満たせば必ず.gitフォルダーがDockerイメージの中に残留するとは限りません。

## 対策

Dockerイメージをpublic repositoriyに公開しない・`COPY`命令では必要なファイルのみを指定するなどの対策が考えられますが、1番おすすめなのは`.dockerignore`を使用する方法です。

[Docker公式ドキュメント](https://docs.docker.com/engine/reference/builder/#dockerignore-file)にある通り、`.dockerignore`はこのファイルに指定されたファイルとディレクトリをコンテキストから除外します。

一般的には`node_modules`や一時ファイルなどのbuildに依存せず、コンテキストに含まれると容量が大きいためにbuildのパフォーマンスが悪くなるものを除外するために用いられます。

よって先程の問題のシチュエーションにおいても.dockerignoreファイルで.gitフォルダーが指定されていればコピーされません。

```shell
$ cd project
$ ls -ah
.  ..  .git  Dockerfile  docker-compose.yml  html
$ echo ".git" >> .dockerignore
```

また、build時のパフォーマンス向上の面でも.gitフォルダーをコンテキストから除外することは意味があるのでぜひ設定してみてはいかがでしょうか。

## 最後に

良問で面白いという評価を頂いているようで作問担当として嬉しいです。このような意外と気づかないところで実は危ない処理がある、というのを扱ったCTF問題は自分も解いていて楽しいと感じているので今後もこのような問題を作れればと思います。
