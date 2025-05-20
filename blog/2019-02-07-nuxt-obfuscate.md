---
title: "Nuxt.js プロジェクトで JavaScript を難読化"
description: "Nuxt.js プロジェクトで JavaScript を難読化する"
authors: [hi120ki]
tags: [Web, Nuxt.js, webpack, Web Security]
slug: posts/20190207
---

JavaScript はそのままソースコードを読むことができ，簡単にコピーされたり，リバースエンジニアリングされてしまいます

コードを難読化することで完璧にとはいきませんが悪用を防ぐことができます

今回は Nuxt.js プロジェクトで JavaScript を難読化する設定を紹介します

<!-- truncate -->

注意：コードを難読化することでパフォーマンスが落ちたり，ウイルス対策ソフトがマルウェアではないかと検知することがあるので注意が必要です

## Nuxt.js プロジェクトを作成

[公式ドキュメント](https://ja.nuxtjs.org/guide/installation/)の通りに [Create Nuxt App](https://github.com/nuxt/create-nuxt-app) を使用します

```bash
npx create-nuxt-app <project-name>
```

もしくは

```bash
yarn create nuxt-app <my-project>
```

いろいろと質問があるのでそれを答えていくとプロジェクトが生成されます

## JavaScript を難読化する

webpack で [JavaScript obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) が使用できるプラグインの webpack-obfuscator をインストールし，設定を行います

```bash
yarn add -D webpack-obfuscator
```

を実行

そして nuxt.config.js を編集します

```javascript
const JavaScriptObfuscator = require("webpack-obfuscator");

module.exports = {
  build: {
    // webpack plugin の設定
    plugins: [
      // webpack-obfuscatorの設定
      new JavaScriptObfuscator({
        // JavaScript obfuscator のオプション
        stringArrayEncoding: true,
        stringArrayThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
      }),
    ],
  },
};
```

これで JavaScript が難読化されます

## 難読化のオプション

[JavaScript Obfuscator Options](https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options)

主要なオプションを紹介します

### rotateStringArray （Default: true）

コードに含まれる文字列をランダムに配列化し元のコードを復元しにくくします

### stringArrayEncoding （Default: false）

rotateStringArray で配列化された文字列をエンコードしてさらに復元を困難にします

- `true` : `base64` でエンコード
- `false` : エンコードしない
- `'base64'` : `base64` でエンコードする
- `'rc4'` : ストリーム暗号の rc4 でエンコードする（復元はより困難になるが，base64 よりも 30~50% ほどパフォーマンスが低下します）

### stringArrayThreshold （Default: 0.8）

コードに含まれる文字列の何割を rotateStringArray で処理するか指定する

`0`（0%）から `1`（100%）までで指定

### deadCodeInjection （Default: false）

処理には使用されないコードを追加してリバースエンジニアリングを困難にする

（コードが肥大化しパフォーマンスが低下します）

### deadCodeInjectionThreshold （Default: 0.4）

何割のノードで deadCodeInjection を行うか指定する

`0`（0%）から `1`（100%）までで指定

## 終わりに

[JavaScript Obfuscator Options](https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options) では他にも様々なオプションがありますので試してみて下さい

また，オンラインツールとしても提供されています

[JavaScript Obfuscator Tool](https://obfuscator.io/)
