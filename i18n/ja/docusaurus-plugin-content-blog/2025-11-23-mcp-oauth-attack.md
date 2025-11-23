---
title: "MCPのOAuth Phishingへの悪用と対策"
description: "MCPのOAuth Phishingへの悪用と対策"
authors: [hi120ki]
tags: [AI, Security, MCP, OAuth]
slug: posts/20251123
image: /img/2025-11-23/ogp.png
---

# MCPのOAuth Phishingへの悪用と対策

MCPというAI/LLMの拡張機能は現在のAI Agentの基礎となっています。しかし一方でAI/LLMという新しい技術背景を元に複数の攻撃ベクターが存在することが指摘されています。その中で最も有名なのはMCP Tool Poisoningにより有害な処理をAI Agentに実行させる攻撃です。これはAI/LLMの非決定的な動作とコンテキストという新しい概念を元に発見された攻撃手法です。

このような新しい攻撃手法が登場する一方で、古くから存在する既知の攻撃ベクターが安全ではないMCPの仕様によって露呈しています。

<!-- truncate -->

## MCPのOAuth仕様の普及

MCPに様々なサービスへの限定されたアクセスや権限を付与するために利用されるのがOAuthです。利用者がMCP接続を設定し利用を開始すると自動的にブラウザが開き、OAuthの認可フローが開始されアカウントを認証、合意画面が表示され最終的にアクセストークンがMCPクライアントに提供されます。

OAuthの認可フローにおいては多くの場合、OAuthクライアントの登録は面倒なステップです。例えばGoogle CloudにおいてはGoogle WorkspaceなどGoogleアカウントエコシステムへの認可を提供するOAuthクライアントの登録ができます。一方で登録のためにはBrandingとして会社名やドメイン・プライバシポリシーや利用規約へのリンクそして連絡先情報を提出する必要があります。これはOAuthクライアントの管理者は最終的にユーザーのアクセストークンを受け取りそれを使ってユーザーの保護されたリソースにスコープ内であれば無制限にアクセスできるという大きな権限を持つことになることから厳しい審査が要求されています。

しかしMCPの認可プロセスの中でOAuthクライアントの登録というステップが一見すると省かれているように見えます。MCPの利用者はMCPサーバーへのリンクを設定ファイルに記述するのみでOAuth認可フローを開始しています。

この背景にあるのは認証なしのDCR(Dynamic Client Registration)です。これはMCP仕様に定義されている[RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)を利用する認可仕様の一つで準拠することが推奨されています。一般的にDCRは`/register` などのHTTPサーバーに対して以下のようなフィールドを持つjsonのPOSTリクエストによって実現します。

```json
{
  "redirect_uris": [
    "https://client.example.org/callback",
    "https://client.example.org/callback2"
  ],
  "client_name": "My Example Client",
  "client_name#ja-Jpan-JP": "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u540D",
  "token_endpoint_auth_method": "client_secret_basic",
  "logo_uri": "https://client.example.org/logo.png",
  "jwks_uri": "https://client.example.org/my_public_keys.jwks",
  "example_extension_parameter": "example_value"
}
```

このリクエストに対して以下のようなレスポンスが提供され、OAuthクライアントの登録が完了します。

```json
{
  "client_id": "s6BhdRkqt3",
  "client_secret": "cf136dc3c1fc93f31185e5885805d",
  "client_id_issued_at": 2893256800,
  "client_secret_expires_at": 2893276800,
  "redirect_uris": [
    "https://client.example.org/callback",
    "https://client.example.org/callback2"
  ],
  "grant_types": ["authorization_code", "refresh_token"],
  "client_name": "My Example Client",
  "client_name#ja-Jpan-JP": "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u540D",
  "token_endpoint_auth_method": "client_secret_basic",
  "logo_uri": "https://client.example.org/logo.png",
  "jwks_uri": "https://client.example.org/my_public_keys.jwks",
  "example_extension_parameter": "example_value"
}
```

