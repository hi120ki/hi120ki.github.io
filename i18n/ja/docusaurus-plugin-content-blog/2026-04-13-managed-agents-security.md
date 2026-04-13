---
title: Claude Managed Agentsのセキュリティ評価とマルチユーザー運用の課題
description: Claude Managed Agentsのセキュリティ評価とマルチユーザー運用の課題
authors: [hi120ki]
tags: [AI, Security, LLM, Agent, MCP]
slug: posts/20260413
image: /img/2026-04-13/ogp.png
---

# Claude Managed Agentsのセキュリティ評価とマルチユーザー運用の課題

2026年4月、AnthropicからClaude Managed Agentsがpublic betaとして公開されました。

> Introducing Claude Managed Agents: everything you need to build and deploy agents at scale. It pairs an agent harness tuned for performance with production infrastructure, so you can go from prototype to launch in days.
>
> — [@claudeai](https://x.com/claudeai/status/2041927687460024721)

AIエージェントを本番環境で動かすには、エージェントループの実装、サンドボックスの構築、ツール実行基盤の整備、認証情報の管理など、やることが多い。Managed AgentsはこれらをすべてAnthropicがホストするマネージドサービスとして提供するもので、自前でインフラを構築することなく、長時間実行タスクや非同期ワークロードを安全に動かせます。

<!-- truncate -->

Claudeがファイルの読み書き、シェルコマンドの実行、Web検索、MCPサーバー経由の外部サービス連携を自律的に行える環境が、APIを叩くだけで手に入ります。

アーキテクチャの設計思想はAnthropicのエンジニアリングブログ "[Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents)" に詳しくまとまっています。

## アーキテクチャの構成要素

Managed Agentsは4つのコンポーネントで構成されています。

![Managed Agents Components](/img/2026-04-13/managed-agents-base.png)

### Agent

Agentはエージェントの「何ができるか」を定義するコンポーネントです。

- 使用するモデル（claude-sonnet-4-6など）
- システムプロンプト
- 利用可能なツール（ビルトインツールセットやカスタムツール）
- 接続するMCPサーバー
- Agent Skill

ビルトインのツールセット `agent_toolset_20260401` を指定すると、bash、read、write、edit、glob、grep、web_fetch、web_searchの8つのツールが有効になります。個別のツールを無効にしたり、逆に `default_config.enabled: false` で全ツールを無効にした上で必要なものだけを有効にすることもできます。

```python
agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-sonnet-4-6",
    system="You are a helpful coding assistant.",
    tools=[
        {
            "type": "agent_toolset_20260401",
            "default_config": {"enabled": False},
            "configs": [
                {"name": "bash", "enabled": True},
                {"name": "read", "enabled": True},
                {"name": "write", "enabled": True},
            ],
        },
    ],
)
```

Agentは一度作成するとIDで参照でき、複数のセッションで使い回せます。

### Environment

Environmentはエージェントが実行されるコンテナのテンプレートです。

- パッケージのプリインストール（pip、npm、apt、cargo、gem、go）
- ネットワークアクセスの制御

パッケージはセッションの開始前にインストールされ、同じEnvironmentを参照するセッション間でキャッシュされます。

ネットワークについては `unrestricted`（デフォルト、フルアクセス）と `limited` の2モードがあります。`limited` では `allowed_hosts` で通信先を明示的に指定できます。

```python
environment = client.beta.environments.create(
    name="secure-env",
    config={
        "type": "cloud",
        "packages": {
            "pip": ["pandas", "numpy"],
            "apt": ["ffmpeg"],
        },
        "networking": {
            "type": "limited",
            "allowed_hosts": ["api.example.com"],
            "allow_mcp_servers": True,
            "allow_package_managers": True,
        },
    },
)
```

`allow_mcp_servers` をTrueにするとAgentに設定されたMCPサーバーへの通信が許可され、`allow_package_managers` をTrueにするとPyPIやnpmなどのパッケージレジストリへのアクセスが許可されます。これらはそれぞれデフォルトではFalseです。

Environmentを参照する複数のセッションは、それぞれ独立したコンテナインスタンスを取得します。ファイルシステムの状態はセッション間で共有されません。

### Session

SessionはAgentとEnvironmentを組み合わせてタスクを実行するインスタンスです。

セッションの作成時にAgent IDとEnvironment IDを指定し、ユーザーメッセージをイベントとして送信すると、Claudeがツールを自律的に選択・実行してタスクを処理します。結果はServer-Sent Events（SSE）でリアルタイムにストリーミングされます。

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    vault_ids=[vault.id],
    title="Alice's task",
)
```

セッションの作成時に `vault_ids` を指定することで、Credential Vaultに保管された認証情報をMCPサーバーへの接続に使用できます。

イベント履歴はサーバー側に永続化されるため、いつでも完全なイベントログを取得できます。これが可観測性の面でも大きなメリットになっています。

### Credential Vault

Credential VaultはMCPサーバーへの認証に必要な情報を保管する仕組みです。

Vaultには2種類の認証情報を格納できます。

- `static_bearer` - APIキーやパーソナルアクセストークンなどの固定トークン
- `mcp_oauth` - OAuthのアクセストークンとリフレッシュトークン

`mcp_oauth` の場合、リフレッシュトークンとトークンエンドポイントを登録しておくと、Anthropic側でアクセストークンの自動更新を行ってくれます。

```python
vault = client.beta.vaults.create(
    display_name="Alice",
    metadata={"external_user_id": "usr_abc123"},
)

