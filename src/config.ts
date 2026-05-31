export interface KansoConfig {
  site: {
    title: string;
    url: string;
    language: string;
  };
  content: {
    dir: string;
  };
  output: {
    dir: string;
  };
  markdown: {
    syntaxHighlight: boolean;
    callouts: boolean;
  };
  seo: {
    sitemap: boolean;
    robots: boolean;
  };
  feed: {
    enabled: boolean;
    type: "rss" | "atom" | "json";
  };
  pagination: {
    perPage: number;
  };
  deploy: {
    provider: "github-pages" | "netlify";
  };
}

export const defaultConfig: KansoConfig = {
  site: {
    title: "My Kanso Site",
    url: "https://example.com",
    language: "pt_BR",
  },
  content: {
    dir: "content",
  },
  output: {
    dir: "dist",
  },
  markdown: {
    syntaxHighlight: true,
    callouts: true,
  },
  seo: {
    sitemap: true,
    robots: true,
  },
  feed: {
    enabled: false,
    type: "rss",
  },
  pagination: {
    perPage: 10,
  },
  deploy: {
    provider: "github-pages",
  },
};
