---
title: "SECCON Beginners CTF 2023 Reversing 作問者writeup"
description: "SECCON Beginners CTF 2023 Reversing 作問者writeup"
authors: [hi120ki]
tags: [CTF, SECCON, ctf4b]
slug: posts/20230605
---

## はじめに

SECCON Beginners CTF 2023のReversingのBeginner~Mediumまでの問題の作問者writeupです。Hard問題HeavenについてはArataさんから公開されると思うのでもう少々お待ち下さい。

Reversing分野は初心者の方にとっては難しい分野だと思います。ですので本CTFではReversingの基本的な解析手法である

<!-- truncate -->

- 表層解析 : Half
- 静的解析 : Three
- 動的解析 : Poker

を扱う問題をそれぞれ1問ずつ出題しました。

そしてSECCON Beginners CTFではForensicsカテゴリの出題がないので、少しForensicsの要素も含めつつReversingの解析手法を組み合わせて解くMedium問題のLeakを用意しました。

本writeupや様々な方が公開されているwriteupを通して、Reversingの解析手法を学んでいただければと思います。

## Half

「どうやって中身を見るんだろう...？」ということで、バイナリ解析の基本的な解析手法である表層解析を行う問題です。

まずは`file`コマンドでファイルの種類を確認します。

```sh
$ file half
half: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV),
dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=e2b1484a1db68e68d01130084882316fb34d86ad,
for GNU/Linux 3.2.0, not stripped
```

すると、ELFファイルであることがわかります。ELFファイルは、Linuxで実行可能なバイナリファイルのフォーマットです。

このファイルを実行してみます。

```sh
$ chmod +x half
$ ./half
Enter the FLAG: ctf4b{flag}
Invalid FLAG
```

フラグの入力を促されるので、`ctf4b{flag}`と入力してみますが、`Invalid FLAG`と表示されてしまいます。

ということでこの問題の趣旨は、このバイナリファイルがどのような動作をしているのかを調べ、正しいと判定されるフラグの文字列を取得することです。

しかし、バイナリファイルは機械語の命令からなるため、そのままでは中身を見ることができません。しかし、固定の文字列等はバイナリファイルの中にそのまま埋め込まれていることがあります。そこで、`strings`コマンドを用いて、バイナリファイルの中に存在する可読文字列を取得してみます。

```sh
$ strings half
```

```
/lib64/ld-linux-x86-64.so.2
libc.so.6
strncmp
__isoc99_scanf
puts
printf
strlen
...
Enter the FLAG:
...
Invalid FLAG
ctf4b{ge4_t0_kn0w_the
_bin4ry_fi1e_with_s4ring3}
...
```

すると、このELFファイルに動的リンクされているライブラリや関数名に加えて、`ctf4b{ge4_t0_kn0w_the_bin4ry_fi1e_with_s4ring3}`というフラグが表示されました。

このフラグを入力してみると、正解となります。

```
$ ./half
Enter the FLAG: ctf4b{ge4_t0_kn0w_the_bin4ry_fi1e_with_s4ring3}
Correct!
```

> このバイナリファイルは入力された文字列と`ctf4b{ge4_t0_kn0w_the`及び`_bin4ry_fi1e_with_s4ring3}`とを比較し、一致した場合に正解と判定しています。

## Three

「中身をちょっと見ただけではフラグは分からないみたい！」とは言われているものの、まずは表層解析を行います。

```bash
$ file three
three: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV),
dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=5f0a7f4053ff33a4a013bbe5c58ea4dc2973ed54,
for GNU/Linux 3.2.0, not stripped
```

ELFファイルであると分かります。次に`strings`コマンドで可読文字列を取得します。

```bash
$ strings three
/lib64/ld-linux-x86-64.so.2
libc.so.6
__isoc99_scanf
puts
printf
strlen
...
u+UH
VUUUH
VUUUH
VUUUH
VUUUH
VUUUH
[]A\A]A^A_
Invalid FLAG
Correct!
Enter the FLAG:
%49s
:*3$"
```

フラグにつながるような文字列は見当たりません。ここでELFファイルに含まれる機械語の命令を逆アセンブル・逆コンパイルする専門のツールとしてGhidraを使用し解析をします。

