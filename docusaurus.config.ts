import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "hi120ki",
  tagline: "hi120ki's blog",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://hi120ki.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "hi120ki", // Usually your GitHub org/user name.
  projectName: "hi120ki.github.io", // Usually your repo name.
  trailingSlash: true,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //  "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
          //  "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        googleAnalytics: {
          trackingID: "G-HFTK2LYG43",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "hi120ki",
      logo: {
        alt: "hi120ki",
        src: "img/logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documents",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/hi120ki",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://www.linkedin.com/in/hi120ki",
          label: "LinkedIn",
          position: "right",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Sections",
          items: [
            {
              label: "About Me",
              to: "/",
            },
            {
              label: "Documents",
              to: "/docs/intro",
            },
            {
              label: "Blog",
              to: "/blog",
            },
          ],
        },
        {
          title: "Documents",
          items: [
            {
              label: "AI Security",
              to: "/docs/ai-security/intro",
            },
            {
              label: "Cloud Security",
              to: "/docs/cloud-security/intro",
            },
            {
              label: "GitHub Security",
              to: "/docs/github-security/intro",
            },
            {
              label: "Pentest",
              to: "/docs/pentest/intro",
            },
            {
              label: "Web Performance",
              to: "/docs/web-performance/intro",
            },
          ],
        },
        {
          title: "Socials",
          items: [
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/hi120ki",
            },
            {
              label: "X",
              href: "https://x.com/hi120ki",
            },
            {
              label: "GitHub",
              href: "https://github.com/hi120ki",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub Repository",
              href: "https://github.com/hi120ki/hi120ki.github.io",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} hi120ki. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
