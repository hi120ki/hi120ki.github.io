---
title: "fish shell での anyenv 設定法"
description: "anyenv をインストールし，fish shell 上で使用できるように設定していきます。"
authors: [hi120ki]
tags: [Fish shell]
slug: posts/20190125
---

## anyenv をインストール

git と Homebrew の二通りの方法がありますが，自分は [anyenv-update](https://github.com/znz/anyenv-update)を使っているので git でインストールしています

git でインストール

```bash
git clone https://github.com/anyenv/anyenv ~/.anyenv
```

<!-- truncate -->

## shell にパスを通す

fish の設定ファイルの config.fish は少し書き方が違うので注意して下さい

"anyenv init - " の後に使用する shell の名称を追加します

```bash
# ~/config/fish/config.fish
set -x PATH ~/.anyenv/bin $PATH
anyenv init - fish | source
```

fish shell を再起動する

```bash
exec fish -l
```

これで anyenv が使えるようになります

```bash
anyenv
anyenv 1.1.1
Usage: anyenv <command> [<args>]

Some useful anyenv commands are:
   commands            List all available anyenv commands
   local               Show the local application-specific Any version
   global              Show the global Any version
   install             Install a **env
   uninstall           Uninstall a specific **env
   version             Show the current Any version and its origin
   versions            List all Any versions available to **env

See `anyenv help <command>' for information on a specific command.
For full documentation, see: https://github.com/anyenv/anyenv#readme
```

ちなみに bash で使用する場合では ~/.bashrc ファイルに

```bash
# ~/.bashrc
export PATH="~/.anyenv/bin:$PATH"
eval "$(anyenv init - bash)"
```

と書きます

## anyenv-update を追加する

```bash
mkdir -p ~/.anyenv/plugins
git clone https://github.com/znz/anyenv-update.git ~/.anyenv/plugins/anyenv-update
```

以下のコマンドで anyenv と 追加した env をアップデートできます

```bash
anyenv update
Updating 'anyenv'...
Updating 'anyenv/anyenv-update'...
Updating 'nodenv'...
Updating 'nodenv/node-build'...
...
```

## env をインストールする

Node.js のパッケージ管理の nodenv で最新バージョンの Node.js をインストールしていきます

anyenv install で nodenv をインストール

```bash
anyenv install nodenv
```

fish shell を再起動する

```bash
exec fish -l
```

config.fish が再読込されて nodenv が使えるようになります

nodenv install -l でインストール可能なバージョンを調べる

```bash
nodenv install -l
Available versions:
  0.1.14
  0.1.15
  0.1.16
  0.1.17
  0.1.18
...
```

```bash
nodenv install 12.8.1

Downloading node-v12.8.1-darwin-x64.tar.gz...
-> https://nodejs.org/dist/v12.8.1/node-v12.8.1-darwin-x64.tar.gz
Installing node-v12.8.1-darwin-x64...
Installed node-v12.8.1-darwin-x64 to /Users/mac/.anyenv/envs/nodenv/versions/12.8.1

No default-package file found
Installed default packages for 12.8.1

nodenv global 12.8.1

node -v
v12.8.1
```

他の env も同様に追加できます

追加できる env はこちら

```bash
anyenv install -l
  Renv
  crenv
  denv
  erlenv
  exenv
  goenv
  hsenv
  jenv
  luaenv
  nodenv
  phpenv
  plenv
  pyenv
  rbenv
  sbtenv
  scalaenv
  swiftenv
  tfenv
```

また，anyenv versions コマンドでインストールした各 env とそれぞれのパッケージのバージョンを確認できます

```bash
anyenv versions
goenv:
* 1.12.7 (set by /Users/username/.anyenv/envs/goenv/version)
nodenv:
* 10.16.3 (set by /Users/username/.anyenv/envs/nodenv/version)
  12.8.1
pyenv:
  system
  2.7.16
* 3.7.4 (set by /Users/username/.anyenv/envs/pyenv/version)
rbenv:
  system
* 2.6.3 (set by /Users/username/.anyenv/envs/rbenv/version)
```
