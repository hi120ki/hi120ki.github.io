---
title: "AWS Lambda で Puppeteer を動かす"
description: "CTF の Web 問題で XSS を出題するときに必要となる Admin クローラーを AWS Lambda で動かします"
authors: [hi120ki]
tags: [Web, AWS]
slug: posts/20191211
---

## Codestar でプロジェクトを作成

[AWS Codestar](https://aws.amazon.com/jp/codestar/)

AWS Codestar は Git レポジトリをベースにウェブアプリケーションを開発・AWS へデプロイが可能なサービスです。

<!-- truncate -->

Web アプリケーション・Web サービス・Alexa スキル・静的ウェブサイトなどを EC2・BeansTalk・Lambda + API Gateway へ継続的にデプロイすることが可能です

今回は

- アプリケーションのカテゴリ : ウェブサービス
- プログラミング言語 : Node.js
- AWS サービス : AWS Lambda

から選択できる Express.js でプロジェクトを作成します

## コードを準備する

パッケージをインストールする

```bash
npm install
npm install puppeteer-lambda
```

- template.yml

```yml
---
Resources:
  puppeteerApi:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs8.10
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          NODE_ENV: production
          PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
          CUSTOM_CHROME: true
      Role:
        Fn::GetAtt:
          - LambdaExecutionRole
          - Arn
      Events:
        GetEvent:
          Type: Api
          Properties:
            Path: /
            Method: get
        PostEvent:
          Type: Api
          Properties:
            Path: /
            Method: post
        OptionsEvent:
          Type: Api
          Properties:
            Path: /
            Method: options
  LambdaExecutionRole:
```

- buildspec.yml

```yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 8
    commands:
      # Install dependencies needed for running tests
      - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true CUSTOM_CHROME=true npm install
      # Upgrade AWS CLI to the latest version
      - pip install --upgrade awscli
  build:
    commands:
      # Use AWS SAM to package the application using AWS CloudFormation
      - aws cloudformation package --template template.yml --s3-bucket $S3_BUCKET --output-template template-export.yml
      # Do not remove this statement. This command is required for AWS CodeStar projects.
      # Update the AWS Partition, AWS Region, account ID and project ID in the project ARN on template-configuration.json file so AWS CloudFormation can tag project resources.
      - sed -i.bak 's/\$PARTITION\$/'${PARTITION}'/g;s/\$AWS_REGION\$/'${AWS_REGION}'/g;s/\$ACCOUNT_ID\$/'${ACCOUNT_ID}'/g;s/\$PROJECT_ID\$/'${PROJECT_ID}'/g' template-configuration.json
artifacts:
  type: zip
  files:
    - template-export.yml
    - template-configuration.json
```

- app.js

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer-lambda");
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.options("*", function(req, res) {
  res.sendStatus(200);
});

app.get("/", function(req, res) {
  ...
});

app.post("/", function(req, res) {
  ...
  (async () => {
    const browser = await puppeteer.getBrowser({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitFor(1000);
    await browser.close();
  })();
});

// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app;
```

以上を変更したあとに git push すると自動的に CI が走り，デプロイされます
