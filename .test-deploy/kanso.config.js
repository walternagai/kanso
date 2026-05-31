export default {
  site: {
    title: "My Kanso Site",
    url: "https://example.com",
    language: "pt_BR"
  },
  content: {
    dir: "content"
  },
  output: {
    dir: "dist"
  },
  markdown: {
    syntaxHighlight: true,
    callouts: true
  },
  seo: {
    sitemap: true,
    robots: true
  },
  feed: {
    enabled: false,
    type: "rss"
  },
  pagination: {
    perPage: 10
  },
  deploy: {
    provider: "github-pages"
  }
}
