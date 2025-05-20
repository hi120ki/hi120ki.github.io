---
title: "Ubuntu22.04のnftablesでルーターを作る"
description: "Ubuntu22.04のnftablesでルーターを作る"
authors: [hi120ki]
tags: [Ubuntu, network]
slug: posts/20221121
---

R86Sという10Gbe SFP+ポートが2つ、2.5Gbe RJ45ポートが3つ付いたおもしろPCを購入したのでUbuntu22.04を入れてルーターにしていきます。

<!-- truncate -->

![R86S本体](/img/hugo/ubuntu-router.jpg)

## インターフェイス名を変更

Ubuntuインストール後、まずインターフェイス名を以下の記事を参考に変更します。

[https://www.jagchanna.ca/renaming-a-network-interface-in-ubuntu-18-04-on-ibm-cloud/](https://www.jagchanna.ca/renaming-a-network-interface-in-ubuntu-18-04-on-ibm-cloud/)

`ip a`コマンドで初期のインターフェイス名ごとにMACアドレス値を確認して、`/etc/udev/rules.d/70-persistent-net.rules`ファイルでインターフェイス名を固定します。

`/etc/udev/rules.d/70-persistent-net.rules`

```text
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:xx:xx:xx:xx:xx", NAME="eth0"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:xx:xx:xx:xx:xx", NAME="eth1"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:xx:xx:xx:xx:xx", NAME="eth2"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="f4:xx:xx:xx:xx:xx", NAME="sfp0"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="f4:xx:xx:xx:xx:xx", NAME="sfp1"
```

## ブリッジインターフェイスの設定

次にネットワーク設定のnetplanの設定ファイルを編集します。

今回は`eth0`をWANポートにして、他のポートについてはスイッチングハブのようにケーブルで繋げば設定されたサブネット(`10.1.0.1/16`)の中で互いに通信できるようにします。

そのためにまずはbridgeインターフェイスを作成し、WANポート以外の`eth1, eth2, sfp0, sfp1`を指定します。

こうすることで`eth1, eth2, sfp0, sfp1`に接続された機器は互いに通信でき、またルーターとなるR86Sは`10.1.0.1`を持つ機器のように認識されます。

`/etc/netplan/00-installer-config.yaml`

```yaml
network:
  ethernets:
    eth0:
      addresses:
        - 192.168.0.10/24
      routes:
        - to: default
          via: 192.168.0.1
      nameservers:
        addresses:
          - 8.8.8.8
    eth1:
      dhcp4: no
    eth2:
      dhcp4: no
    sfp0:
      dhcp4: no
    sfp1:
      dhcp4: no
  bridges:
    br0:
      interfaces: [eth1, eth2, sfp0, sfp1]
      addresses: [10.1.0.1/16]
      nameservers:
        addresses:
          - 8.8.8.8
  version: 2
```

## IPマスカレード(NAT)設定

Ubuntu22.04からフォワーディングやマスカレードを行うパケットフィルタリングツールがiptablesから[nftables](https://wiki.nftables.org/)に変更されました。

nftablesは初めから入っているため`ufw.service`サービスを止めた後、以下のような設定ファイルを編集し`nftables.service`を起動します。

```shell
$ sudo systemctl stop ufw.service
$ sudo systemctl disable ufw.service
```

`/etc/nftables.conf`

```text
#!/usr/sbin/nft -f

flush ruleset

define PORT_GLOBAL = eth0
define NET_PRIVATE = 10.1.0.0/16

table inet filter {
	chain input {
		type filter hook input priority 0;
	}
	chain forward {
		type filter hook forward priority 0;
	}
	chain output {
		type filter hook output priority 0;
	}
}

table ip nat {
	chain prerouting {
		type nat hook prerouting priority 0;
	}
	chain postrouting {
		type nat hook postrouting priority 100; policy accept;
		oifname $PORT_GLOBAL ip saddr $NET_PRIVATE masquerade
	}
}
```

```shell
$ sudo systemctl enable nftables.service
$ sudo systemctl start nftables.service
```

これで`10.1.0.0/16`からの通信が`eth0`ポートでNATされるようになります。

## DHCPサーバー

そして最後にDHCPサーバーをdocker composeで立ち上げます

`docker-compose.yml`

```yaml
version: "3"

services:
  dhcpd:
    image: networkboot/dhcpd
    restart: always
    network_mode: host
    command: br0
    volumes:
      - $PWD/data:/data
```

`data/dhcpd.conf`

```text
default-lease-time 6000;
max-lease-time 72000;
option routers 10.1.0.1;
option subnet-mask 255.255.0.0;
option domain-name-servers 1.1.1.1, 8.8.8.8;

subnet 10.1.0.0 netmask 255.255.0.0 {
  range 10.1.1.1 10.1.1.254;
}
```

このように設定ファイルを作り、`docker-compose up`コマンドを実行するとDHCPサーバーが立ち上がり、10.1.1.1~10.1.1.254のIPアドレスが割り振られるようになります。

## 速度測定

SFP+で接続したLAN内2台のPC間の速度を計測しました。

```shell
$ iperf3 -c 10.1.0.10
Connecting to host 10.1.0.10, port 5201
[  5] local 10.1.0.11 port 56902 connected to 10.1.0.10 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  1.08 GBytes  9.30 Gbits/sec  166   1.80 MBytes
[  5]   1.00-2.00   sec  1.09 GBytes  9.33 Gbits/sec    0   2.17 MBytes
[  5]   2.00-3.00   sec  1.09 GBytes  9.35 Gbits/sec    0   2.42 MBytes
[  5]   3.00-4.00   sec  1.09 GBytes  9.34 Gbits/sec    0   2.71 MBytes
[  5]   4.00-5.00   sec  1.09 GBytes  9.35 Gbits/sec    0   2.96 MBytes
[  5]   5.00-6.00   sec  1.09 GBytes  9.35 Gbits/sec    0   3.00 MBytes
[  5]   6.00-7.00   sec  1.09 GBytes  9.36 Gbits/sec    0   3.00 MBytes
[  5]   7.00-8.00   sec  1.09 GBytes  9.35 Gbits/sec    0   3.00 MBytes
[  5]   8.00-9.00   sec  1.09 GBytes  9.35 Gbits/sec    0   3.00 MBytes
[  5]   9.00-10.00  sec  1.09 GBytes  9.36 Gbits/sec    0   3.00 MBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-10.00  sec  10.9 GBytes  9.35 Gbits/sec  166             sender
[  5]   0.00-10.00  sec  10.9 GBytes  9.34 Gbits/sec                  receiver

iperf Done.
```

ワイヤーレートに近い値(9.3Gbps)となりました。
