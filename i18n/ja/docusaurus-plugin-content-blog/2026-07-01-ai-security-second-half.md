---
title: 2026年後半のAI Securityでやるべきこと
description: 2026年後半のAI Securityでやるべきこと
authors: [hi120ki]
tags: [AI, Security, LLM, Agent, MCP, OAuth]
slug: posts/20260701
image: /img/2026-07-01/ogp.png
---

# 2026年後半のAI Securityでやるべきこと

年初に[2026年のAI Securityの挑戦](https://hi120ki.github.io/ja/blog/posts/20260103/)という記事で、この1年に業界全体で向き合うことになるであろう課題を整理しました。あれから半年が経ち、当時は「今後の技術成熟を待つ必要がある」と書いた論点の多くが、すでに手を動かせる段階に入っています。Okta Cross-App Accessは本番導入できるサービスになり、Anthropicも採用しました。エージェント用のSandboxは共通化が進み、フロンティアモデルはアプリケーションセキュリティ領域で人間を超え始めています。2026年後半に入るこのタイミングでAI Security業界の最新状況を取りまとめ、エージェントを推進しているであろう一般的な組織においてAI Securityに関わる方が、次の半年でどこから手をつけるべきかを整理します。

<!-- truncate -->

[**→ English version**](https://hi120ki.github.io/blog/posts/20260701/)

## 2026年前半を振り返って

2026年前半で最も大きな変化は、AIエージェント・プラットフォームのエコシステムが一気に成熟したことです。年初はまだ実験的だった要素が、クラウド移行期に各社がベストプラクティスを揃えていったのと同じように、整備フェーズへと入ってきたと感じています。([Agent Platformに必要なセキュリティ対策まとめ](https://hi120ki.github.io/ja/blog/posts/20260223/))

象徴的なのが、Claude Enterpriseが[Okta Cross-App Accessをサポート](https://claude.com/blog/enterprise-managed-auth)したこと、そして[エージェント用Sandbox](https://claude.com/blog/claude-managed-agents)が一般的なインフラになったことです。

またこの半年は、AIエージェントの構成要素が「入力・出力・ツール・システムプロンプト」の4つに収束し、各社の実装が驚くほど似てきた点も特徴的でした。実装が共通化するということは、セキュリティ対策も共通化できるということです。だからこそ後半は、個別対応から共通基盤への投資へと軸足を移すのに良いタイミングだと考えています。

以下では、次の半年で優先度が高いと考える項目を、それぞれ独立したセクションでまとめます。

## Okta Cross-App Accessの本格導入とアクセスログの管理・監視

2026年後半で最優先に取り組むべきなのが、[Okta Cross App Access(XAA)](https://www.okta.com/solutions/cross-app-access/)の本格導入です。年初の記事でも「大いに期待できる」と紹介しましたが、この半年で構想段階から、本番利用可能なサービスへと一気に進みました。

XAAはOAuthを拡張し、MCPの公式な認可拡張（Enterprise Managed Auth）としても組み込まれている、ベンダー中立のオープンプロトコルです（[Okta introduces Cross App Access](https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access-to-help-secure-ai-agents-in-the/)）。従業員のIdentity管理に広く使われているOktaが各サービスへの認可を仲介し、AIエージェントがOktaのトークンと各サービスのアクセストークンを交換することで、サービスごとにOAuth認可フローを踏まずに済むようになります。2026年6月にはエコシステムが拡大し、Cloudflare、WorkOS、Stytch、Keycloakなど25以上の統合が発表されました（[Okta advances the industry standard for secure AI agent connections](https://www.okta.com/newsroom/press-releases/okta-announces-cross-app-access-partners/)）。

そして注目すべきは、Anthropicがこれを採用したことです。OktaはClaude向けのfeatured identity providerとなり、Asana、Atlassian、Canva、Figma、Granola、Linear、Supabaseといった参加MCPプロバイダーへのアクセスを、Oktaで一元管理できるようになりました（[Okta becomes a featured identity provider powering secure AI agent connections for Claude](https://www.okta.com/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/)）。AnthropicがMCPコネクタのenterprise-managed authorizationを提供開始し、IT管理者がOkta経由で組織全体のMCP連携をプロビジョニングすると、従業員はClaudeを初めて開いた時点で自動的にアクセスが付与される仕組みになりました（[Enterprise-Managed Authorization: Zero-touch OAuth for MCP](https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/)）。ユーザーごとの同意画面が不要という、まさに年初に期待していた世界が実現しています。

導入にあたって忘れてはいけないのが、ログの管理と監視です。XAAは、すべての接続が中央のIdentityポリシーを経由し、すべてのアクションがログに残ることを前提に設計されています。導入して満足するのではなく、このログを収集・監視し、どのエージェントがどのサービスにアクセスしたかを追える体制まで作って初めて意味があります。まずはXAAへの移行を進めつつ、ログの収集・監視の運用も並行して整えていくのが、後半の第一歩です。

## エージェントアイデンティティモデルの確立とスケーラブルな展開

第二の優先課題は、エージェントアイデンティティ（Agent Identity）モデルの確立です。XAAが個別サービスへの認可を解決する一方でそもそも「AIエージェントとは誰なのか」を組織としてどう定義し、どう管理するかというより根本的な設計が必要になっています。

2026年の企業環境では、Machine Identityは人間の100倍近い規模で存在すると言われ、その多くがAIエージェントに紐づくものへと変わりつつあります（[Non-Human Identity Is the New Security Perimeter in 2026](https://nhimg.org/nhi-101/non-human-identity-security-perimeter-2026)）。ただしAIエージェントは従来のサービスアカウントやAPIキーのような静的でスコープの狭いNHIとは性質が異なります。自律的に推論し、権限を委譲し、複数のドメインをまたいで動く動的な存在であるため、従来のNHI管理の延長線では捉えきれません（[A New Identity Playbook for AI Agents in 2026](https://www.strata.io/blog/agentic-identity/new-identity-playbook-ai-agents-not-nhi-8b/)）。

ここで守るべき原則はシンプルで、エージェントのアイデンティティは必ず特定の人間まで辿れることです。権限はタスクに紐づいた短命なトークンとして付与し、タスク完了後に失効させること・あるいは非保持化のためにMITM Proxyを整備し、HTTPヘッダーをエージェントがアクセスできない範囲で付与することです。CSAも[Non-Human Identityとエージェント型AIのガバナンスに関するホワイトペーパー](https://labs.cloudsecurityalliance.org/research/csa-whitepaper-nonhuman-identity-agentic-ai-governance-v1-cs/)を公開しており、この領域のガバナンスの空白が業界共通の課題として認識され始めています（[What identity means in the age of agentic AI](https://www.ibm.com/think/news/think-2026-identity-recap)）。

この取り組みでは、確立したモデルをドキュメント化して発信するだけでなく、再利用可能な形にして隅々まで展開することが特に重要です。

## OAuthの限界への対処 — テナント分離とMachine Identityへの移行

エージェントにConfused Deputy Problemを避けて適切に権限を委譲するため、OAuthを用いる流れが定着しました。しかし、ここには構造的な限界があります。現状のOAuthスコープではリソースのアクセス境界を厳密に定義しにくく、エージェントが本来触れるべきでない情報にアクセスできてしまうリスクが残ります。実際、過剰なスコープを持つトークンは、権限昇格やデータ漏洩の確率を押し上げるという分析もあります（[Authorization infrastructure for AI agents needs finer-grained controls](https://nhimg.org/articles/authorization-infrastructure-for-ai-agents-needs-finer-grained-controls/)）。

OAuthプロトコル側の更新によってスコープやリソース制御は改善に向かっていますが、それが各サービスに行き渡るまでには時間がかかります。そこで当面の回避策として有効なのが、機密情報のテナント分離です。本当に守るべきデータは別テナント・別サービスに切り出し、OAuthのスコープやリソースから物理的に到達できないよう、強制的にアクセスを遮断します。

もう一つの方向性として、Machine Identityを活用したアクセス管理へのパラダイムシフトが来ることも考えられます。誰が・何に対して・どのアクションを・どのコンテキストで実行できるのかを、許可ベースでより細かく表現できる世界です。ただしMachine Identityで機械アクセスを許す場合には、ユーザーが元からアクセスできる範囲内であることの検証と、実際に誰が実行したのかを監査ログで必ず追跡できる仕組みがセットで必要になります。

## ツールベースの権限制限 — MCP設定だけでは不十分

MCPが普及して見えてきたのは、「設定ファイルで接続先を絞るだけでは、権限制限として不十分」という現実です。MCPは認証は扱うものの、ツール単位の認可を行う仕組みを持っていません。そのためこの層は、ゲートウェイやMCPクライアントの個別設定など、MCPの外側で強制する必要があります（[MCP Permissions: Securing AI Agent Access to Tools](https://www.cerbos.dev/blog/mcp-permissions-securing-ai-agent-access-to-tools)）。

さらに、MCPに接続されたAIエージェントの多くは、起動したユーザーと同じ権限で動きます。初期設定のままだとMCP経由で読み込みだけでなく書き込み操作までエージェントに委任してしまいがちです。その結果、チケットを読んでCRMを更新するだけでよいはずのサポートエージェントが、ファイルシステムへの書き込み、ネットワークegress、コード実行、DB管理者権限まで持ってしまう、といった事態が起きています（[MCP RBAC: Tool-Level Permissions for Production AI Agents](https://www.getmaxim.ai/articles/mcp-rbac-tool-level-permissions-for-production-ai-agents/)）。

対策は、エージェントやMCPクライアント側でツールを適切に有効化・無効化し、最小権限の原則を徹底することです。MCP RBACのようにツール単位で制御すれば、AWSの[MCPを使ったAIエージェントの安全なアクセスパターン](https://aws.amazon.com/blogs/security/secure-ai-agent-access-patterns-to-aws-resources-using-model-context-protocol/)と同様のコントロールが実現できます。MCPの設定だけで安心せず、ツールレベルの最小権限を設計し、特に変更操作では対象リソースの回復可能性と、その回復プロセスの確立まで含めて検討が必要です。

## Agent Sandboxのセキュリティ強化と標準化

年初の記事で「今後重要になる」と書いたAgent Sandboxは、この半年で選定・導入の実務フェーズに入りました。Codingだけでなくブラウザ自動化やPC操作まで任せるようになると、それらを安全に隔離して動かすSandboxの品質が、そのままセキュリティ品質になります。

隔離技術としては、Firecrackerに代表されるmicroVM（規制対象データにも耐える最も強い隔離）、gVisorのようなsyscallレベルのユーザー空間カーネル、軽量なV8 Isolatesの3つが、2026年の主流として定着しました（[How to sandbox AI agents in 2026: MicroVMs, gVisor & isolation strategies](https://northflank.com/blog/how-to-sandbox-ai-agents)）。重要なのは、通常のコンテナはエージェント型ワークロードの隔離境界として不十分だという共通認識ができたことです。OWASP、NVIDIA、Microsoftがいずれも、カーネルレベルのプロセス隔離、ネットワークegressのallowlist、設定ファイルへの書き込み保護、タスクごとのシークレット供給、もしくはMITM ProxyによるクレデンシャルのHTTPヘッダーインジェクションといった、同じコントロールへ収束しつつあります（[Best Code Execution Sandboxes for AI Agents in 2026](https://modal.com/resources/best-code-execution-sandboxes-ai-agents)）。

今年後半に向けては、標準化されたコントロールを自組織のSandboxに落とし込み、テンプレート化して横展開するのが良いと考えています。E2BやDaytonaのような専用サービスはすでに広く使われており、必ずしもすべてを自前で作る必要はありません。隔離・リソース制限・ネットワーク制御・権限スコープ・監視を多層で組み合わせる多層防御を前提に、「どのエージェントもこのSandboxの上で様々な処理を行う」という一貫した標準を敷くことが必要です。

## 監査ログと危険行動アラートの構築

エージェントに権限を渡し、Sandboxで動かす体制が整ったら次は「何をしたか」を追える監査ログと、危険な挙動を検知するアラート機構が必要になります。

問題の核心は、特にOAuthを用いたエージェントが従業員と同じ権限で動くため、連携サービス上の監査ログ上では人間のユーザーと区別がつかない点です。その結果、侵害されたエージェントの操作が「所有者不在」の監査結果となり、責任所在が曖昧になる危険があります（[AI agent audit logging exposes the gap in identity governance](https://nhimg.org/articles/ai-agent-audit-logging-exposes-the-gap-in-identity-governance/)）。だからこそ、すべてのアクション・プロンプト・クエリ・レスポンスに対して、実行者への紐付けとトレーサビリティを備えた監査ログの記録が求められます。

さらに、監査ログを「取るだけ」で終わらせず、機密情報の外部送信や破壊的操作といった危険なアクションをリアルタイムに検知するアラートまで作り込む必要があるでしょう。ここで役立つのが、年初に触れた MitM プロキシ系OSSがこの半年で出揃ったことです。[Pipelock](https://github.com/luckyPipewrench/pipelock)はMCP・A2A・HTTP・WebSocketの通信を検査して exfiltration、SSRF、Prompt Injection をスキャンし、エージェントの外側から検証可能な「署名付きアクションレシート」を残せるOSSのエージェントファイアウォールです（[Pipelock: Open-source AI agent firewall](https://www.helpnetsecurity.com/2026/05/04/pipelock-open-source-ai-agent-firewall/)）。エージェントの外側に検査点を置き、危険な通信を止めつつ監査証跡を残すという組み合わせを整えておくと、インシデント対応の解像度が一段上がります。

## AI SBOMとRecoverability — エージェント運用の可視化と回復性

年初に「実験的に作られたエージェントやWorkloadが整理されないまま残るリスク」を書きましたが、後半はこれをAI SBOM（AIBOM）として体系化するタイミングです。AIBOMは、モデル・データセット・ツール・ガードレール・ランタイム要素といったAIシステムの構成要素を、来歴や完全性の証跡とともに機械可読な形で棚卸しするためのインベントリです。

EU AI ActのArticle 11およびAnnex IVの技術文書要件は2026年8月2日に高リスクAIシステムに対して発効し、AIBOMは避けて通れないものになりました（[What Is an AI-BOM (AI Bill of Materials)?](https://www.paloaltonetworks.com/cyberpedia/what-is-an-ai-bom)）。CISAは[Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements)を、OWASPは[AIBOMのスキーマ](https://owaspaibom.org/)を公開しており、標準化が進んでいます。

それでも、[組織のAI利用全体を可視化できているIT資産管理チームは31%程度という調査](https://info.flexera.com/ITAM-REPORT-State-of-IT-Asset-Management)もあります。まずは「どこで何のAIが動いているか」を把握するところから始める価値があります。CSPMやAgent Platformへの集約と合わせて、AIエージェントのインベントリ整備と監査体制の構築を並行して進めるのが推奨されます。

同時に意識したいのがRecoverability（回復可能性）です。リソースを頻繁に変更するエージェントに対しては、オペレーションが回復可能かどうかを事前に確認・整備するプロセスが重要になります。エージェントが誤った判断をしても元に戻せる設計になっているか、破壊的な操作の前にスナップショットやロールバック手段が用意されているか、といった点を明らかにします。自律性を高めるほどエージェントに任せられるタスクが増え、組織の生産性向上にも寄与できるでしょう。

## Shadow AI対策の継続とAIツール導入プロセスの成熟

Shadow AIへの対応は、年初からの継続課題です。ある調査では、利用中のAIツールの91%がセキュリティ／ITの管理外にあり、AIの導入がガバナンスを4:1のペースで上回っているとされています（[What is Shadow AI? Risks, Tools, and Best Practices for 2026](https://www.lasso.security/blog/what-is-shadow-ai)）。エンドポイント端末監視、ネットワークスキャン、OAuth連携のレビュー、申告調査を組み合わせ、組織内で実際に動いているAIを継続的に発見し、統合・可視化していくアプローチが現実的です（[Shadow AI and the Governance Gap](https://www.techloy.com/shadow-ai-and-the-governance-gap-the-quiet-tech-story-of-2026/)）。

また、AIツールを安全に試すためのプロセス化も重要です。新しいツールは毎月のように入れ替わるため、個別対応ではなく「安全に試すための基盤」と「試したものを評価して許可する定型プロセス」をセットで持つことが求められます。ここで見落としがちなのが、エンジニアと非エンジニアでリスク低減の効き方が異なる点です。エンジニアは一定の技術的リテラシーを期待できますが、非エンジニアが使うAI SaaSやAI機能付きの業務ツールでは、ガイドラインや利用範囲の設定、データの扱いの明示といった別のアプローチが必要になります。この差分を意識しつつ、両方をカバーできるプロセスへ育てていくことが課題となるでしょう。

## フロンティアモデルのサイバー能力向上への備え

最後に、後半に向けて頭に入れておくべき大きな変化が、フロンティアモデルのサイバーセキュリティ能力の急上昇です。AIモデルはソフトウェアの脆弱性を発見・悪用する能力において、人間を上回る水準に達しつつあります。

Anthropicは重要ソフトウェアをAI時代に向けて堅牢化する[Project Glasswing](https://www.anthropic.com/glasswing)を進めており、フロンティアモデルの自律的なサイバー能力がどれだけ速く伸びているかは[UK AI Security InstituteのFrontier AI Trends Report](https://www.aisi.gov.uk/frontier-ai-trends-report)にまとまっています。防御側の視点では、Palo Altoの[Defender's Guide to the Frontier AI Impact on Cybersecurity](https://www.paloaltonetworks.com/blog/2026/05/defenders-guide-frontier-ai-impact-cybersecurity-may-2026-update/)が現状の整理として参考になります。

ただしこれらのモデルが万能かというとそうではありません。ホワイトボックス検出でのFalse Positive率は依然として高いと言われています。しかし、この流れは「Security for AI」だけでなく「AI for Security」の存在感も一気に高めており、エージェントによる脆弱性診断のOSSやSaaSも出揃い、実運用に乗せるための下地が整いつつあります。だからこそ後半は、この能力を防御側としてどう取り込むかを試しつつ、自分たちが攻撃者よりも優位に立てる場面を意図的に作っていくのが良いと考えています。

## 最後に

年初に「今後の技術成熟を待つ必要がある」と書いた項目の多くが、この半年で、すでに手を動かせる段階へと変わりました。Cross App Accessの本格導入、エージェントアイデンティティモデルの確立、テナント分離とツールレベルの権限制限、Sandboxの標準化、監査ログとアラート、AI SBOMとRecoverability、Shadow AI対策の継続、そしてフロンティアモデルの能力向上への備えといった項目を、個別対応から共通基盤への投資へと軸足を移しながら進めていくフェーズだと思います。

AI Securityの取り組みは、基盤的で共通化しやすいものが多いからこそ、実施した内容をドキュメント化して発信しスケーラビリティを意識した展開をするとともに、CISベンチマークの達成率のような分かりやすい指標とあわせて、インパクトが見える形にしていくことも同じくらい重要だと感じています。

半年後にまたこの続きを書けるよう様々な取り組みを進めたいと思います。ここまで読んでいただき、ありがとうございました。
