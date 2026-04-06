import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header>
      <div className={styles.section}>
        <div className={styles.heroProfile}>
          <img
            src={require("@site/static/img/logo.png").default}
            alt="Hiroki Akamatsu Logo"
            className={styles.heroProfileLogo}
          />
          <div className={styles.heroProfileInfo}>
            <div className={styles.heroProfileName}>
              Hiroki Akamatsu - hi120ki
            </div>
            <div className={styles.heroProfileRole}>
              AI & Platform Security Engineer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function TimelineItem({
  date,
  title,
  details,
}: {
  date: string;
  title: string;
  details: (
    | string
    | { text: string; publications?: { title: string; url: string }[] }
  )[];
}) {
  return (
    <div className={styles.timelineItem}>
      <span className={styles.timelineDate}>{date}</span>
      <h3>{title}</h3>
      <ul>
        {details.map((detail, index) => {
          if (typeof detail === "string") {
            return <li key={index}>{detail}</li>;
          } else {
            return (
              <li key={index}>
                <div>{detail.text}</div>
                {detail.publications && detail.publications.length > 0 && (
                  <ul className={styles.publicationList}>
                    {detail.publications.map((publication, pubIndex) => (
                      <li key={pubIndex}>
                        <a
                          href={publication.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {publication.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <Section id="about" title="About Me">
          <p>
            I am an AI & Platform Security Engineer focused on AI system
            security, including hands-on experience designing secure LLM
            infrastructure, authoring agent platform security guidelines, and
            researching attack surfaces specific to AI environments. Cloud
            security work spans Google Cloud, AWS, and Kubernetes, with
            particular depth in credential lifecycle management and policy
            enforcement at scale. I have investigated and published on prompt
            injection, unsafe agent behavior, and OAuth phishing in MCP
            environments, and share findings through technical articles and
            talks at AI engineering events in Japan.
          </p>
        </Section>
        <Section id="experience" title="Professional Experience">
          <TimelineItem
            date="May 2025 - Present"
            title="Mercari, Inc. — AI Security Engineer, Tech Lead (AI Security Team)"
            details={[
              {
                text: "Established security architecture for a company-wide LiteLLM-based LLM API proxy. Designed and implemented an OIDC-based short-lived API key issuance system (LLM Key Server), eliminating static LLM API keys across the organization with integrations for GitHub Actions and Google Apps Script.",
                publications: [
                  {
                    title:
                      "LLM Key Server: Providing Secure and Convenient Access to Internal LLM APIs",
                    url: "https://engineering.mercari.com/en/blog/entry/20251202-llm-key-server/",
                  },
                ],
              },
              {
                text: "Led architecture of the company’s internal MCP gateway with forward compatibility for upcoming enterprise authorization specs. Independently researched and published analysis of OAuth phishing attacks via unauthenticated Dynamic Client Registration in MCP.",
                publications: [
                  {
                    title:
                      "MCP Authentication and Authorization: Current State and Future",
                    url: "https://hi120ki.github.io/blog/posts/20250728/",
                  },
                  {
                    title: "Weaponize the MCP — OAuth Phishing and Mitigations",
                    url: "https://hi120ki.github.io/blog/posts/20251123/",
                  },
                  {
                    title: "MCP Authentication and Authorization",
                    url: "https://speakerdeck.com/hi120ki/mcp-authorization",
                  },
                ],
              },
              {
                text: "Authored comprehensive security guidelines for cloud-hosted AI agent environments, covering areas such as sandboxing, network controls, credential management, observability, prompt filtering, and supply chain security.",
                publications: [
                  {
                    title: "Action Items for Agent Platform Security",
                    url: "https://hi120ki.github.io/blog/posts/20260223/",
                  },
                  {
                    title: "AI Security Challenges in 2026",
                    url: "https://hi120ki.github.io/blog/posts/20260103/",
                  },
                ],
              },
              {
                text: "Conducted AI-specific security reviews for internal and external AI products, identifying risks such as prompt injection, data leakage, and unsafe agent behavior. Developed and maintained company-wide AI security guidelines and led organization-wide training programs.",
                publications: [
                  {
                    title:
                      "How Mercari’s AI Security Team is Securing AI Native",
                    url: "https://careers.mercari.com/en/mercan/articles/55843/",
                  },
                ],
              },
              {
                text: "Designed automated security check architecture for n8n AI workflows and mentored a junior engineer through implementation. Built a secure Devin Enterprise management platform in Go and GitHub Actions, including a custom Terraform provider, automated secret rotation, and API key lifecycle controls.",
                publications: [
                  {
                    title: "Automating Secure Devin Management at Mercari",
                    url: "https://engineering.mercari.com/en/blog/entry/20260403-secure-devin-management/",
                  },
                  {
                    title:
                      "Automating Secure Devin Management at Mercari (Slides)",
                    url: "https://speakerdeck.com/hi120ki/secure-devin-management",
                  },
                  {
                    title:
                      "Security Challenges of Devin Discovered Through Operation",
                    url: "https://speakerdeck.com/hi120ki/devin-ai-security",
                  },
                ],
              },
            ]}
          />
          <TimelineItem
            date="Feb 2024 - Apr 2025"
            title="Mercari, Inc. — Security Engineer (Platform Security)"
            details={[
              {
                text: "Extended the internal Token Server for Google Cloud workloads: implemented OIDC-based short-lived credential issuance via a custom Go library, eliminating long-lived PATs and private keys. Led elimination of long-lived GitHub credentials across multiple service teams in a multinational organization.",
                publications: [
                  {
                    title:
                      "Removing GitHub PATs and Private Keys From Google Cloud: Extending Token Server to Google Cloud",
                    url: "https://engineering.mercari.com/en/blog/entry/20241203-token-server-google-cloud/",
                  },
                ],
              },
            ]}
          />
          <TimelineItem
            date="2022"
            title="Mercari, Inc. — Security Engineer (Intern)"
            details={[
              {
                text: "Identified missing attack techniques in Microsoft’s Threat Matrix for Kubernetes and documented them as an extended threat model. Contributed new attack detection rules to the Falco open-source repository and merged multiple Pull Requests into the official project.",
                publications: [
                  {
                    title:
                      "Restructuring the Kubernetes Threat Matrix and Evaluating Attack Detection by Falco",
                    url: "https://engineering.mercari.com/en/blog/entry/20220928-kubernetes-threat-matrix-and-attack-detection-by-falco/",
                  },
                ],
              },
            ]}
          />
          <TimelineItem
            date="2021"
            title="Recruit Co., Ltd. — Security Engineer (Intern)"
            details={[
              "Conducted vulnerability assessments on web applications and iOS applications. Built a source code parser to automate analysis of inspection targets, reducing manual effort in the assessment process.",
            ]}
          />
        </Section>
      </main>
    </Layout>
  );
}