credential = client.beta.vaults.credentials.create(
    vault_id=vault.id,
    display_name="Alice's Slack",
    auth={
        "type": "mcp_oauth",
        "mcp_server_url": "https://mcp.slack.com/mcp",
        "access_token": "xoxp-...",
        "expires_at": "2026-04-15T00:00:00Z",
        "refresh": {
            "token_endpoint": "https://slack.com/api/oauth.v2.access",
            "client_id": "1234567890.0987654321",
            "scope": "channels:read chat:write",
            "refresh_token": "xoxe-1-...",
            "token_endpoint_auth": {
                "type": "client_secret_post",
                "client_secret": "abc123..."
            },
        },
    },
)
```

Vaultには1つのVault内では、同じ `mcp_server_url` に対して有効な認証情報は1つだけといったいくつかの制約があります。

認証情報はセッション実行中に定期的に再解決されるため、実行中のセッションを再起動しなくてもトークンのローテーションが反映されます。

### コンポーネント間の関係

| コンポーネント   | 役割                                                 | ライフサイクル                 |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| Agent            | モデル、プロンプト、ツール、Skill、MCPサーバーの定義 | 作成後、複数セッションで再利用 |
| Environment      | コンテナのテンプレート（パッケージ、ネットワーク）   | 作成後、複数セッションで再利用 |
| Session          | AgentとEnvironmentの実行インスタンス                 | タスクごとに作成               |
| Credential Vault | MCPサーバーの認証情報の保管庫                        | セッション作成時に紐づけ       |

AgentとEnvironmentは一度定義すれば使い回せる「テンプレート」で、Sessionがそれらを組み合わせた「実行インスタンス」です。Credential Vaultはセッション作成時にVault IDで紐づけることで、MCPサーバーへの認証が透過的に行われます。

## BrainとHandsの分離アーキテクチャ

エンジニアリングブログではManaged Agentsの内部設計が詳しく解説されています。

### Pet vs Cattle問題

Managed Agentsの初期設計では、すべてのエージェントコンポーネントを単一のコンテナに配置していました。ファイル編集がシステムコールで完結する、サービス境界の設計が不要になる、というメリットがあったためです。

しかし、この設計には致命的な問題がありました。コンテナが障害で停止すると、セッション全体が失われてしまうのです。応答不能になったコンテナの復旧作業が必要になり、WebSocketのイベントストリームだけがデバッグの手がかりという状況でした。

この問題を解決するために、アーキテクチャを「Brain」と「Hands」に分離しました。

### BrainとHandsの役割

- Brain（頭脳）: Claudeのモデル推論とツール呼び出しのルーティングを行うハーネス。コンテナの外側で動作する
- Hands（手）: サンドボックスでのコマンド実行やMCPサーバーとの通信を行う実行環境。`execute(name, input) → string` という統一インターフェースで呼び出される

コンテナが停止してもBrainはツール呼び出しエラーとしてClaudeに返すだけで、セッション自体は失われません。必要に応じて新しいコンテナを `provision({resources})` で初期化できます。

### 認証情報の分離

セキュリティの面で最も重要なのは、認証情報の扱いです。

初期の結合設計では、Claudeが生成した信頼できないコードが認証情報と同じコンテナ内で実行されていました。Prompt Injection攻撃者は環境変数を読むだけでトークンを窃取できる状態です。

分離アーキテクチャでは、認証情報の扱いが根本的に変わっています。

Git認証の場合、リポジトリのアクセストークンはサンドボックスの初期化時にリポジトリのクローンに使われ、ローカルのgitリモートに組み込まれます。エージェントが `git push` や `git pull` を実行する際にトークンそのものを扱う必要はありません。

OAuth認証の場合、トークンはCredential Vaultに保管されます。Claudeは専用プロキシ経由でMCPツールを呼び出し、プロキシがセッションに関連するVaultからトークンを取得して外部サービスへリクエストを送信します。Brainは認証情報を一切認識しません。

つまり、サンドボックス内でエージェントが実行するコードからは、認証情報にアクセスする手段がそもそも存在しないのです。これはPrompt Injectionによるトークン窃取を構造的に排除する、非常に優れた設計です。

## セキュリティ評価

自分が2月に書いた「[エージェントプラットフォームに必要なセキュリティ対策まとめ](https://hi120ki.github.io/blog/posts/20260223/)」の評価フレームワークをベースに、Managed Agentsのセキュリティを項目ごとに評価していきます。

### サンドボックス

セッションごとにクラウド上で隔離されたコンテナインスタンスが生成されます。同じEnvironmentを参照する複数のセッションであっても、ファイルシステムの状態は共有されません。あるセッションで作成したファイルを別のセッションから読み取ることはできない構造です。

これにより、エージェントが操作可能なファイルやプロセスが特定の範囲に限定されます。あるユーザーのセッションが別のユーザーのセッションに干渉したり、セッション間で機密情報が漏洩するリスクを構造的に防いでいます。

AIエージェントはコードの生成と実行を行うため、意図しないファイルの作成・変更・削除が起こりえます。セッションごとの隔離環境はこの影響を封じ込める基本的な防御層です。

### ネットワーク制御

Environmentのネットワーク設定で外部通信を制御できます。

デフォルトの `unrestricted` モードでは安全性のブロックリストを除いてフルアクセスが許可されます。本番環境では `limited` モードが推奨されており、`allowed_hosts` で通信先を明示的に指定します。

```python
"networking": {
    "type": "limited",
    "allowed_hosts": ["api.example.com", "github.com"],
    "allow_mcp_servers": True,
    "allow_package_managers": False,
}
```

`allow_package_managers` をFalseにすれば、エージェントがパッケージレジストリに接続してライブラリをインストールすることも防げます。これはサプライチェーン攻撃（slopsquattingなど、AIが誤った名前のパッケージをインストールして悪意あるコードが実行される手法）への対策として有効です。

ネットワーク制御はPrompt Injectionの間接的な経路を遮断する上でも重要です。エージェントが外部のWebページを取得して処理する際に、そのページに埋め込まれた悪意ある命令に従って意図しない通信先にデータを送信してしまうリスクを、通信先の制限によって軽減できます。

### 認証情報の分離

先述のとおり、Credential Vaultに保管された認証情報はサンドボックスから完全に分離されています。

1. 管理者がCredential VaultにMCPサーバーの認証情報を保存する
2. セッション作成時にVault IDを指定する
3. エージェントがMCPツールを呼び出す
4. 専用プロキシがVaultから認証情報を取得し、MCPサーバーにリクエストを送信する
5. 結果がエージェントに返される

この過程で、サンドボックス内で動くエージェント（とそこで実行されるコード）は認証情報に一切触れません。環境変数にもファイルシステムにもトークンは存在しません。

ただし、OAuthのスコープを制限する仕組みは提供されていません。例えばSlackのOAuthで `channels:read` と `chat:write` の両方のスコープが付与されている場合、Credential Vaultの段階で `channels:read` だけに絞ることはできません。スコープの制限はOAuthクライアントの設定段階で行う必要があります。

### 最小権限の原則

MCPサーバー経由のツールには、ツールごとに3段階のアクセス制御を設定できます。

- `allowed_tools` - 常に許可。エージェントが自由に呼び出せる
- `user_approved_tools` - 呼び出しのたびに人間の承認が必要
- `denied_tools` - 利用禁止。エージェントが呼び出そうとしてもブロックされる

例えばNotion MCPサーバーのツールを設定する場合、ページの読み取り（`notion-fetch`）は常に許可、ページの作成（`notion-create-pages`）は人間の承認が必要、ページの削除は禁止、というように細かく制御できます。

この仕組みを使えば、エージェントから書き込み権限を完全に取り除いた「読み取り専用エージェント」を構成することも可能です。データの閲覧や分析だけを行うエージェントであれば、書き込み系のツールをすべて `denied_tools` に入れることで、誤操作や情報漏洩のリスクを大幅に減らせます。

またビルトインツールについても、`agent_toolset_20260401` の設定で個別にツールを無効にできます。web_fetchやweb_searchを無効にすれば外部コンテンツの取得を禁止でき、Prompt Injectionの攻撃面を縮小できます。

### 可観測性

Managed Agentsのセッション履歴は詳細です。

人間とエージェントのやりとり（ユーザーメッセージ、エージェントの応答）だけでなく、デバッグタブではツール呼び出しの引数と結果がすべて記録されています。エージェントがどのファイルにどんな内容を書き込んだか、どのbashコマンドを実行してどんな出力を得たか、MCPツールにどんなパラメータを渡したかが完全に追跡できます。

これはエージェントが問題のある行動をした場合の事後調査に非常に有用です。何がきっかけで何が起きたかを時系列で再構成できます。

しかし、サンドボックス内のランタイムセキュリティ機能は提供されていません。ここでいうランタイムセキュリティとは、Falcoのようなツールで行うプロセスレベルの監視のことです。

例えば、エージェントがPythonのパッケージをインストールする際、名前の似た悪意あるパッケージを誤ってインストールしてしまったとします（slopsquatting）。そのパッケージにバックドアが含まれていて、サンドボックス内で不審なプロセスが起動したり、環境内の情報を外部に送信しようとした場合、ネットワーク制御で通信は防げるかもしれません。しかし、そのプロセス自体が何を実行し、どのファイルにアクセスし、何を試みたかをシステムコールレベルで記録する仕組みは現状ありません。

自前のサーバーであればFalcoやeBPFベースの監視ツールを導入できますが、Managed Agentsの環境はAnthropicがホストしているため、ユーザー側でこれらを導入することはできません。プラットフォーム側での対応が望まれます。

### プロンプトフィルタリング

Prompt InjectionやAgent Goal Hijacking（エージェントのゴールを乗っ取る攻撃）への対策として、入出力の両方をModel Armorのような検査機でフィルタリングしたいところです。

OWASP Top 10 for Agentic Applications 2026では、Prompt Injectionに代わってAgent Goal Hijackingが主要な脅威として挙げられるようになりました。エージェントとのやりとりの中に不正な命令を埋め込むことで、エージェントの目的を書き換える攻撃です。

Managed Agentsでは、ユーザーからの入力をフィルタリングすることは自前で対応できます。セッションにイベントを送信する前に独自のプロキシを経由させ、不正な入力をブロックすればよいのです。

しかし、エージェントの出力をフィルタリングする仕組みは提供されていません。エージェントがツールの実行結果やWebページの内容を処理する過程で悪意ある命令に従い、不適切な出力を返す場合にも、それをAPIの構造上フィルタリングすることが難しい状況です。入力と出力の両方をカバーするガードレールが今後整備されることを期待しています。

### 評価まとめ

| セキュリティ対策         | 状況 | 備考                                                          |
| ------------------------ | ---- | ------------------------------------------------------------- |
| サンドボックス           | ○    | セッションごとに隔離されたコンテナインスタンス                |
| ネットワーク制御         | ○    | limitedモードで通信先を明示指定、パッケージレジストリも制御可 |
| 認証情報の分離           | ○    | Credential Vault + 専用プロキシでサンドボックスから完全隔離   |
| 最小権限の原則           | ○    | MCPツール単位のallowed/denied/user_approved制御               |
| 可観測性                 | △    | ツール呼び出しの引数・結果まで記録、ランタイム監視は未整備    |
| プロンプトフィルタリング | △    | 入力は自前のプロキシで対応可、出力のフィルタリングは未対応    |
| ランタイムセキュリティ   | ×    | サンドボックス内のプロセス監視なし、ユーザー側での導入も不可  |

基本的なセキュリティ機構は十分に揃っています。特にCredential Vaultによる認証情報の隔離は、エージェントが実行するコードから認証情報にアクセスする手段を構造的に排除しており、強固な設計です。

ランタイムセキュリティについてはAnthropicがホストする環境のため、Falcoのようなプロセス監視をユーザー側で導入できません。プラットフォーム側での対応が必要です。プロンプトフィルタリングも、入力側は自前のプロキシで対応できますが、エージェント出力のフィルタリングはAPIの構造上まだ実現できません。

ネットワーク制御やツールの許可リストなど、ユーザー側で設定可能な対策については積極的に活用し、不要な攻撃面を削っていくことが重要です。特に本番環境では `limited` ネットワークと最小限のツール構成を出発点にすることを推奨します。

## Confused Deputy Problem

しかし、マルチユーザー環境で実際に運用しようとすると、大きな課題に直面します。Confused Deputy Problem（権限の混同）です。

### Confused Deputy Problemとは

Confused Deputy Problemはセキュリティの古典的な問題で、あるプログラムが自身の権限ではなく別の主体の権限を誤って行使してしまう状況を指します。

Managed Agentsの文脈では、エージェントがユーザーAの権限で動作すべきところを、ユーザーBの認証情報を使って外部サービスにアクセスしてしまう状況がこれに該当します。

### Managed Agentsでの具体的な問題

Credential Vaultに認証情報を保存する際、Claude Console上で以下の警告が表示されます。

> This credential will be shared across this workspace. Anyone with API key access can use this credential in an agent session to access the service associated with the credential - including reading data and taking actions on behalf of the credential owner.

ここに書かれているとおり、保存された認証情報はワークスペース全体で共有されます。そのワークスペースのAPIキーを持つ誰もが、その認証情報をセッションで使用できます。

具体的なシナリオを考えてみます。

1. AliceがClaude Consoleにアクセスし、自身のNotionアクセストークンをCredential Vault Aに保存する
2. BobもClaude Consoleにアクセスし、自身のNotionアクセストークンをCredential Vault Bに保存する
3. Bobがセッションを作成する際に、自分のVault Bではなく、AliceのVault Aを `vault_ids` に指定する
4. そのセッションのエージェントはAliceの権限でNotionにアクセスする

Bobは本来閲覧できないはずのAliceのNotionワークスペースの情報を、エージェント経由で自由に閲覧・変更できてしまいます。

### なぜこれが深刻なのか

組織内でエージェントを活用する場合、ユーザーにはそれぞれ異なる権限があります。

エンジニアはHRチームの人事情報を閲覧してはいけないし、IRチームがエンジニアの管理するサービスに変更を加えてもいけません。営業チームが開発チームの社内リポジトリにアクセスする必要もありません。

こうしたアクセス境界と権限の分離はすでに各サービス（Notion、Slack、GitHubなど）のアクセス制御で実現されています。エージェントがこれらのサービスに接続する際、ユーザーの権限をそのまま反映して委任する必要があります。他人の権限を使ってアクセスできてしまう状態は、既存のアクセス制御を完全に迂回することを意味します。

### 正しい管理体制

Claude Consoleの管理画面をエンドユーザーに直接触らせるべきではありません。Consoleにアクセスできる誰もがVaultを操作できてしまう以上、管理者だけがConsoleにアクセスし、エンドユーザーには自身のクレデンシャルのみを登録できる独立したインターフェースを提供する必要があります。

現状のManaged Agentsには、このConfused Deputy Problemを防ぐ仕組みは提供されていません。

## 認証情報管理インターフェース

そこで、マルチユーザー環境でCredential Vaultを安全に管理するインターフェースをオープンソースとして公開します。

[hi120ki/managed-agents-interface](https://github.com/hi120ki/managed-agents-interface)

![Managed Agents Interface](/img/2026-04-13/managed-agents-interface.png)

### 設計の考え方

考え方はシンプルです。

- Claude Consoleへのアクセスはエージェント管理者のみに制限する
- エージェントを利用するユーザーには、Claude Consoleとは別のインターフェースを提供する
- そのインターフェースでは、ユーザーが自身のクレデンシャルのみを作成・更新できるよう制御する

エンドユーザーがClaude Consoleにアクセスする必要はなくなり、Credential Vaultの直接操作も行われません。ユーザーから見れば「サービスごとのOAuthボタンを押して権限を付与するだけ」です。

![Managed Agents](/img/2026-04-13/managed-agents.png)

### 具体的なフロー

1. ユーザーがGoogle Cloud IAP（Identity-Aware Proxy）で認証される。IAPはGoogle Cloudが提供するアプリケーションレベルの認証基盤で、ユーザーの識別がリクエストに対して透過的に行われる
2. 認証されたユーザーに対して、画面にNotion、Slack、GitHub、Atlassianなどサービスごとのボタンが表示される
3. ユーザーがボタンを押すとOAuthフローが開始される。裏側ではMCPサーバーのDynamic Client Registration（DCR）によるOAuthクライアントの自動登録や、事前に生成されたOAuthクライアントが使われている
4. OAuthフロー完了後、取得したアクセストークンとリフレッシュトークンがAnthropic SDKを経由してCredential Vault APIに自動格納される。このとき、VaultのdisplayNameにはIAPで取得したユーザー識別子が使われ、ユーザーとVaultの対応づけが確保される
5. エージェントのセッション作成時に、利用ユーザーを特定し、そのユーザーに対応するVaultをCredential Vault APIから検索して `vault_ids` に指定する

Credential Vault APIはVaultの `metadata` フィールドに外部ユーザーIDなどの任意のデータを格納できるため、ユーザーとVaultのマッピングはこのフィールドを使うことが可能です。

### Token Vaultの概念

こうしたユーザーごとの認証情報を管理・保存するシステムは一般的にToken Vaultと呼ばれます。

大規模な組織ではユーザーごとに権限が異なり、その権限の境界をエージェントにも正確に反映する必要があります。各ユーザーが自身の権限でのみエージェントを使用し、他のユーザーの権限にアクセスできない状態を担保するのがToken Vaultの役割です。

AnthropicのCredential Vault APIはToken Vaultの保管庫としては十分に機能しますが、マルチユーザー環境でのアクセス制御はAPI利用者側で実装する必要があります。今回公開するインターフェースがその実装の一つです。

## 今後の展望

このインターフェースでConfused Deputy Problemには対処できますが、Managed Agentsを組織で本格的に活用するにはまだ足りないパーツがあります。

コスト管理の観点では、誰がどのエージェントをどれだけ使ったかを把握する仕組みが必要です。エージェントのセッションにはトークン消費やツール呼び出し回数などのメトリクスがありますが、これをユーザー単位で集計し、部署やプロジェクトごとにコスト配分する基盤は自前で構築する必要があります。

監査の観点でも課題があります。誰がいつどのようにエージェントを利用したかについて、セッションのログを正確に取得・解析する仕組みが求められます。セッション履歴はAPIで取得できますが、大量のセッションを横断的に検索・分析するためのツーリングはまだ整っていません。

これらのエージェント活用に必要な周辺機能が公式に揃っていくことを強く望んでいます。このオープンソースプロジェクトがManaged Agents活用の一助になれば嬉しいです。

## 参考

- [Scaling Managed Agents: Decoupling the brain from the hands - Anthropic Engineering Blog](https://www.anthropic.com/engineering/managed-agents)
- [Claude Managed Agents Overview - Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/overview)
- [Quickstart - Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [Cloud environment setup - Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/environments)
- [Tools - Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/tools)
- [Authenticate with vaults - Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/vaults)
- [エージェントプラットフォームに必要なセキュリティ対策まとめ - hi120ki blog](https://hi120ki.github.io/ja/blog/posts/20260223/)
- [@claudeai - Managed Agents announcement](https://x.com/claudeai/status/2041927687460024721)
