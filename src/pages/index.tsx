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
            I am a AI & Platform Security Engineer focused on building
            secure-by-default infrastructure and enabling the safe adoption of
            emerging technologies such as LLMs. My work spans securing the usage
            and deployment of AI Agents, MCPs, cloud platforms, software supply
            chains, and Kubernetes environments, as well as designing security
            controls that integrate seamlessly into developer workflows.
          </p>
        </Section>
        <Section id="experience" title="Professional Experience">
          <TimelineItem
            date="2024 - Present"
            title="Mercari, Inc. — Security Engineer (Full-time)"
            details={[
              {
                text: "Launched LLM Key Server that issues short-lived API keys via OIDC for local environments, GitHub Actions, Apps Script, and service account workloads, enabling secure and centrally managed internal LLM API access.",
                publications: [
                  {
                    title:
                      "LLM Key Server: Providing Secure and Convenient Access to Internal LLM APIs",
                    url: "https://engineering.mercari.com/en/blog/entry/20251202-llm-key-server/",
                  },
                ],
              },
              {
                text: "Designed the security architecture of inhouse MCP gateway to ensure organization wide secure usage of AI Agents.",
                publications: [
                  {
                    title:
                      "MCP Authentication and Authorization: Current State and Future",
                    url: "https://hi120ki.github.io/blog/posts/20250728/",
                  },
                  {
                    title: "Weaponize the MCP - OAuth Phishing and Mitigations",
                    url: "https://hi120ki.github.io/blog/posts/20251123/",
                  },
                  {
                    title: "MCP's authentication and authorization",
                    url: "https://speakerdeck.com/hi120ki/mcp-authorization",
                  },
                ],
              },
              {
                text: "Developed tools to reduce the need for long-lived credentials on GitHub, reducing the risk of credential leakage and simplifying credential management.",
                publications: [
                  {
                    title:
                      "Removing GitHub PATs and Private Keys From Google Cloud: Extending Token Server to Google Cloud",
                    url: "https://engineering.mercari.com/en/blog/entry/20241203-token-server-google-cloud/",
                  },
                ],
              },
              "Applied organization-wide security controls using GCP Organization Policy and AWS SCP.",
              "Authored Kubernetes hardening guidelines and reduced critical findings on Gatekeeper.",
            ]}
          />
          <TimelineItem
            date="2022 - 2022"
            title="Mercari, Inc. — Security Engineer (Intern)"
            details={[
              {
                text: "Re-structured Microsoft Kubernetes Threat Matrix and created Falco rules to fill detection gaps, and contributed to upstream official falco ruleset.",
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
            date="2021 - 2021"
            title="Recruit Co., Ltd. — Security Engineer (Part-time)"
            details={[
              "Performed application vulnerability assessments and built static-analysis parsers for proprietary codebases.",
            ]}
          />
        </Section>
      </main>
    </Layout>
  );
}
