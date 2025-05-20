---
sidebar_position: 4
---

# Monitoring Tools

This section introduces useful monitoring and profiling tools for web performance tuning.

## Netdata

[Netdata](https://www.netdata.cloud/) provides real-time performance monitoring and visualization for your servers and applications.

- Access the dashboard at [http://localhost:19999/](http://localhost:19999/)
- Install:
  ```
  bash <(curl -Ss https://my-netdata.io/kickstart.sh) --non-interactive
  sudo systemctl disable netdata
  sudo systemctl start netdata
  ```

## pprof (Go Profiling)

[pprof](https://github.com/google/pprof) is a profiling tool for Go applications, useful for CPU, memory, and goroutine analysis.

- Install Graphviz:
  ```
  sudo apt install -y graphviz
  ```
- Add to your Go application:
  ```go
  import (
    _ "net/http/pprof"
  )
  func main() {
    go func() {
      log.Println(http.ListenAndServe("0.0.0.0:6060", nil))
    }()
  }
  ```