これによりMCPの利用者は利用環境ごとに設定されたOAuthクライアントを自由に登録ができます。一方で先程指摘した通りOAuthクライアントの管理者は最終的にユーザーのアクセストークンを受け取りそれを使ってユーザーの保護されたリソースにスコープ内であれば無制限にアクセスできるという大きな権限を持つことから一般には登録は審査などが要求されます。

MCPにおける認証なしDCRはAtlassianやNotionなどの複数の著名なサービスにおいて提供されており、さらにこの方式をサポートするサービスは増加していっていますが、審査のない認証なしOAuthクライアント登録はどのような攻撃を助長するのでしょうか。

## 認証なしDCRとOAuth Phishing

認証なしDCRにおける最も重要度が高い攻撃はOAuth Phishingです。

基本的にPhishing攻撃は、攻撃者が用意した本物のサービスにそっくりに作成された偽サイトにユーザーを誘導しそこで入力されたユーザー名・パスワードを盗むことでアカウント内のリソースの盗難・悪用を行うもので、様々な情報流出や金銭的被害を及ぼしています。

このPhishing攻撃は進化を続けており、アカウントの認証強化のために導入されたOne Time Passwordを同期的に攻撃者が正規サイトで利用することで、対策を回避する新しい形のPhishingサイトなどが登場しています。

このPhishing攻撃において最も新しい攻撃手法の一つがOAuth PhishingやConsent Phishingと呼ばれるOAuthの認可フローを用いるものです。攻撃者は攻撃の対象となるプラットフォームに自分のOAuthアプリを登録します。そしてユーザーにフィッシングメールや偽の招待や連携などを送り、「ログインして承認してください」と誘導します。ここで誘導されるURLは `https://auth.example.com/authorize?…` といったサービスの正規のドメインとなります。ここでユーザーがログインし承認ボタンをクリックするのみで攻撃者は発行されたアクセストークンを使い、個人情報を含む保護リソース・決済の権限などにアクセスできるようになります。このOAuth Phishing攻撃において特徴的なのは

1. **攻撃は正規のドメインを起点に発生する** - ドメインを検査することによる対策は不可
2. **パスキーはユーザーを保護できない** - 正規のドメインの正規のログインフローが行われるためPhishing対策として最も強力かつ推奨されるパスキーがあっても攻撃が成立
3. **PKCEの強制化は無意味** - 認可サーバーの管理者としてPKCEを強制化しても攻撃者のサーバー側でCode Challenge/Veriferの固定などの基本的な回避策により、対策は不可

ということで根本的な対策が認可サーバー提供側・利用者のどちらからも不可能であることです。

さらに、この攻撃パターンにおいてMCPの認証なしDCRは攻撃者により多くの悪用の機会を渡すことにつながります。会社名やドメインや連絡先情報を提出することなく自由にOAuthクライアントを登録できることは、このような悪用されたOAuthクライアントの登録者の特定を困難にし、あるOAuth Phishingのために登録されたOAuthクライアントが運営者によって無効化されても、代わりのOAuthクライアントの登録が非常に容易にできることを意味します。

## 軽減策

パスキーなどの既存のPhishing耐性のある認証方式を回避し利用者およびサービス運営者に大きな影響を及ぼすOAuth Phishingが、MCPのために認証なしDCRを提供することによりリスクが上がることを指摘しましたが、これを低減する方法として以下のような手法が考えられます。

### 認可サーバー運用者における軽減策

**MCPでの利用であることを警告する同意画面**

基本的に認証なしDCRは一般的に用いられるものではなく、多くのサービスにおいてMCPのために特別に提供している場合がほとんどです。この場合同意画面においてMCPの利用であることを強調し、MCP以外でのOAuth Phishingなどの悪用の可能性をユーザーに通知することが求められます。

**認証なしDCRで登録されたOAuthクライアントのスコープ制限**

