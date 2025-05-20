---
title: "AWS Elastic Beanstalk で Puppeteer を動かす"
description: "CTF の Web 問題で XSS を出題するときに必要となる Admin クローラーを AWS Elastic Beanstalk 上で作成するときにつまずいたときのメモ"
authors: [hi120ki]
tags: [Web, AWS]
slug: posts/20190821
---

CTF の Web 問題で XSS を出題するときに必要となる Admin クローラーを AWS Elastic Beanstalk 上で作成するときにつまずいたときのメモ

## Admin クローラーとは

XSS の exploit コードが含まれたページを(問題提供側が用意する仮想の)攻撃対象に読み込ませ秘匿情報を引き出すことができるかジャッジするクローラー

<!-- truncate -->

## つまずく点

puppeteer (中身は chromium) を動かすためにいくつかの依存パッケージが必要となり .ebextensions で設定する必要がある

(Elastic Beanstalk は Amazon Linux で動いているため yum パッケージとなる)

[Puppeteer Troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)

## 手順

AWS CodeStar で Express.js on AWS Elastic Beanstalk プロジェクトの作成

レポジトリをクローンし，gitignore editorconfig などを用意

package.json で各パッケージを最新バージョンに書き換え， npm install

puppeteer をインストール npm install puppeteer

server.js で puppeteer を読み込み，クロールのコードを記述

```javascript
puppeteer = require("puppeteer");
...
```

.ebextensions に chromiumpackages.config を作成

```yml
packages:
  yum:
    cups-libs: []
    dbus-glib: []
    libXrandr: []
    libXcursor: []
    libXinerama: []
    cairo: []
    cairo-gobject: []
    pango: []

commands:
  atk:
    command: rpm -ivh --nodeps --replacepkgs http://mirror.centos.org/centos/7/os/x86_64/Packages/atk-2.28.1-1.el7.x86_64.rpm
  at-spi2-atk:
    command: rpm -ivh --nodeps --replacepkgs http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-atk-2.26.2-1.el7.x86_64.rpm
  at-spi2-core:
    command: rpm -ivh --nodeps --replacepkgs http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-core-2.28.0-1.el7.x86_64.rpm
  GConf2:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/GConf2-3.2.6-7.fc20.x86_64.rpm
  libXScrnSaver:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libXScrnSaver-1.2.2-6.fc20.x86_64.rpm
  libxkbcommon:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libxkbcommon-0.3.1-1.fc20.x86_64.rpm
  libwayland-client:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-client-1.2.0-3.fc20.x86_64.rpm
  libwayland-cursor:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-cursor-1.2.0-3.fc20.x86_64.rpm
  gtk3:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/gtk3-3.10.4-1.fc20.x86_64.rpm
  gdk-pixbuf2:
    command: rpm -ivh --nodeps --replacepkgs http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/16/Fedora/x86_64/os/Packages/gdk-pixbuf2-2.24.0-1.fc16.x86_64.rpm
```

git push しデプロイする

## 参考ページ

[GitHun gist chimmelb/chromiumpackages.config](https://gist.github.com/chimmelb/6342504893b2b9fce0f4a8efd096ae60)
