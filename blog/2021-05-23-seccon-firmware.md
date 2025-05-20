---
title: "SECCON Beginners CTF 2021【Reversing】firmware 作問者writeup"
description: "SECCON Beginners CTF 2021【Reversing】firmware 作問者writeup"
authors: [hi120ki]
tags: [CTF, SECCON, Firmware]
slug: posts/20210523-1
---

SECCON Beginners CTF 2021で出題したReversing問題「firmware」(想定難易度:Medium)の作問者writeupです。

名前の通りファームウェアの解析問題です。「ELF実行ファイルを取り出す」「ELF実行ファイルを解析する」の2つのパートで構成されています。

<!-- truncate -->

## ELF実行ファイルを取り出す

まずはfileコマンドで配布ファイルの中身を確認します。

```shell
$ file firmware.bin
firmware.bin: data
```

バイナリデータのようなのでstringsコマンドでフラグがそのまま含まれていないか調べます。

```shell
$ strings firmware.bin | grep ctf4b
This is a IoT device made by ctf4b networks. Password authentication is required to operate.
  <title>SuperRouter - ctf4b networks</title>
  <meta name="description" content=" - ctf4b networks">
  <h1>SuperRouter - ctf4b networks</h1>
```

フラグ文字列はありませんでした。次にbinwalkでどんなファイルが含まれているか調べます。

```shell
$ binwalk firmware.bin

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
1682          0x692           Copyright string: "Copyright 2011-2021 The Bootstrap Authors"
1727          0x6BF           Copyright string: "Copyright 2011-2021 Twitter, Inc."
82842         0x1439A         ELF, 32-bit LSB shared object, ARM, version 1 (SYSV)
93155         0x16BE3         Unix path: /usr/lib/gcc/arm-linux-gnueabihf/9/../../../arm-linux-gnueabihf/Scrt1.o
96237         0x177ED         HTML document header
97092         0x17B44         HTML document footer
97100         0x17B4C         PNG image, 594 x 100, 8-bit grayscale, non-interlaced
97141         0x17B75         Zlib compressed data, best compression
104190        0x196FE         JPEG image data, JFIF standard 1.01
```

様々なファイルが含まれているようです。

binwalkは`-e`オプションで含まれているファイルを自動で取り出してくれます。

```shell
$ binwalk -e firmware.bin
$ cd _firmware.bin.extracted/ ; ls
17B75 17B75.zlib
```

しかしこのファイルに対してはうまく動かないようなのでバイナリエディタを使って見てみると、TXT・CSS・WOFF2・SVG・HTML・ELF・PNG・JPG・PEMファイルが入っており、問題文の「このファイルの中からパスワードを探してください」からLinuxの実行ファイルであるELFの中にフラグがありそうです。

PNGファイルの始まり

![This is a image](/img/hugo/ctf4b_2021_firm_1.png)

PNGファイルの終わりとELFファイルの始まり

![This is a image](/img/hugo/ctf4b_2021_firm_2.png)

ELFファイルの終わりとJPGファイルの始まり

![This is a image](/img/hugo/ctf4b_2021_firm_3.png)

取り出したELFファイルを「firm」として保存すると

```shell
$ file firm
firm: ELF 32-bit LSB pie executable, ARM, EABI5 version 1 (SYSV),
dynamically linked, interpreter /lib/ld-linux-armhf.so.3,
BuildID[sha1]=d4fde2a811fccb987ffb2e075b170db18f797b8a, for GNU/Linux 3.2.0, not stripped

$ strings firm | grep ctf4b
This is a IoT device made by ctf4b networks. Password authentication is required to operate.
```

ARMアーキテクチャの32bit CPUで動作する通称armhfのELFファイルで、パスワード認証が実装されていそうです。

## ELF実行ファイルを解析する

まずは静的解析をGhidraで行います。main関数を見てみると`0x1f90`(8080)番ポートでsocket通信を行い、

