import catalog from "@/content/writeups/catalog.json";
export type Writeup = (typeof catalog)[number];
export const writeups: readonly Writeup[] = catalog;
export const collections = [
  ...new Map(
    writeups.map((entry) => [entry.collectionId, entry.collection]),
  ).entries(),
].map(([id, label]) => ({ id, label }));
export const categories = [
  ...new Set(writeups.map((entry) => entry.category)),
].sort();
export function getWriteup(slug: string) {
  return writeups.find((entry) => entry.slug === slug);
}
