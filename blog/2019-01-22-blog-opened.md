---
title: "ブログを開設しました"
description: "ブログを開設しました"
authors: [hi120ki]
tags: [Web, Blog, Hugo, GitHub]
slug: posts/20190122
---

Hi120ki と申します

日々の活動の記録を残すためのブログです

<!-- truncate -->

## このブログのレシピ

[Hugo](https://gohugo.io/) と GitHub Pages で作りました

### セットアップ

まず Hugo を Homebrew でインストール

```bash
brew install hugo
```

Hugo の雛形を作る（新たにディレクトリが作られます）

```bash
hugo new site myblog
```

### テーマを入れる

[Hugo Themes](https://themes.gohugo.io/) からテーマを選ぶ

このブログは [Hugo Future Imperfect](https://github.com/jpescador/hugo-future-imperfect) を使っています

git submodule で追加

```bash
git submodule add https://github.com/jpescador/hugo-future-imperfect themes/hugo-future-imperfect
```

config.toml を以下のように編集

```toml
theme = "hugo-future-imperfect"
```

### 動かす

ローカルでテストサーバーを起動

[http://localhost:1313](http://localhost:1313) で動きます

```bash
hugo server
```

### GitHub Pages で公開する

静的ファイルを出力

```bash
hugo
```

public フォルダーに静的ファイルが出力されるのでこれを GitHub Pages で公開する

まず GitHub で ユーザー名.github.io という名前のリポジトリを作る

そのリポジトリにファイルを push すれば https://ユーザー名.github.io/ で公開されます
