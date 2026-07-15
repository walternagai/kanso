import { readFileSync } from "fs";
import matter from "gray-matter";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  prev: string | null;
  next: string | null;
  pages: Array<{ url: string; number: number }>;
  items: Array<Record<string, unknown>>;
}

export interface PaginationConfig {
  perPage: number;
}

export function paginateCollection(
  collection: Array<{ frontMatter: Record<string, unknown>; slug: string; url: string }>,
  config: PaginationConfig
): PaginationData[] {
  const perPage = config.perPage;
  const totalPages = Math.max(1, Math.ceil(collection.length / perPage));
  const pages: PaginationData[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const start = i * perPage;
    const items = collection.slice(start, start + perPage);

    const pageUrls = Array.from({ length: totalPages }, (_, idx) => ({
      url: idx === 0 ? "/" : `/page/${idx + 1}/`,
      number: idx + 1,
    }));

    pages.push({
      currentPage: pageNum,
      totalPages,
      totalItems: collection.length,
      perPage,
      prev: pageNum > 1 ? (pageNum === 2 ? "/" : `/page/${pageNum - 1}/`) : null,
      next: pageNum < totalPages ? `/page/${pageNum + 1}/` : null,
      pages: pageUrls,
      items: items.map((item) => ({
        ...item.frontMatter,
        url: item.url,
        slug: item.slug,
      })),
    });
  }

  return pages;
}

export function readCollection(
  files: string[],
  contentDir: string
): Array<{ frontMatter: Record<string, unknown>; slug: string; url: string }> {
  return files
    .map((file) => {
      const raw = readFileSync(file, "utf-8");
      const { data } = matter(raw);
      const slug = file
        .replace(contentDir, "")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "/")
        .replace(/^\//, "");
      return {
        frontMatter: data,
        slug,
        url: `/${slug}`,
      };
    })
    .filter((item) => item.frontMatter.date)
    .sort((a, b) => {
      return (
        new Date(b.frontMatter.date as string).getTime() -
        new Date(a.frontMatter.date as string).getTime()
      );
    });
}
