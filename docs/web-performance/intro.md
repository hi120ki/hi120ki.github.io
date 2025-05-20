---
sidebar_position: 1
---

# Introduction

[ISUCON Official Blog](http://isucon.net/)

ISUCON is a contest where teams compete to optimize a given web service for maximum performance. The key is to identify and resolve bottlenecks through repeated cycles of tuning and measurement.

## Key Concepts

- **Resolve service bottlenecks:**
  - Repeat "tune → measure → find bottleneck"
- **Resolve team bottlenecks:**
  - Divide tasks so no one is blocked
  - Avoid interfering with each other's work
- **Resolve development bottlenecks:**
  - Make small commits with clear messages
  - Use an environment that allows quick rollbacks (e.g., GitHub pull requests and revert)
  - ISUCON scoring is strict—always ensure you can revert failed changes

## Tips

- Don't start coding blindly. Spend the first 30 minutes reading documentation and confirming service behavior.
- Understand user stories, benchmark behavior, and scoring.
- Identify critical and non-critical endpoints.
- Benchmark scores are not always the best indicator—focus on bottleneck analysis.
- Use logs and metrics to analyze where the bottlenecks are (e.g., Nginx access log, MySQL slow query log, Netdata, pprof).

## Team Structure

A typical team structure is `App` - `App` - `DB/Infra`.

- **App:**
  - Fix N+1 queries
  - Implement memory caching
  - Parallelize external API calls
  - Avoid deadlocks
- **DB:**
  - Adjust indexes
  - Change schema as needed
  - Optimize queries
- **Infra:**
  - Manage deployment and benchmarking
  - Install and tune middleware
  - Analyze logs
  - Handle multi-server distribution
