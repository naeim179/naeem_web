"use client";
import { categoryLabel } from "@/lib/writeup-labels";
import Link from "next/link";
import { useMemo, useState } from "react";
import { type Writeup } from "@/lib/writeups";
import { Arrow } from "@/components/Icons";
export default function WriteupLibrary({
  entries,
  collections,
  categories,
}: {
  entries: readonly Writeup[];
  collections: { id: string; label: string }[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("collection");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries
      .filter(
        (w) =>
          (collection === "all" || w.collectionId === collection) &&
          (category === "all" || w.category === category) &&
          (!needle ||
            [
              w.title,
              w.summary,
              w.collection,
              w.category,
              categoryLabel(w.category),
              ...w.tags,
              ...w.skills,
            ]
              .join(" ")
              .toLowerCase()
              .includes(needle)),
      )
      .toSorted((a, b) =>
        sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "newest"
            ? (b.date ?? "").localeCompare(a.date ?? "") ||
              a.title.localeCompare(b.title)
            : a.collection.localeCompare(b.collection) ||
              a.title.localeCompare(b.title),
      );
  }, [entries, query, collection, category, sort]);
  function reset() {
    setQuery("");
    setCollection("all");
    setCategory("all");
    setSort("collection");
  }
  const active = Boolean(
    query.trim() ||
      collection !== "all" ||
      category !== "all" ||
      sort !== "collection",
  );
  return (
    <section className="writeup-library" aria-label="Writeup library">
      <form className="writeup-filters" onSubmit={(e) => e.preventDefault()}>
        <div className="writeup-search">
          <label htmlFor="writeup-search">Search the library</label>
          <div>
            <span aria-hidden="true">⌕</span>
            <input
              id="writeup-search"
              type="search"
              placeholder="A challenge, tool, or technique…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="writeup-collection">Competition</label>
          <select
            id="writeup-collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
          >
            <option value="all">All competitions</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="writeup-category">Category</label>
          <select
            id="writeup-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="writeup-sort">Sort by</label>
          <select
            id="writeup-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="collection">Competition</option>
            <option value="title">Challenge A–Z</option>
            <option value="newest">Newest dated first</option>
          </select>
        </div>
      </form>
      <div className="writeup-results">
        <p role="status" aria-live="polite">
          Showing <strong>{filtered.length}</strong> of {entries.length}{" "}
          writeups
        </p>
        {active ? (
          <button type="button" onClick={reset}>
            Clear filters <span aria-hidden="true">×</span>
          </button>
        ) : (
          <span>EXPLORE. INVESTIGATE. UNDERSTAND.</span>
        )}
      </div>
      <div className="writeup-grid">
        {filtered.map((w) => (
          <article key={w.slug} className="writeup-card">
            <div className="writeup-card-top">
              <span>{w.collection}</span>
              <span className="writeup-category">
                {categoryLabel(w.category)}
              </span>
            </div>
            <h2>
              <Link href={`/writeups/${w.slug}`}>{w.title}</Link>
            </h2>
            <p>{w.summary}</p>
            <ul className="writeup-tags" aria-label="Techniques">
              {w.tags.slice(0, 4).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className="writeup-card-bottom">
              <span>
                {w.readingMinutes} min read
                {w.difficulty ? (
                  <>
                    <span aria-hidden="true">·</span>
                    {w.difficulty}
                  </>
                ) : null}
              </span>
              <Link href={`/writeups/${w.slug}`} aria-label={`Read ${w.title}`}>
                <Arrow diagonal />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <div className="writeup-empty">
          <p className="eyebrow">NO MATCHES</p>
          <h2>A different search.</h2>
          <p>Try a challenge name, another category, or fewer filters.</p>
          <button type="button" className="button button-ink" onClick={reset}>
            Show all writeups <Arrow />
          </button>
        </div>
      ) : null}
    </section>
  );
}
