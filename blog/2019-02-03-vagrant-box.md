---
title: "[Vagrant] 古いバージョンの Box を削除する"
description: "Vagrantで古いバージョンの Box を削除する"
authors: [hi120ki]
tags: [Vagrant]
slug: posts/20190203
---

最近 Vagrant をよく使っており box を何度か update しました

[https://app.vagrantup.com/ubuntu/boxes/bionic64](https://app.vagrantup.com/ubuntu/boxes/bionic64)

```bash
vagrant box update
```

Vagrant は box の古いバージョンをディスクに維持するらしく，使用しない古い box が溜まってきます

<!-- truncate -->

```bash
vagrant box list
ubuntu/bionic64 (virtualbox, 20181203.0.0)
ubuntu/bionic64 (virtualbox, 20190122.0.0)
ubuntu/bionic64 (virtualbox, 20190131.0.0)
```

こちらのコマンドで box のバージョンを指定して削除することができます

```bash
vagrant box remove ubuntu/bionic64 --box-version 20181203.0.0
```

以下参考

```bash
vagrant -h
Usage: vagrant [options] <command> [<args>]

    -v, --version                    Print the version and exit.
    -h, --help                       Print this help.

Common commands:
    box             manages boxes: installation, removal, etc.
    cloud           manages everything related to Vagrant Cloud
    destroy         stops and deletes all traces of the vagrant machine
    global-status   outputs status Vagrant environments for this user
    halt            stops the vagrant machine
    help            shows the help for a subcommand
    init            initializes a new Vagrant environment by creating a Vagrantfile
    login
    package         packages a running vagrant environment into a box
    plugin          manages plugins: install, uninstall, update, etc.
    port            displays information about guest port mappings
    powershell      connects to machine via powershell remoting
    provision       provisions the vagrant machine
    push            deploys code in this environment to a configured destination
    rdp             connects to machine via RDP
    reload          restarts vagrant machine, loads new Vagrantfile configuration
    resume          resume a suspended vagrant machine
    snapshot        manages snapshots: saving, restoring, etc.
    ssh             connects to machine via SSH
    ssh-config      outputs OpenSSH valid configuration to connect to the machine
    status          outputs status of the vagrant machine
    suspend         suspends the machine
    up              starts and provisions the vagrant environment
    upload          upload to machine via communicator
    validate        validates the Vagrantfile
    version         prints current and latest Vagrant version
    winrm           executes commands on a machine via WinRM
    winrm-config    outputs WinRM configuration to connect to the machine

For help on any individual command run `vagrant COMMAND -h`

Additional subcommands are available, but are either more advanced
or not commonly used. To see all subcommands, run the command
`vagrant list-commands`.
```

```bash
vagrant box -h
Usage: vagrant box <subcommand> [<args>]

Available subcommands:
    add
    list
    outdated
    prune
    remove
    repackage
    update

For help on any individual subcommand run `vagrant box <subcommand> -h`
```

```bash
vagrant box remove -h
Usage: vagrant box remove <name>

Options:

    -f, --force                      Remove without confirmation.
        --provider PROVIDER          The specific provider type for the box to remove
        --box-version VERSION        The specific version of the box to remove
        --all                        Remove all available versions of the box
    -h, --help
```
