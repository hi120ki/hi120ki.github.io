---
sidebar_position: 5
---

# Log Analysis Tools

This section introduces useful tools for analyzing access logs, query logs, and sending notifications to Slack.

## alp (Access Log Profiler)

[alp](https://github.com/tkuchiki/alp) is a log analyzer for Nginx access logs, supporting LTSV format and useful for identifying slow endpoints.

- Install:
  ```
  wget https://github.com/tkuchiki/alp/releases/download/v1.0.3/alp_linux_amd64.zip
  unzip alp_linux_amd64.zip ; sudo mv alp /usr/local/bin/alp ; rm alp_linux_amd64.zip
  ```
- Example usage:
  ```
  sudo cat /var/log/nginx/access.log | alp -r -m "/items/.+,/upload/.+,/transactions/.+,/users/.+,/new_items/.+,/static/.+" ltsv
  ```
- Useful options:
  - --sort=count (default)
  - --sort=max
  - --sort=sum
  - --sort=avg
  - -m "/items/.+,/upload/.+,/transactions/.+,/users/.+"

## pt-query-digest (MySQL Slow Query Analyzer)

[pt-query-digest](https://github.com/percona/percona-toolkit) analyzes MySQL slow query logs to help you find and optimize slow queries.

- Install:
  ```
  sudo apt install -y percona-toolkit
  ```
- Analyze top queries:
  ```
  sudo pt-query-digest /tmp/slow-query.log
  ```
- Analyze all queries:
  ```
  sudo pt-query-digest --limit 100% /tmp/slow-query.log
  ```
- Delete log:
  ```
  sudo rm /tmp/slow-query.log
  ```

## slackcat (Slack Notification CLI)

[slackcat](https://github.com/bcicen/slackcat) sends messages and files to Slack from the command line.

- Install:
  ```
  curl -Lo slackcat https://github.com/bcicen/slackcat/releases/download/1.7.2/slackcat-1.7.2-$(uname -s)-amd64
  sudo mv slackcat /usr/local/bin/ ; sudo chmod +x /usr/local/bin/slackcat
  slackcat --configure
  ```
