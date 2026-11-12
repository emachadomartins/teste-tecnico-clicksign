import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitepress";

// Os links e âncoras seguem o GitHub, e são convertidos para as URLs do site.
function githubSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function toSiteLink(href: string) {
  return href
    .replace(/^\.\.\/README\.md/, "/")
    .replace(/^\.?\/?docs\/([\w-]+)\.md/, "/$1")
    .replace(/^\.?\/?api\/?$/, "/backend")
    .replace(/^\.?\/?web\/?$/, "/frontend");
}

export default defineConfig({
  base: process.env.DOCS_BASE || "/docs/",
  title: "Gerenciador de Projetos",
  description: "Documentação do teste técnico",
  lang: "pt-BR",
  cleanUrls: true,

  srcDir: "..",
  srcExclude: ["api/**", "web/**", "CHECKLIST.md", "**/node_modules/**"],
  rewrites: {
    "README.md": "index.md",
    "docs/:page": ":page",
  },
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  vite: {
    resolve: {
      alias: {
        vue: fileURLToPath(new URL("../node_modules/vue", import.meta.url)),
      },
    },
  },

  markdown: {
    anchor: { slugify: githubSlug },
    config(md) {
      md.core.ruler.push("site-links", (state) => {
        for (const token of state.tokens) {
          for (const child of token.children ?? []) {
            const href = child.type === "link_open" && child.attrGet("href");
            if (href) child.attrSet("href", toSiteLink(href));
          }
        }
      });
    },
  },

  themeConfig: {
    nav: [
      { text: "Início", link: "/" },
      { text: "Decisões técnicas", link: "/decisoes-tecnicas" },
      { text: "API", link: "/api" },
    ],
    sidebar: [
      {
        text: "Documentação",
        items: [
          { text: "Visão geral", link: "/" },
          { text: "Decisões técnicas", link: "/decisoes-tecnicas" },
          { text: "Rotas da API", link: "/api" },
          { text: "Back-end", link: "/backend" },
          { text: "Front-end", link: "/frontend" },
          { text: "Deploy", link: "/deploy" },
        ],
      },
    ],
    outline: { level: [2, 3], label: "Nesta página" },
    search: { provider: "local" },
    docFooter: { prev: "Anterior", next: "Próxima" },
    darkModeSwitchLabel: "Tema",
    sidebarMenuLabel: "Menu",
    returnToTopLabel: "Voltar ao topo",
  },
});
