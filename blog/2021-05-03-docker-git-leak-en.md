---
title: "Sensitive information is leaked from .git folder that remains in public Docker image"
description: "Sensitive information is leaked from .git folder that remains in public Docker image"
authors: [hi120ki]
tags: [Docker, Git, Security]
slug: posts/20210503
---

Japanese article is [here](./2021-05-02-docker-git-leak-ja.md).

## Summary

There is a risk of leaking sensitive information from the .git folder that remains in a Docker image if the following conditions are met

<!-- truncate -->

- You have committed sensitive information in the past but have not deleted it.
- The .git folder and Dockerfile are in the same hierarchical directory.
- You have moved files by specifying the current directory in the Dockerfile with COPY or ADD commands (e.g. `COPY . /app`)
- Uploading the Docker image to a place where anyone can download it

As a countermeasure that can be done without changing the Dockerfile

- Specify the .git folder in the `.dockerignore` file

## WaniCTF'21-spring "Git Master"

On April 30 - May 2, Wani Hackase, a CTF circle at Osaka University, held a CTF competition for beginners [WaniCTF'21-spring](https://wanictf.org/), where I presented a challenge on this theme, "Git Master".

The following Dockerfile and DockerHub links are given in this challenge.

> https://hub.docker.com/r/wanictf21spring/nginx_on_ubuntu
>
> I want to develop a website together, so I'm going to release an image.
>
> I committed a secret string once, but it's okay... right?
>
> Writer : okmt, hi120ki

```dockerfile
FROM ubuntu:20.04

LABEL maintainer="wanictf21spring@gmail.com"

RUN apt update \
 && apt install -y nginx

EXPOSE 80

COPY . /var/www

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
```

The solution is to extract the FLAGs from the .git folder under the `/var/www` directory of the corresponding image, which contains html files and so on.([Questioner writeup](https://github.com/wani-hackase/wanictf21spring-writeup/tree/main/mis/git_master))

## Why the .git folder is still in the Docker image

The first reason why the .git folder was left in the Docker image is because the directory structure of this project is

```text
.
├── .git/
├── Dockerfile
├── docker-compose.yml
└── html/
```

The .git folder and the Dockerfile are in the same directory. And, run `COPY . /var/www`.

The `COPY . /var/www`, where `.` points to the current directory, and the files and folders in that hierarchy will be included in the Docker image. The `.` in `COPY . /var/www` refers to the current directory, so the .git folder will be copied into the Docker image in addition to the files you originally wanted to move.

## Sensitive information leakage scenario

The .git folder and the Dockerfile are in the same directory, and the `COPY` command with the current directory will keep the .git folder in the Docker image. Therefore, the scenarios of Sensitive information leakage are

1. you committed sensitive information in the past, but did not delete it.
2. the .git folder and the Dockerfile are in the same hierarchical directory
3. you have moved files to the current directory by specifying the current directory with COPY or ADD command in Dockerfile (e.g. `COPY . /app`)
4. upload the Docker image to a place where anyone can download it.

If you have uploaded the Docker image of the corresponding project to a place where anyone can download it, such as public repositoriy on DockerHub, you might want to check it.

> If you are using multi stage build and the .git folder is not included in the public image, there are many possible situations. If the above conditions are met, it does not necessarily mean that the .git folder will remain in the Docker image.

## Countermeasures

There are several possible countermeasures, such as not publishing Docker images to public repositories, specifying only necessary files in the `COPY` command, etc. The most recommended method is to use `.dockerignore`.

As described in the [Docker official documentation](https://docs.docker.com/engine/reference/builder/#dockerignore-file), `.dockerignore` excludes the files and directories specified in this file from the context.

It is generally used to exclude `node_modules`, temporary files, and other files that are not dependent on build, but are too large to be included in the context, thus making build performance worse.

Thus, in the situation in challenge above, if the .git folder is specified in the `.dockerignore` file, it will not be copied.

```shell
$ cd project
$ ls -ah
.  ..  .git  Dockerfile  docker-compose.yml  html
$ echo ".git" >> .dockerignore
```

It also makes sense to exclude the .git folder from the context for better performance during build, so why not do it?

## Finally

I am happy as a questioner because it seems that the question is good and interesting. I find it fun to solve the CTF problem, which deals with the fact that there is actually a dangerous process in a place that I do not notice unexpectedly, so I hope to continue to create such a problem in the future.
