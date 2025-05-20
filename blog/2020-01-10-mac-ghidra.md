---
title: "MacでGhidraを動かす"
description: "Mac で Ghidra を動かす"
authors: [hi120ki]
tags: [CTF, Reversing]
slug: posts/20200110
---

## OpenJDKの導入

### Homebrewのインストール

[公式サイト](https://brew.sh/index_ja) の「インストール」よりコマンドをコピーし、ターミナルに貼り付けてエンターキーを押します

コマンド実行後、続けて実行する必要のあるコマンドがターミナルに表示されるので、案内に従ってそのコマンドをコピーし、ターミナルに貼り付けてエンターキーを押します

<!-- truncate -->

`brew --version`コマンドをターミナルで実行し、以下のような表示(バージョン番号や日付は異なることがある)が出ればインストール完了です

```bash
brew --version
```

### OpenJDKのインストール

`brew install openjdk`コマンドをターミナルで実行し、OpenJDKをインストールします

コマンド実行後、続けて実行する必要のあるコマンドがターミナルに表示されるので、案内に従ってそのコマンドをコピーし、ターミナルに貼り付けてエンターキーを押します

`java --version`コマンドをターミナルで実行し、以下のような表示(バージョン番号や日付は異なることがある)が出ればインストール完了です

```bash
java --version
```

## Ghidra の導入

[https://ghidra-sre.org/](https://ghidra-sre.org/)

### Ghidraのダウンロード

[https://github.com/NationalSecurityAgency/ghidra/releases](https://github.com/NationalSecurityAgency/ghidra/releases) をブラウザで開き最新のバージョンのzipファイル`ghidra_<バージョン>_PUBLIC_<日付>.zip`をダウンロードする

![ghidra-github.jpg](/img/hugo/ghidra-github.jpg)

### Ghidraのファイルの解凍

ダウンロードした`ghidra_<バージョン>_PUBLIC_<日付>.zip`ファイルを移動させ(今回は`Documents`)，ダブルクリックで解凍します

![ghidra-move.png](/img/hugo/ghidra-move.png)

![ghidra-moved.png](/img/hugo/ghidra-moved.png)

### Ghidraの起動 - Mac

ターミナルで解凍したディレクトリに移動し`./ghidraRun`で実行します

```bash
cd ~/Documents/
cd ghidra_10.1.5_PUBLIC/
./ghidraRun
```

![ghidra-welcome.png](/img/hugo/ghidra-welcome.png)

> MacOS にて Ghidra 付属のデコンパイラが「開発元が未確認」とエラーが出る場合は
>
> システム環境設定アプリ > セキュリティとプライバシー > 一般 > ダウンロードしたアプリの許可実行
>
> から実行を許可する必要があります

## Tips

またいちいちディレクトリに移動するのが面倒な場合は shell に alias を追加し起動することもできます

- fish shell の場合 (~/.config/fish/config.fish)

```fish
alias ghidra '~/Documents/ghidra_10.1.5_PUBLIC/ghidraRun'
```

を追記すると `ghidra` コマンドで Ghidra を起動させることができます

## (おまけ) Ghidraでのファイル読み込み

### 起動後File→New Projectを選択

![ghidra-1.png](/img/hugo/ghidra-1.png)

### Non-shared projectを選択

![ghidra-2.png](/img/hugo/ghidra-2.png)

### 適当なProject DirectoryとProject Nameを入力

![ghidra-3.png](/img/hugo/ghidra-3.png)

### Tool Chestの緑のアイコンをクリック

![ghidra-4.png](/img/hugo/ghidra-4.png)

### File→Import Fileから配布バイナリを選択

![ghidra-5.png](/img/hugo/ghidra-5.png)

![ghidra-6.png](/img/hugo/ghidra-6.png)

![ghidra-7.png](/img/hugo/ghidra-7.png)

### 「analyze now?」にYes

![ghidra-8.png](/img/hugo/ghidra-8.png)

### Analysis OptionはデフォルトでOK

![ghidra-9.png](/img/hugo/ghidra-9.png)

### 左の真ん中のSymbol TreeのFunctionsを展開しmainを選択

![ghidra-10.png](/img/hugo/ghidra-10.png)

![ghidra-11.png](/img/hugo/ghidra-11.png)

### 真ん中に逆アセンブル結果，右に逆コンパイル結果が表示される

![ghidra-12.png](/img/hugo/ghidra-12.png)
