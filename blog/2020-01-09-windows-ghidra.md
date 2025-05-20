---
title: "WindowsでGhidraを動かす"
description: "WindowsでGhidraを動かす"
authors: [hi120ki]
tags: [Windows, Ghidra, Reverse Engineering]
slug: posts/20200109
---

## OpenJDKの導入

### 2022年JDK事情

こちらの記事で紹介されているようにJDKは様々なベンダーから提供されるようになっています。

[JDK、Oracle JDK、OpenJDK、Java SEってなに？](https://qiita.com/nowokay/items/c1de127354cd1b0ddc5e)

<!-- truncate -->

この中で多くの場合で配布されているのはビルド済みファイルで手作業でPATHを設定する必要があり面倒です。また更新も手作業にならざるを得ないため、自動化できるパッケージマネージャを使うことをおすすめします。

### (推奨1) パッケージマネージャwingetでOpenJDKをインストール

[wingetツールを使用したアプリケーションのインストールと管理 - Microsoft](https://learn.microsoft.com/ja-jp/windows/package-manager/winget/)

[microsoft/winget-cli - GitHub](https://github.com/microsoft/winget-cli)

[winget.run](https://winget.run/)

Microsoft Store [https://www.microsoft.com/p/app-installer/9nblggh4nns1](https://www.microsoft.com/p/app-installer/9nblggh4nns1) からインストールするのが推奨されています。

`winget`が使えるようになれば以下のような各ベンダーから出ているJDKをインストールします。

- [Microsoft OpenJDK](https://winget.run/pkg/Microsoft/OpenJDK.17)

```bash
winget install -e --id Microsoft.OpenJDK.17
```

- [Temurin](https://winget.run/pkg/AdoptOpenJDK/OpenJDK.17)

```bash
winget install -e --id AdoptOpenJDK.OpenJDK.17
```

### (推奨2) パッケージマネージャChocolateyでOpenJDKをインストール

[chocolatey.org](https://chocolatey.org/)

管理者権限でpowershellを起動し、[Installing Chocolatey](https://chocolatey.org/install)に載っている`Set-ExecutionPolicy`から始まるコマンドをコピペして実行します。

すると`choco`コマンドが使えるようになり以下のような各ベンダーから出ているJDKをインストールします。

- [Oracle JDK](https://community.chocolatey.org/packages/oraclejdk)

```bash
choco install oraclejdk
```

- [Microsoft OpenJDK](https://community.chocolatey.org/packages/microsoft-openjdk)

```bash
choco install microsoft-openjdk
```

- [Temurin](https://community.chocolatey.org/packages/Temurin)

```bash
choco install temurin
```

> ojdkbuildパッケージは非推奨となりました
> [ojdkbuild - chocolatey](https://chocolatey.org/packages/ojdkbuild)

### (非推奨) インストーラーでOpenJDKをインストール

各ベンダーの中でもMicrosoft OpenJDKとTemurinはwindowsインストーラーを提供しているので、PATHを手動で設定する必要はありません。

- Microsoft OpenJDK

[https://learn.microsoft.com/ja-jp/java/openjdk/download](https://learn.microsoft.com/ja-jp/java/openjdk/download) からmsiファイルをダウンロードして実行

- Temurin

[https://adoptium.net/temurin/releases/](https://adoptium.net/temurin/releases/) からmsiファイルをダウンロードして実行

## Ghidra の導入

[https://ghidra-sre.org/](https://ghidra-sre.org/)

### Ghidraのダウンロード

[https://github.com/NationalSecurityAgency/ghidra/releases](https://github.com/NationalSecurityAgency/ghidra/releases) をブラウザで開き最新のバージョンのzipファイル`ghidra_<バージョン>_PUBLIC_<日付>.zip`をダウンロードする

![ghidra-github.jpg](/img/hugo/ghidra-github.jpg)

### Ghidraのファイルの解凍

ダウンロードしたファイルを右クリックし、「すべて展開」を選択します

![win-ghidra-extract.jpg](/img/hugo/win-ghidra-extract.jpg)

「展開」をクリックします

![win-ghidra-extract-2.jpg](/img/hugo/win-ghidra-extract-2.jpg)

### Ghidraの起動

展開したフォルダの中の「ghidrarun.bat」をクリックしGhidraを起動します

![win-ghidra-run.jpg](/img/hugo/win-ghidra-run.jpg)

(注意) ここでWindows Defenderなどのアンチウイルスソフトが検知をする場合がありますが、製品の案内に従って実行を続行します

![win-ghidra-def.jpg](/img/hugo/win-ghidra-def.jpg)

(Windows Defenderの場合、「詳細情報」をクリックすることで「実行」ボタンが出てくるのでこれをクリックします)

![win-ghidra-def2.jpg](/img/hugo/win-ghidra-def2.jpg)

### User Areement

User Areementが表示されるので「I Agree」をクリックします

![win-ghidra-runned.jpg](/img/hugo/win-ghidra-runned.jpg)

Ghidraが起動しました

![win-ghidra-runned2.jpg](/img/hugo/win-ghidra-runned2.jpg)

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
