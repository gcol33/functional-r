import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  // If a specific key is requested
  if (key) {
    const val = await store.get(key);
    return Response.json({ key, value: parseInt(val || "0", 10) });
  }

  // Otherwise return a summary
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  const [total, today, thisMonth] = await Promise.all([
    store.get("total"),
    store.get(`daily:${day}`),
    store.get(`monthly:${month}`),
  ]);

  // Get all page keys for top pages
  const { blobs } = await store.list({ prefix: "page:" });
  const pages = [];
  for (const blob of blobs) {
    const val = await store.get(blob.key);
    pages.push({ page: blob.key.replace("page:", ""), hits: parseInt(val || "0", 10) });
  }
  pages.sort((a, b) => b.hits - a.hits);

  return Response.json({
    total: parseInt(total || "0", 10),
    today: parseInt(today || "0", 10),
    this_month: parseInt(thisMonth || "0", 10),
    top_pages: pages.slice(0, 20),
  });
};

export const config = { path: "/api/stats" };
