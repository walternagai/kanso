import { readFileSync } from "fs";
import matter from "gray-matter";

export interface CollectionItem {
  frontMatter: Record<string, unknown>;
  slug: string;
  url: string;
  content: string;
  excerpt: string;
}

export interface Collection {
  name: string;
  items: CollectionItem[];
  tags: string[];
}

export function buildCollections(
  files: string[],
  contentDir: string
): Map<string, Collection> {
  const collections = new Map<string, Collection>();
  const tagIndex = new Map<string, CollectionItem[]>();

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const { data, content } = matter(raw);

    if (data.draft === true) continue;

    const slug = file
      .replace(contentDir, "")
      .replace(/\.md$/, "")
      .replace(/\/index$/, "/")
      .replace(/^\//, "");

    const excerpt = content
      .replace(/<[^>]+>/g, "")
      .replace(/[#*_`~\[\]]/g, "")
      .trim()
      .slice(0, 140);

    const item: CollectionItem = {
      frontMatter: data,
      slug,
      url: `/${slug}`,
      content,
      excerpt,
    };

    // Add to collection based on directory
    const parts = slug.split("/");
    const collectionName = parts.length > 1 ? parts[0] : "pages";

    if (!collections.has(collectionName)) {
      collections.set(collectionName, {
        name: collectionName,
        items: [],
        tags: [],
      });
    }
    collections.get(collectionName)!.items.push(item);

    // Index by tags
    const tags = (data.tags as string[]) || [];
    for (const tag of tags) {
      if (!tagIndex.has(tag)) {
        tagIndex.set(tag, []);
      }
      tagIndex.get(tag)!.push(item);
    }
  }

  // Sort items by date descending
  for (const col of collections.values()) {
    col.items.sort((a, b) => {
      const aDate = new Date(String(a.frontMatter.date || 0));
      const bDate = new Date(String(b.frontMatter.date || 0));
      return bDate.getTime() - aDate.getTime();
    });
    col.tags = [...new Set(col.items.flatMap((i) => (i.frontMatter.tags as string[]) || []))];
  }

  // Create tag collections
  for (const [tag, items] of tagIndex) {
    items.sort((a, b) => {
      const aDate = new Date(String(a.frontMatter.date || 0));
      const bDate = new Date(String(b.frontMatter.date || 0));
      return bDate.getTime() - aDate.getTime();
    });
    collections.set(`tags/${tag}`, {
      name: tag,
      items,
      tags: [tag],
    });
  }

  return collections;
}
