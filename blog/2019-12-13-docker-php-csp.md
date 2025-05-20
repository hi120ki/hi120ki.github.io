---
title: "Docker版 PHP で CSP を設定する 【Dockerfile】"
description: "Docker版 PHP で CSP を設定する 【Dockerfile】"
authors: [hi120ki]
tags: [Web, Web Security]
slug: posts/20191213
---

## プロジェクト構成

```text
project/
│
├─ conf/
│  │
│  └─ csp.conf
│
├─ php/
│  │
│  └─ index.php
│
└─ Dockerfile
```

<!-- truncate -->

## Dockerfile

```dockerfile
FROM php:apache

COPY ./php/ /var/www/html/

RUN chown -R www-data:www-data /var/www/html

RUN chmod -R 777 /var/www/html

RUN a2enmod headers

COPY ./conf/csp.conf /etc/apache2/conf-enabled/csp.conf
```

## csp.conf

ファイル名は任意です

```apache
<Directory /var/www/html/>
  Header set Content-Security-Policy "script-src 'self'"
</Directory>
```

他の設定

- Access Control

```apache
<Directory /var/www/html/>
  Header set Access-Control-Allow-Origin *
  Header set Access-Control-Allow-Headers "Content-Type"
</Directory>
```

- XSS Auditor

```apache
<Directory /var/www/html/>
  Header set X-XSS-Protection "0"
</Directory>
```
