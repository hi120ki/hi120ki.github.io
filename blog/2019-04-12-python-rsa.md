---
title: "PythonでRSA公開鍵を読み込む"
description: "PythonでRSA公開鍵を読み込む"
authors: [hi120ki]
tags: [CTF, RSA, Cryptography]
slug: posts/20190412
---

PEM 形式の RSA 公開鍵を読み込む方法を紹介します

PEM 形式の公開鍵はこのような見た目をしています

<!-- truncate -->

```
-----BEGIN PUBLIC KEY-----
MIGcMA0GCSqGSIb3DQEBAQUAA4GKADCBhgKBgGFb4JhyeuYQ3pwQSBnzoffMWzFE
gQs41PTVG74R2cog8ofu0CNrztH+RDozWi8zx6isaPCfxfOL/jdKkgfTBz1ALHpl
owtg91sQ5DopZzCqItMlJ/cgPsm+zGp6DdcKXOPR1fKo25ho6KRTTu9wXyxqgybI
ilNrgnyIvAAFInrJAgEB
-----END PUBLIC KEY-----
```

このファイルには冪指数 e と公開鍵 n が含まれています。

[https://pypi.org/project/pycryptodome/](https://pypi.org/project/pycryptodome/)

こちらの pycryptodome を pip でインストールします

```bash
pip install pycryptodome
```

> 2021-04-12 変更
>
> [pycrypto](https://pypi.org/project/pycrypto/)は開発が止まっているので代替プロジェクトの[pycryptodome](https://pypi.org/project/pycryptodome/)をインストールします

(お使いの環境に合わせて pip3, conda などでインストールして下さい)

そして以下の python コードを実行すると e と n が表示されます

```python
from Crypto.PublicKey import RSA

pubkey = RSA.importKey(open("publickey.pem").read())
e = pubkey.e
n = pubkey.n

print("e :", e)
print("n :", n)
```
