---
sidebar_position: 2
---

# Checklist & Operations

This section provides a practical checklist for before, during, and after the contest, as well as useful operational commands for setup and daily work.

## Checklist

### Before the Contest

- Create a GitHub repository
- Obtain a slackcat API key

### Immediately After Start

- Configure SSH for bastion and servers
- Backup important directories (e.g., ~/isucon9-qualify/, /etc/mysql/, /etc/nginx/, /etc/systemd/system/)
- Set up Makefile and register deploy keys
- Push code to GitHub
- Run the initial benchmark and share the score
- Edit nginx.conf for LTSV logging and restart Nginx
- Add pprof to main.go for profiling
- Install analysis tools (e.g., make i-tool)
- Update MySQL configuration (e.g., make db-conf)
- Edit MySQL's LimitNOFILE and restart
- Run measurement scripts and benchmarks
- Record scores with git tags
- Use Netdata to check resource usage ([Netdata Dashboard](http://0.0.0.0:19999))
- Create a deploy.sh script for automated deployment and benchmarking

#### Example: SSH Config

```sshconfig
Host isucon-bastion
  HostName <bastion server>
  User <username>

Host isucon-server
  ProxyJump isucon-bastion
  HostName <instance address>
  LocalForward localhost:10443 localhost:443
```

#### Example: deploy.sh

```bash
#!/bin/bash
# ssh isucon "cd ~/isucon9-qualify ; bash deploy.sh master"
export GOENV_ROOT="$HOME/.goenv"
export PATH="$GOENV_ROOT/bin:$PATH"
eval "$(goenv init -)"
cd ~/isucon9-qualify
git pull
git checkout $1
cd ~/isucon9-qualify/webapp/go
go build -o isucari
sudo systemctl restart isucari
sudo systemctl status isucari
echo "!!!benchmark start!!!"
sudo systemctl stop isu-shipment
sudo systemctl stop isu-payment
cd ~/isucon9-qualify
./bin/benchmarker
echo "!!!benchmark finish!!!"
sudo systemctl start isu-shipment
sudo systemctl start isu-payment
```

### Before the End

- Turn off Nginx and MySQL logging
- Enable Nginx and MySQL with systemctl
- Delete ~/logs/
- Stop and disable Netdata
- Remove pprof
- Ensure main function does not contain direct DB operations
- Confirm API and MySQL restart resilience
- Ensure everything works after reboot and benchmarks complete

## Useful Commands

- **scp (secure copy):**
  - Copy from remote to local:
    ```
    scp user@remoteHost:/path/to/file /local/path
    ```
  - Copy from local to remote:
    ```
    scp /local/file user@remoteHost:/remote/path
    ```
  - Copy directories recursively:
    ```
    scp -r user@remoteHost:/remote/dir /local/dir
    ```
- **Delete journal logs:**
  ```
  sudo journalctl --rotate ; sudo journalctl --vacuum-time=1s
  ```
- **Initial git configuration:**
  ```
  git config --global user.name "isucon"
  git config --global user.email "isucon@example.com"
  ```
- **SSH key setup:**
  ```
  curl https://github.com/hi120ki.keys >> ~/.ssh/authorized_keys
  ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 1>/dev/null ; cat ~/.ssh/id_ed25519.pub
  ```