```cpp
recv(wsock,input,0x1000,0); // 処理1
memcpy(data,&DAT_00010ea4,0xf4); // 処理2
input_length = strlen((char *)input); // 処理3
if (input_length != 0x3d) {
  ...
  send(wsock,error_message,error_message_length,0);
  close(wsock);
}
i = 0;  // 処理4
while (i < 0x3d) {
  if ((uint)(input[i] ^ 0x53) != data[i]) {
    ...
    send(wsock,error_message,error_message_length,0);
    close(wsock);
  }
  i = i + 1;
}
...
send(wsock,success_message,success_message_length,0); // 処理5
close(wsock);
```

1. ユーザー入力を受け付ける
2. メモリ領域`data`へ`&DAT_00010ea4`の内容をコピーする
3. ユーザー入力の長さが0x3dではない場合、エラーメッセージを送信して接続を閉じる
4. ユーザー入力を1文字ずつ`0x53`とXORした値が`data`と等しいか確認し、等しくない場合エラーメッセージを送信して接続を閉じる
5. 成功メッセージを送信して接続を閉じる

という処理を行っています。そして`&DAT_00010ea4`には

```
  DAT_00010ea4
00010ea4 30
00010ea5 00
00010ea6 00
00010ea7 00
00010ea8 27
00010ea9 00
00010eaa 00
00010eab 00
00010eac 35
00010ead 00
00010eae 00
00010eaf 00
00010eb0 67
00010eb1 00
```

このようにXORして比較するための値があります。これらを取り出して成功メッセージが送信される入力を求めると

```python
data = [0x30, 0x27, 0x35, 0x67, 0x31, 0x28, 0x3A, 0x63, 0x27, 0xC, 0x37, 0x36, 0x25, 0x62, 0x30, 0x36, 0xC, 0x35, 0x3A, 0x21, 0x3E, 0x24, 0x67, 0x21, 0x36, 0xC, 0x32, 0x3D, 0x32, 0x62, 0x2A, 0x20, 0x3A, 0x60, 0xC, 0x21, 0x36, 0x25, 0x60, 0x32, 0x62, 0x20, 0xC, 0x32, 0xC, 0x3F, 0x63, 0x27, 0xC, 0x3C, 0x35, 0xC, 0x66, 0x36, 0x30, 0x21, 0x36, 0x64, 0x20, 0x2E, 0x59]

flag = []

for i in range(len(data)):
    flag.append(chr(data[i] ^ 0x53))

print("".join(flag))
# ctf4b{i0t_dev1ce_firmw4re_ana1ysi3_rev3a1s_a_l0t_of_5ecre7s}
```

となりフラグ`ctf4b{i0t_dev1ce_firmw4re_ana1ysi3_rev3a1s_a_l0t_of_5ecre7s}`を取得できました。

## 出題意図

前半パートは`binwalk`などのツールに頼ることなくバイナリエディタで`ELF` `.PNG` `IENDB` `JFIF`といった特徴的なバイナリ文字列を見つけることを体験してほしいという意図で(`binwalk -e`ではうまくいかない)疑似ファームウェアファイルを用意しました。

そして後半パートについては、ソケット通信プログラムの解析を用意しました。ソケット通信はいろいろなシステムコール(`bind`、`accept`、`send`など)が出てくるのでそれらの機能を調べながら全体でどのような処理をしているのか把握する必要があります。「どんなシステムコールが呼ばれているか」を把握して動作のあたりをつけることは難しいバイナリ解析問題を解く上で大切なのでその雰囲気を掴んでいただけたら嬉しいです。

Reversing問題の中で一番解答者が少ない問題ですが、一歩ずつ進めていけば解くことができる問題ですのでぜひ復習してみてください。

> もっと簡単なReversing問題を解いてみたい、という方にはWaniCTFの過去問をおすすめします。stringsやGhidra、GDBなどの基本的な使い方をマスターできると思います。
>
> [WaniCTF2020 公式writeup](https://github.com/wani-hackase/wanictf2020-writeup/)
>
> [WaniCTF'21-spring 公式writeup](https://github.com/wani-hackase/wanictf21spring-writeup/)