> Ghidraの使い方については[Reversing基礎編 / Basics of Reversing - SECCON Beginners Live 2022](https://speakerdeck.com/hi120ki/basics-of-reversing-seccon-beginners-live-2022)を参考にしてください。

Ghidraで`three`を開き、`main`関数を見てみます。

```cpp
void main(void)
{
  undefined local_48 [64];

  printf("Enter the FLAG: ");
  __isoc99_scanf(&DAT_00102127,local_48);
  validate_flag(local_48);
  return;
}
```

入力された文字列を`local_48`に格納し、`validate_flag`関数に渡しています。`validate_flag`関数を見てみます。

```cpp
undefined8 validate_flag(char *param_1)
{
  char cVar1;
  size_t sVar2;
  undefined8 uVar3;
  int local_c;

  sVar2 = strlen(param_1);
  if (sVar2 == 0x31) {
    for (local_c = 0; local_c < 0x31; local_c = local_c + 1) {
      if (local_c % 3 == 0) {
        cVar1 = (char)*(undefined4 *)(flag_0 + (long)(local_c / 3) * 4);
      }
      else if (local_c % 3 == 1) {
        cVar1 = (char)*(undefined4 *)(flag_1 + (long)(local_c / 3) * 4);
      }
      else {
        cVar1 = (char)*(undefined4 *)(flag_2 + (long)(local_c / 3) * 4);
      }
      if (cVar1 != param_1[local_c]) {
        puts("Invalid FLAG");
        return 1;
      }
    }
    puts("Correct!");
    uVar3 = 0;
  }
  else {
    puts("Invalid FLAG");
    uVar3 = 1;
  }
  return uVar3;
}
```

これを変数名を変更することで読みやすくすると

```cpp
undefined8 validate_flag(char *input_text)
{
  char c;
  size_t sVar2;
  undefined8 ret;
  int i;

  input_text_length = strlen(input_text);
  if (input_text_length == 0x31) {
    for (i = 0; i < 0x31; i = i + 1) {
      if (i % 3 == 0) {
        c = (char)*(undefined4 *)(flag_0 + (long)(i / 3) * 4);
      }
      else if (i % 3 == 1) {
        c = (char)*(undefined4 *)(flag_1 + (long)(i / 3) * 4);
      }
      else {
        c = (char)*(undefined4 *)(flag_2 + (long)(i / 3) * 4);
      }
      if (c != input_text[i]) {
        puts("Invalid FLAG");
        return 1;
      }
    }
    puts("Correct!");
    ret = 0;
  }
  else {
    puts("Invalid FLAG");
    ret = 1;
  }
  return ret;
}
```

入力された文字列の長さが`0x31`であることを確認し、文字のインデックスを3で割った余りで`flag_0`、`flag_1`、`flag_2`という配列に格納された文字列と比較しています。

Ghidraでその文字列を確認すると

```python
flag_0 = [0x63, 0x34, 0x63, 0x5F, 0x75, 0x62, 0x5F, 0x5F, 0x64, 0x74, 0x5F, 0x72, 0x5F, 0x31, 0x5F, 0x34, 0x7D]
flag_1 = [0x74, 0x62, 0x34, 0x79, 0x5F, 0x31, 0x74, 0x75, 0x30, 0x34, 0x74, 0x65, 0x73, 0x69, 0x66, 0x67]
flag_2 = [0x66, 0x7B, 0x6E, 0x30, 0x61, 0x65, 0x30, 0x6E, 0x5F, 0x65, 0x34, 0x65, 0x70, 0x74, 0x31, 0x33]

flag = ""
for i in range(0x31):
    if i % 3 == 0:
        flag += chr(flag_0[i // 3])
    elif i % 3 == 1:
        flag += chr(flag_1[i // 3])
    elif i % 3 == 2:
        flag += chr(flag_2[i // 3])
print(flag)
```

となりフラグは`ctf4b{c4n_y0u_ab1e_t0_und0_t4e_t4ree_sp1it_f14g3}`となります。

```bash
$ ./three
Enter the FLAG: ctf4b{c4n_y0u_ab1e_t0_und0_t4e_t4ree_sp1it_f14g3}
Correct!
```

## Poker

バイナリを実行するとインディアンポーカーで遊べるようです。

```bash
$ chmod +x poker
$ ./poker

...
================
| Score :   0  |
================

[?] Enter 1 or 2: 1
[+] Player 1 wins! You got score!

================
| Score :   1  |
================

[?] Enter 1 or 2: 2
[+] Player 2 wins! You got score!

================
| Score :   2  |
================

[?] Enter 1 or 2: 1
[-] Player 2 wins! Your score is reset...

================
| Score :   0  |
================
```

プレイヤー1と2のどっちが勝つかを予想して、勝てばスコアが加算されます。しかし、予想が外れるとスコアがリセットされてしまいます。これを踏まえた上で解析を始めます。

まずは表層解析です。

```bash
$ file poker
poker: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV),
dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=7d0fc5db7a8f299ccf155729cc1183f5f6cb1bb4,
for GNU/Linux 3.2.0, stripped
```

ここで`poker`はstrippedされたELFファイルであることが分かります。`stripped`とはシンボル情報が削除されていることを示しており、`main`や`printf`といった関数名が分からなくなっています。

その上で、Ghidraによる静的解析でバイナリの大まかな動作を把握しつつ、解析することが求められます。まずはGhidraで`poker`を開き、`__libc_start_main`関数を見てみます。すると

```cpp
void FUN_001010b0(undefined8 param_1,undefined8 param_2,undefined8 param_3)
{
  undefined8 unaff_retaddr;
  undefined auStack_8 [8];

  __libc_start_main(FUN_00102262,unaff_retaddr,&stack0x00000008,FUN_001022e0,FUN_00102350,param_3,
                    auStack_8);
  do {
                    /* WARNING: Do nothing block with infinite loop */
  } while( true );
}
```

strippedなELFファイルであるため関数名がGhidraによって補完され`FUN_001010b0`となっていますが、`__libc_start_main`関数を呼び出している関数を見つけることができました。

`__libc_start_main`関数は、`main`関数を呼び出す関数で、第1引数には`main`関数のアドレスが渡されています。つまり関数`FUN_00102262`が`main`関数であると分かります。

```cpp
undefined8 FUN_00102262(void)
{
  undefined4 uVar1;
  int local_10;
  int local_c;

  local_c = 0;
  FUN_001021c3();
  local_10 = 0;
  while( true ) {
    if (0x62 < local_10) {
      return 0;
    }
    FUN_00102222(local_c); // スコア表示
    uVar1 = FUN_00102179(); // 1 or 2を入力させる
    local_c = FUN_00101fb7(local_c,uVar1); // 勝敗を判定する
    if (99 < local_c) break;
    local_10 = local_10 + 1;
  }
  FUN_001011a0();
  return 0;
}
```

`main`関数の動作を見るとスコア表示の関数`FUN_00102222`、1 or 2を入力させる関数`FUN_00102179`、勝敗を判定する関数`FUN_00101fb7`があり、それらがwhileループによって繰り返し実行されていることが分かります。

そしてスコアが格納される変数`local_c`が99以上になったときに呼び出される関数`FUN_001011a0`があります。この関数を見てみると長大ではありますが

```cpp
printf("[!] You got a FLAG! %s\n",local_60);
```

という処理があることからフラグを表示する関数だと推察できます。

何度も挑戦して100回勝てばいいかと思いますが、`main`関数の処理に`local_10`が0x62つまり98より大きい場合終了するようになっているため、100回勝つことはできません。

そこでGDBを用いてスコア表示の関数や勝敗を判定する関数の実行を飛ばして、直接フラグを表示する関数`FUN_001011a0`を実行させます。

```
$ gdb-gef poker

# エントリーポイントまで実行して停止
gef> start

# エントリーポイントからの15命令を逆アセンブルしてmain関数を見つける
gef> x/15i 0x5555555550b0
=> 0x5555555550b0:    endbr64
   0x5555555550b4:    xor    ebp,ebp
   0x5555555550b6:    mov    r9,rdx
   0x5555555550b9:    pop    rsi
   0x5555555550ba:    mov    rdx,rsp
   0x5555555550bd:    and    rsp,0xfffffffffffffff0
   0x5555555550c1:    push   rax
   0x5555555550c2:    push   rsp
   0x5555555550c3:    lea    r8,[rip+0x1286]        # 0x555555556350
   0x5555555550ca:    lea    rcx,[rip+0x120f]        # 0x5555555562e0
   0x5555555550d1:    lea    rdi,[rip+0x118a]        # 0x555555556262 <- main関数
   0x5555555550d8:    call   QWORD PTR [rip+0x3f02]        # 0x555555558fe0 <- __libc_start_main関数
   0x5555555550de:    hlt
   0x5555555550df:    nop
   0x5555555550e0:    lea    rdi,[rip+0x3f29]        # 0x555555559010

# main関数からの30命令を逆アセンブルしてフラグ表示関数を見つける
gef> x/30i 0x555555556262
   0x555555556262:    endbr64
   0x555555556266:    push   rbp
   0x555555556267:    mov    rbp,rsp
   0x55555555626a:    sub    rsp,0x10
   0x55555555626e:    mov    DWORD PTR [rbp-0x4],0x0
   0x555555556275:    mov    eax,0x0
   0x55555555627a:    call   0x5555555561c3
   0x55555555627f:    mov    DWORD PTR [rbp-0x8],0x0
   0x555555556286:    jmp    0x5555555562c7
   0x555555556288:    mov    eax,DWORD PTR [rbp-0x4]
   0x55555555628b:    mov    edi,eax
   0x55555555628d:    call   0x555555556222
   0x555555556292:    mov    eax,0x0
   0x555555556297:    call   0x555555556179
   0x55555555629c:    mov    DWORD PTR [rbp-0xc],eax
   0x55555555629f:    mov    edx,DWORD PTR [rbp-0xc]
   0x5555555562a2:    mov    eax,DWORD PTR [rbp-0x4]
   0x5555555562a5:    mov    esi,edx
   0x5555555562a7:    mov    edi,eax
   0x5555555562a9:    call   0x555555555fb7
   0x5555555562ae:    mov    DWORD PTR [rbp-0x4],eax
   0x5555555562b1:    cmp    DWORD PTR [rbp-0x4],0x63
   0x5555555562b5:    jle    0x5555555562c3
   0x5555555562b7:    call   0x5555555551a0 <- フラグ表示関数

# エントリーポイントで停止している状態から直接フラグ表示関数に遷移する
gef> jump *0x5555555562b7
Continuing at 0x5555555562b7.
[!] You got a FLAG! ctf4b{4ll_w3_h4v3_70_d3cide_1s_wh4t_t0_d0_w1th_7he_71m3_7h47_i5_g1v3n_u5}
```

フラグが表示されました。jumpによって直接関数を実行させるだけでなく、breakによるブレークポイントの設定とsetによるレジスタの書き換えによって解くことも可能です。挑戦してみてください。

## Leak

`leak`というELFファイルと`record.pcap`が与えられます。「調査したところさらに不審なファイルを発見したので、通信記録と合わせて解析してください。」ということなので、まずは`leak`の挙動を解析します。

Ghidraでmain関数を確認し、変数名をつけていくと

```cpp
undefined8 main(void)
{
  // IPアドレスの入力を求める
  printf("Enter IP address: ");
  res = fgets(input_ip_addr,0x10,stdin);
  if (res == (char *)0x0) {
    perror("Failed to read IP address");
    ret = 1;
  }
  else {
    // IPアドレスの文字列を確認
    input_ip_addr_len = strlen(input_ip_addr);
    if ((input_ip_addr_len != 0) && (sock.sa_data[input_ip_addr_len + 0xd] == '\n')) {
      sock.sa_data[input_ip_addr_len + 0xd] = '\0';
    }

    // /tmp/flagファイルを開く
    flag_fp = fopen("/tmp/flag","r");
    if (flag_fp == (FILE *)0x0) {
      perror("Failed to open file");
      ret = 1;
    }
    else {
      // /tmp/flagファイルの内容を読み込む
      sVar4 = fread(flag_file_buffer,1,0x400,flag_fp);
      fclose(flag_fp);
      strlen("KEY{th1s_1s_n0t_f1ag_y0u_need_t0_f1nd_rea1_f1ag}");

      // flag_file_bufferの内容を暗号化する sVar4は↑のstrlenの結果
      encrypt(flag_file_buffer,(int)sVar4);

      // 暗号化したflag_file_bufferを送信する
      sockfd = socket(2,1,0);
      if (sockfd == -1) {
        perror("Failed to create socket");
        ret = 1;
      }
      else {
        sock.sa_family = 2;
        sock.sa_data._0_2_ = htons(5000); // 宛先ポート番号は5000
        pton_res = inet_pton(2,local_428,sock.sa_data + 2);
        if (pton_res < 1) {
          perror("Invalid address/Address not supported");
          ret = 1;
        }
        else {
          conn_res = connect(sockfd,&sock,0x10);
          if (conn_res == -1) {
            perror("Failed to connect to server");
            ret = 1;
          }
          else {
            sock_res = send(sockfd,flag_file_buffer,sVar4,0);
            if (sock_res == -1) {
              perror("Failed to send data");
              ret = 1;
            }
            else {
              puts("Data sent successfully");
              close(sockfd);
              ret = 0;
            }
          }
        }
      }
    }
  }
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return ret;
}
```

となっています。`/tmp/flag`を読み込んで暗号化して送信しているようです。`encrypt`関数を確認すると

```cpp
void encrypt(char *flag_file_buffer,int flag_file_buffer_len)
{
  // [0x35, 0x36, ...]と続く長さ0x100の配列の生成
  for (i = 0; i < 0x100; i = i + 1) {
    state[i] = (char)i + 0x35;
  }

  // state[i]とstate[j]を決まった順番で入れ替える
  j = 0;
  for (i = 0; i < 0x100; i = i + 1) {
    j = (uint)state[i] +
                *(byte *)(in_RDX + (ulong)i % in_RCX) + j & 0xff;
    // state[i]とstate[j]をswap
    tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;
  }

  x = 0;
  y = 0;
  // flag_file_buffer_lenの回数だけstate[x]とstate[y]を入れ替えてflag文字列を生成されたstateとXORする
  for (i = 0; (ulong)i < CONCAT44(in_register_00000034,flag_file_buffer_len);
      i = i + 1) {
    y = y + 1;
    x = x + state[(int)(uint)y];

    // swap
    tmp = state[(int)(uint)y];
    state[(int)(uint)y] = state[(int)(uint)x];
    state[(int)(uint)x] = tmp;

    flag_file_buffer[i] =
         flag_file_buffer[i] ^
         state
         [(int)(uint)(byte)(state[(int)(uint)x] + state[(int)(uint)y])];
  }
  return;
}
```

となります。ここで処理`*(byte *)(in_RDX + (ulong)i % in_RCX)`が何を与えられているかは逆アセンブル結果を見れば分かります。

まず`main`関数で`encrypt`関数を呼び出す直前に

```
00101671  LEA   RAX,[s_KEY{th1s_1s_n0t_f1ag_y0u_need_t0_001020 // この文字列のアドレスをRAXに格納
00101678  MOV   qword ptr [RBP + local_450],RAX=>s_KEY{th1s_1s // RAXの値をlocal_450に格納
0010167f  MOV   RAX,qword ptr [RBP + local_450]
00101686  MOV   RDI=>s_KEY{th1s_1s_n0t_f1ag_y0u_need_t0_001020
00101689  CALL  <EXTERNAL>::strlen                             // strlenでKEY文字列の長さを取得
0010168e  MOV   qword ptr [RBP + local_448],RAX                // 取得したKEY文字列を[RBP + local_448]に格納
00101695  MOV   RCX,qword ptr [RBP + local_448]                // RCXにKEY文字列の長さを格納
0010169c  MOV   RDX=>s_KEY{th1s_1s_n0t_f1ag_y0u_need_t0_001020 // RDXにKEY文字列を格納
001016a3  MOV   RSI,qword ptr [RBP + local_458]
001016aa  LEA   RAX=>local_418,[RBP + -0x410]
001016b1  MOV   RDI,RAX
001016b4  CALL  encrypt
```

ということで、`RDX`にはKEY文字列`KEY{th1s_1s_n0t_f1ag_y0u_need_t0_f1nd_rea1_f1ag}`、RCXにはKEY文字列の長さが格納された状態で`encrypt`関数が呼び出されています。

ということでこの処理をPythonに書き起こすと

```python
def encrypt(hex_stream, key):
    # RC4キーの初期化
    S = []
    for i in range(256):
        S.append((i + 53) % 256) # ここで53ずれた値を使う変更が加わっている
    j = 0
    key = [ord(c) for c in key]
    key_len = len(key)

    # RC4キーの生成
    for i in range(256):
        j = (j + S[i] + key[i % key_len]) % 256
        S[i], S[j] = S[j], S[i]

    # XORによる復号
    decrypted = []
    i = j = 0
    hex_stream = [int(hex_stream[i : i + 2], 16) for i in range(0, len(hex_stream), 2)]
    for byte in hex_stream:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        decrypted.append(byte ^ S[(S[i] + S[j]) % 256])

    # 復号されたストリームを文字列に変換
    decrypted_str = "".join([chr(byte) for byte in decrypted])
    return decrypted_str
```

となり著名な共通鍵暗号方式の`RC4`を少し変形させたものであると分かります。

フラグは`ctf4b{p4y_n0_4ttent10n_t0_t4at_m4n_beh1nd_t4e_cur4a1n}`です。
