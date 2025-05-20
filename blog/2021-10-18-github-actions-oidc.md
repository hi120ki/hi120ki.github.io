---
title: "GitHub ActionsでIAM Roleを使うときのOIDC issuer変更"
description: "GitHub ActionsでIAM Roleを使うときのOIDC issuer変更"
authors: [hi120ki]
tags: [AWS]
slug: posts/20211018
---

[AWS federation comes to GitHub Actions](https://awsteele.com/blog/2021/09/15/aws-federation-comes-to-github-actions.html)

[GitHub ActionsでAWSの永続的なクレデンシャルを渡すことなくIAM Roleが利用できるようになったようです](https://dev.classmethod.jp/articles/github-actions-without-permanent-credential/)

で紹介されている、GitHub Actionsでアクセスキーを使うことなくAWSのリソースを扱えるようになりましたが、GitHubのOIDC issuerが

<!-- truncate -->

```
https://vstoken.actions.githubusercontent.com
↓
https://token.actions.githubusercontent.com
```

に変更されており、以前のRole設定のままだと

```
Run aws sts get-caller-identity
  aws sts get-caller-identity
  shell: /usr/bin/bash -e {0}
  env:
    AWS_WEB_IDENTITY_TOKEN_FILE: /tmp/awscreds
    AWS_ROLE_ARN: arn:aws:iam::xxx:role/GithubActionsRole
    AWS_DEFAULT_REGION: ap-northeast-1
    AWS_REGION: ap-northeast-1

An error occurred (InvalidIdentityToken) when calling the AssumeRoleWithWebIdentity operation: No OpenIDConnect provider found in your account for https://token.actions.githubusercontent.com
Error: Process completed with exit code 254.
```

というエラーが出るようになっています。

こちらを回避するためにはAWSのRole設定時の`Condition`と`GithubOidc Properties Url`を`https://vstoken.actions.githubusercontent.com`から`https://token.actions.githubusercontent.com`へ変更する必要があります。

```yml
AWSTemplateFormatVersion: "2010-09-09T00:00:00+09:00"
description: "IAM Role for Github Actions"

Parameters:
  RepoName:
    Type: String
    Default: xxx/xxx

Resources:
  Role:
    Type: AWS::IAM::Role
    Properties:
      RoleName: GithubActionsRole
      AssumeRolePolicyDocument:
        Statement:
          - Effect: Allow
            Action: sts:AssumeRoleWithWebIdentity
            Principal:
              Federated: !Ref GithubOidc
            Condition:
              StringLike:
                token.actions.githubusercontent.com:sub: !Sub repo:${RepoName}:*

  Policy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: GithubActionsPolicy
      Roles:
        - !Ref Role
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action: "sts:GetCallerIdentity"
            Resource: "*"

  GithubOidc:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://token.actions.githubusercontent.com
      ClientIdList: [sigstore]
      ThumbprintList: [a031c46782e6e6c662c2c87c76da9aa62ccabd8e]

Outputs:
  Role:
    Value: !GetAtt Role.Arn
```

このように変更することで実行されるようになります。

## 参考

[https://twitter.com/toricls/status/1445990439060836355?s=20](https://twitter.com/toricls/status/1445990439060836355?s=20)
