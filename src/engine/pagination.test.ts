import { describe, it } from "node:test";
import assert from "node:assert";
import { paginateCollection, PaginationData } from "./pagination.js";

describe("Pagination", () => {
  function makeItems(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      frontMatter: { title: `Post ${i + 1}`, date: `2026-05-${String(i + 1).padStart(2, "0")}` },
      slug: `post-${i + 1}`,
      url: `/posts/post-${i + 1}/`,
    }));
  }

  it("paginates items into pages", () => {
    const items = makeItems(12);
    const pages = paginateCollection(items, { perPage: 5 });
    assert.strictEqual(pages.length, 3);
    assert.strictEqual(pages[0].items.length, 5);
    assert.strictEqual(pages[1].items.length, 5);
    assert.strictEqual(pages[2].items.length, 2);
  });

  it("sets correct page metadata", () => {
    const items = makeItems(12);
    const pages = paginateCollection(items, { perPage: 5 });

    assert.strictEqual(pages[0].currentPage, 1);
    assert.strictEqual(pages[0].totalPages, 3);
    assert.strictEqual(pages[0].totalItems, 12);
    assert.strictEqual(pages[0].perPage, 5);
  });

  it("sets prev/next links correctly", () => {
    const items = makeItems(12);
    const pages = paginateCollection(items, { perPage: 5 });

    assert.strictEqual(pages[0].prev, null);
    assert.strictEqual(pages[0].next, "/page/2/");

    assert.strictEqual(pages[1].prev, "/");
    assert.strictEqual(pages[1].next, "/page/3/");

    assert.strictEqual(pages[2].prev, "/page/2/");
    assert.strictEqual(pages[2].next, null);
  });

  it("generates page URLs array", () => {
    const items = makeItems(12);
    const pages = paginateCollection(items, { perPage: 5 });

    assert.strictEqual(pages[0].pages.length, 3);
    assert.deepStrictEqual(pages[0].pages, [
      { url: "/", number: 1 },
      { url: "/page/2/", number: 2 },
      { url: "/page/3/", number: 3 },
    ]);
  });

  it("handles single page (no pagination needed)", () => {
    const items = makeItems(3);
    const pages = paginateCollection(items, { perPage: 10 });
    assert.strictEqual(pages.length, 1);
    assert.strictEqual(pages[0].currentPage, 1);
    assert.strictEqual(pages[0].totalPages, 1);
    assert.strictEqual(pages[0].prev, null);
    assert.strictEqual(pages[0].next, null);
  });

  it("handles empty collection", () => {
    const pages = paginateCollection([], { perPage: 10 });
    assert.strictEqual(pages.length, 1);
    assert.strictEqual(pages[0].totalItems, 0);
    assert.strictEqual(pages[0].items.length, 0);
  });

  it("exposes item data to template", () => {
    const items = makeItems(2);
    const pages = paginateCollection(items, { perPage: 10 });

    assert.strictEqual(pages[0].items[0].title, "Post 1");
    assert.ok(pages[0].items[0].url);
  });
});
