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
              Platform & AI Security Engineer
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
  children: React.ReactNode;
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
    | { text: string; publication?: { title: string; url: string } }
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
                {detail.text}
                {detail.publication && (
                  <>
                    {" "}
                    <a
                      href={detail.publication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      [{detail.publication.title}]
                    </a>
                  </>
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
            I am a Platform Security Engineer specializing in enforcing
            secure-by-default cloud infrastructure, implementing security
            controls across development environments including GitHub and the
            software supply chain, and hardening Kubernetes security - all while
            minimizing friction for developers.
          </p>
        </Section>
        <Section id="experience" title="Professional Experience">
          <TimelineItem
            date="2024 - Present"
            title="Mercari, Inc. — Security Engineer (Full-time)"
            details={[
              "Designed and implemented platform-wide security controls for the operational use of AI tools such as Coding Agents.",
              {
                text: "Developed tools to reduce the need for long-lived credentials on GitHub, reducing the risk of credential leakage and simplifying credential management.",
                publication: {
                  title:
                    "Removing GitHub PATs and Private Keys From Google Cloud: Extending Token Server to Google Cloud",
                  url: "https://engineering.mercari.com/en/blog/entry/20241203-token-server-google-cloud/",
                },
              },
              "Applied organization-wide security controls on Google Cloud Platform and AWS.",
              "Authored Kubernetes hardening guidelines and reduced critical findings.",
            ]}
          />
          <TimelineItem
            date="2022 - 2022"
            title="Mercari, Inc. — Security Engineer (Intern)"
            details={[
              {
                text: "Re-structured Microsoft Kubernetes Threat Matrix and created Falco rules to fill detection gaps, and contributed to upstream official falco ruleset.",
                publication: {
                  title:
                    "Restructuring the Kubernetes Threat Matrix and Evaluating Attack Detection by Falco",
                  url: "https://engineering.mercari.com/en/blog/entry/20220928-kubernetes-threat-matrix-and-attack-detection-by-falco/",
                },
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
