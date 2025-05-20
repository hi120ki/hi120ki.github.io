---
title: "My Internship experience in Mercari"
description: "My Internship experience in Mercari"
authors: [hi120ki]
tags: [Internship]
slug: posts/20221123
---

I had an internship at Mercari's security team for a month and a half from August 16th to September 30th.

Mercari provides re-use market and mobile payment service for consumers, in Japan and the United States. Mercari is famous for the company does NOT require japanese skills. (If you want to know the company for English speakers in Japan, browse [https://japan-dev.com/jobs](https://japan-dev.com/jobs) and set JAPANESE LEVEL : Not Required, etc.)

<!-- truncate -->

![Mercari office in the first day](/img/hugo/mercari-day1-tower.jpg)

> Mercari office in the first day

I wrote an article [Restructuring the Kubernetes Threat Matrix and Evaluating Attack Detection by Falco](https://engineering.mercari.com/en/blog/entry/20220928-kubernetes-threat-matrix-and-attack-detection-by-falco/) as a task I had done in Mercari, so In this article, I write how did I spend and how I feel and think about Mercari.

## Apply, Interview, Onboarding

From February to March, I started to look at the [magic spreadsheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vSDSvWQNtJMW5IUsLF6FP12PNt8nSqaqw554UiNnUEYAZlWSp7PU509-M2IJ96D72gpCJznDvyied57/pubhtml) that gathers information on summer IT engineering internships in Japan. At this point, many companies had not yet released their internship information, so I looked at last year's spreadsheet to see which companies were open internship positions and picked out the ones that looked interesting.

I was interested in Mercari, and I found [Mercari's Approach to Modern Day Threats #1](https://mercari.connpass.com/event/241718/), an event to introduce the activities and work of the security team, and attended it. After that, I had a information session and interview, then I got a job in the [Mercari Summer Internship 2022](https://mercan.mercari.com/en/articles/33572/) as a Security Engineer.

After successfully passing the interview, I received an offer letter with a set salary (hourly rate) for each individual. At this point, I was still the first company to pass the interview, but I signed the offer letter because I thought it sounded like a very interesting environment based on the information session and discussions during the interview.

A few weeks before the start of the internship, I had a meeting with the team mermbers to coordinate the tasks I would actually work on and share my work style. Since I live in the Kansai region, I requested to come to the office during the entire internship period, and with the manager's permission, a weekly apartment was arranged for me. (The weekly apartment and coming to the office during the internship period depends on how the team members are working and the manager's decision, so it seems that not all of them are provided.)

![Weekly apartment](/img/hugo/mercari-room.jpg)

The weekly apartment I was assigned was a beautiful and brand-new in front of [Kiyosumi-Shirakawa station](https://goo.gl/maps/rayA7F3eQspsuyx4A) (furnished, with internet access and Wi-Fi, auto-locking, separate bathroom and toilet, 24-hour garbage disposal), and I took the [Oedo line for 30~40 minutes](https://goo.gl/maps/CMqPGJF4ASn47zBp6) to work everyday. It was quite an easy commute as I only took the Oedo line, no transfers, and could take a seat at most of the stations along the way in the train.

## How I work

I basically came to work in an office. The [office concept](https://careers.mercari.com/jp/location/) is basically this environment with Okamura office chairs and 4K or better monitors. Seating is free and we can go to an area with an electric elevating desk or an area with sofas and stylish chairs while working with a moderate change of pace.

![Office in the morning](/img/hugo/mercari-office.jpg)

> Office in the morning (Reprinted from [an official Mercari Linkedin post](https://www.linkedin.com/feed/update/urn:li:activity:6973855612199714816?updateEntityUrn=urn%3Ali%3Afs_feedUpdate%3A%28V2%2Curn%3Ali%3Aactivity%3A6973855612199714816%29))

Mercari has a system called [YOUR CHOICE](https://about.mercari.com/en/press/news/articles/20210901_yourchoice/), which allows people to freely choose how we work. I heard that some teams have all members working fully-remote, but as for the current security team, there are relatively many members who come to work, and we also tried to communicate offline so that I can adjust to their new environment immediately.

![Members of the security team](/img/hugo/mercari-team.jpg)

> Members of the security team (Reprinted from [an official Mercari Linkedin post](https://www.linkedin.com/posts/mercari-inc-_yourchoice-mercariyourchoice-remotework-activity-6983612244110577664-BRVt))

There are many advantages to working offline when I was still getting used to the environment, and I was able to get a feel for the atmosphere by going to lunch with team members and chatting with them. I was also able to see how other members were working and get a feel for the company as a whole.

In terms of the computer environment, we were provided with a fairly new MacBookPro, the company environment and software for engineers to use were procured at a lot of costs, and we were issued a GCP account that we could freely use for verification purposes, so the environment for engineers to work comfortably was well maintained.

## Meals

My motto for work style is to "enjoy working with good food, a comfortable computer environment, and pleasant colleagues," so I would go along to lunch whenever I was invited. Although Mercari does not have a company cafeteria, it has a system that provides lunch money for onboarding, interaction with interns, and team building, so I had lunch out of the office several times a week. The Mercari office is located in [Roppongi Hills](https://goo.gl/maps/b83cJKz6xDJhFz2P8), and there are many nice restaurants in the area, so I never got tired of going to different places.

![Lunch in the first day](/img/hugo/mercari-day1-lunch.jpg)

> Lunch in the first day @[37 Steakhouse roppongi](https://37steakhouse.com/roppongi)

During my internship, I also attended [Mercari Security & Privacy Office Meetup@Roppongi Office](https://mercan.mercari.com/articles/35082/), an event open to the public, as well as several other in-house events where we were treated to catered meals. It was the first time I had ever had such a delicious catered meal, and it was very nice.

![catered meal in the event](/img/hugo/mercari-bentoo.jpg)

> catered meal in the event

And within Mercari, there is a club activity system that provides support for activities with a certain number of members, and I temporarily joined the ice cream club and ate fashionable ice cream.

![ice cream in the high grade chocolate shop in Roppongi Hills](/img/hugo/mercari-ice.jpg)

> ice cream in the high grade chocolate shop in Roppongi Hills

Of course, it was great that the food was delicious, but more than that, the best part was getting to know the members while eating together. Communication can be difficult when you have just jumped into a new place, but through the meal, I was able to talk with members who are usually helpful to me, members who are affected by the results of my tasks, and members with whom I have no contact at all, making it a very enjoyable onboarding and internship experience.

![Meals I ate](/img/hugo/mercari-meshi.jpg)

> Meals I ate (this is not all of them...)

## How I feel and think about Mercari

I felt that Mercari is an "environment where engineers can work freely," with a comfortable office, a free atmosphere, and a commitment to encouraging growth and open communication with each other.

On the last day of the internship, there was a presentation of the results of the interns, and they all achieved overwhelming results, not only because of their individual performance, but also because of the support they received and the environment in which they worked. I was also able to give my best performance while acquiring new knowledge and skills under the guidance of my mentor [@rung](https://twitter.com/rung)-san.

Also, when working in the security field, security-related work tends to be kept secret and it is difficult to disclose information to the outside world. However, Mercari's security team is willing to disclose information that can be made public, and the culture of proactively contributing to the outside world, such as by contributing to the OSS Kubernetes security tool Falco, is deeply rooted in the company. This is an environment that encourages the growth of security engineers.

## Final words

It was a great opportunity for me to challenge one of the ways of working as a security engineer in the 1.5 months, and I enjoyed working with good food, comfortable computer environment, and pleasant colleagues.

Thank you very much to everyone who helped me.

![Mercari office in the final day](/img/hugo/mercari-last-tower.jpg)

> Mercari office in the final day