認可サーバーにおいて認証なしDCRで登録されたOAuthクライアントについてはスコープを事前に設定した許可リスト内のみ利用できるように制限することが、被害範囲を減らすことにつながります。特に重要度が高い個人情報の閲覧権限やパスワードの変更や送金権限などの影響が大きいかつMCPで利用しない権限については指定できなくすることが推奨されます。

**OAuthクライアントのCallback URLの継続的な監視と拒否リスト運用**

基本的多くの場合、MCPのOAuth認可フローで用いられるCallback URLはlocalhostや127.0.0.1などの自分自身を指すものです。これが独立したサーバーでホストされるURLであった場合、そのOAuthクライアントは特殊な使い方をされている可能性があります。これを継続して監視しOAuth Phishingのために利用されている場合はそのOAuthクライアントの無効化と同じURLを再度OAuthクライアントのCallback URLとして登録されないため拒否リストとして管理運用することが推奨されます。

**登録およびアクセストークンによるAPI呼び出しのレート制限と監視**

また同一IPアドレスからの大量な登録であったり、アクセストークンの短時間での大量のAPI呼び出しなど悪用が疑われる利用について監視と基本的なレート制限運用を行うことも推奨されます。

### サービス利用者における対策

**同意画面における情報の確認**

同意画面においてアプリ名やCallback先情報を確認し、不審なOAuthクライアント経由の認可を行いようにします。

## Client ID Metadata Documentsへの移行

現在MCPのドラフト仕様では [OAuth Client ID Metadata Document](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00) をベースとしたOAuthクライアント登録方式への移行が提案されマージ済みとなっています。 これはDCRのように動的にOAuthクライアントを登録するのではなく、あらかじめOAuthクライアントのメタデータをホストするドキュメントを用意し、そのURLをMCPサーバーに保持し提供することでOAuthクライアントの登録を行う方式です。

![OAuth Client ID Metadata Document](/img/2025-11-23/cimd.png)

これは完全なOAuth Phishingへの対策にはなりませんが、自身の身元の証明としてClient ID Metadata Documentをホストするステップが追加されることにより、誰でも匿名で簡単にOAuthクライアントを登録できる状態からドメイン所有権と信頼性に依存する状態へと攻撃の難易度を上げるもので、認可サーバーの運営者としては悪意のあるClient ID Metadata Documentをホストしているドメインの許可/拒否リストを運用することで対策ができるようになります。

この新しいClient ID Metadata DocumentsについてはOAuthクライアント登録においてもっとも推奨される方式として策定される予定です。(DCRは推奨から任意へと変更されます)

この方式にはOAuth Phisingだけでなく認可サーバーにおけるOAuthクライアントの肥大・複雑な監視体制の構築などの課題を軽減/解決するもので、MCPサーバー提供者およびMCPクライアントで素早い移行が求められます。実際に[typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk/issues/1052)では対応が進んでおり、MCPサーバー提供側でも対応の開始が求められます。

## 最後に

MCPの認可仕様における認証なしDCRが現在被害が拡大しているOAuth Phishingの新しい起点となることを指摘し現時点での軽減策・最新のドラフト仕様における軽減効果について紹介しました。

MCPに限らず既存のOAuthのエコシステムの中でOAuth Phishingの立ち位置については対策のアップデートが進んでいます。紹介したベストプラクティスから、被害を減らす助けになれば幸いです。

## References

- [Authorization - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)
- [MCP Tools: Attack Vectors and Defense Recommendations for Autonomous Agents](https://www.elastic.co/security-labs/mcp-tools-attack-defense-recommendations)
- [Submit for brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Protect against consent phishing](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/protect-against-consent-phishing)
- [Evolving OAuth Client Registration in the Model Context Protocol](https://blog.modelcontextprotocol.io/posts/client_registration/)
- [Building MCP with OAuth Client ID Metadata (CIMD)](https://stytch.com/blog/oauth-client-id-metadata-mcp/)
- [SEP-991: Enable URL-based Client Registration using OAuth Client ID Metadata Documents](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/991)
- [Client Registration Approaches](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/draft/basic/authorization.mdx#client-registration-approaches)
