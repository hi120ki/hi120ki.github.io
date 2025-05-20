---
sidebar_position: 3
---

# System & Middleware Tuning

This section covers system-level tuning (kernel parameters, open file limits) and middleware tuning for MySQL, Nginx, and Redis.

## System Tuning

### Kernel Parameters

Check current file limits:

```
sudo sysctl -a | grep file-max
```

Recommended settings:

```
sudo bash -c 'echo "net.core.somaxconn = 10000" >> /etc/sysctl.conf'
sudo bash -c 'echo "net.ipv4.tcp_tw_reuse = 1" >> /etc/sysctl.conf'
sudo bash -c 'echo "net.ipv4.tcp_fin_timeout = 10" >> /etc/sysctl.conf'
sudo bash -c 'echo -e "net.ipv4.ip_local_port_range = 10000\t60999" >> /etc/sysctl.conf'
sudo sysctl -p
```

### Open File Limit

Edit the service file (e.g., /lib/systemd/system/mysql.service):

```
[Service]
LimitNOFILE = 65535
```

Reload and restart:

```
sudo systemctl daemon-reload ; sudo systemctl restart mysql
```

---

## MySQL Tuning

[MySQL Official Site](https://www.mysql.com/jp/)

### Install on Ubuntu

- [MySQL APT Guide](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/)

```
wget https://dev.mysql.com/get/mysql-apt-config_0.8.15-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.15-1_all.deb
sudo apt update ; sudo apt install -y mysql-server
rm mysql-apt-config_0.8.15-1_all.deb ; mysql --version
```

### Common Commands

```
mysql -u root -p
sudo systemctl start|restart|enable|status mysql
sudo journalctl -u mysql
sudo nano /etc/mysql/my.cnf
```

### Tuning

```
sudo bash -c 'echo "max_connections = 20000" >> /etc/mysql/mysql.conf.d/mysqld.cnf'
sudo bash -c 'echo "innodb_buffer_pool_size = 1G" >> /etc/mysql/mysql.conf.d/mysqld.cnf'
sudo bash -c 'echo "innodb_flush_log_at_trx_commit = 0" >> /etc/mysql/mysql.conf.d/mysqld.cnf'
sudo bash -c 'echo "innodb_flush_method=O_DIRECT" >> /etc/mysql/mysql.conf.d/mysqld.cnf'
sudo systemctl restart mysql
```

Check config values:

```
mysql -uroot -p -e 'SHOW variables LIKE "%open_files_limit%";'
mysql -uroot -p -e 'SHOW variables LIKE "%max_connections%";'
```

### Slow Query Log

```
[mysqld]
slow_query_log = 1
slow_query_log_file = "/tmp/slow-query.log"
long_query_time = 0
```

Enable/disable at runtime:

```
mysql -uroot -p -e "set global slow_query_log_file = '/tmp/slow-query.log'; set global long_query_time = 0; set global slow_query_log = ON;"
mysql -uroot -p -e "set global slow_query_log = OFF;"
```

---

## Nginx Tuning

[Nginx Official Site](https://nginx.org/en/)

### Install on Ubuntu

- [Nginx Packages](https://nginx.org/en/linux_packages.html#Ubuntu)

```
sudo apt install -y curl gnupg2 ca-certificates lsb-release
echo "deb http://nginx.org/packages/mainline/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo apt-key add -
sudo apt update ; sudo apt install -y nginx
```

### Common Commands

```
sudo systemctl start|enable|status nginx
sudo journalctl -u nginx
```

### Example Configurations

**Basic:**

```
    server_tokens off;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    types_hash_max_size 2048;
    open_file_cache max=100000 inactive=20s;
    keepalive_timeout 65;
    keepalive_requests 500;
    gzip_static on;
```

**LTSV Logging:**

```
    log_format ltsv "time:$time_local"
                    "\thost:$remote_addr"
                    "\tforwardedfor:$http_x_forwarded_for"
                    "\treq:$request"
                    "\tstatus:$status"
                    "\tsize:$body_bytes_sent"
                    "\treferer:$http_referer"
                    "\tua:$http_user_agent"
                    "\treqtime:$request_time"
                    "\tcache:$upstream_http_x_cache"
                    "\truntime:$upstream_http_x_runtime"
                    "\tvhost:$host"
                    "\tmethod:$request_method"
                    "\turi:$request_uri";
    access_log  /var/log/nginx/access.log  ltsv;
```

**Proxy Example:**

```
    upstream app {
        server 127.0.0.1:8080;
    }
    upstream login {
        server 127.0.0.1:8080 weight=4;
        server 192.168.0.213:8080 weight=6;
    }
    server {
        listen       8000;
        server_name  localhost;
        root   /home/vagrant/isucon9-qualify/webapp/public;
        location /static/ {
            add_header Cache-Control "public max-age=86400";
        }
        location /upload/ {
            add_header Cache-Control "public max-age=86400";
        }
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
        }
        location /login {
            proxy_pass http://login;
            proxy_set_header Host $host;
        }
    }
```

---

## Redis Tuning

[Redis Official Site](https://redis.io/)

### Install on Ubuntu

```
sudo add-apt-repository -y ppa:chris-lea/redis-server ; sudo apt install -y redis-server
redis-server -v
sudo nano /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### Common Commands

```
sudo systemctl start|enable|status redis-server
sudo journalctl -u redis-server
```

### Go Client

- [go-redis/redis](https://github.com/go-redis/redis)

```
go get github.com/go-redis/redis/v8
```
