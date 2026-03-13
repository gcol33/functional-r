import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (key) {
    const val = await store.get(key);
    return Response.json({ key, value: parseInt(val || "0", 10) });
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  const [total, today, thisMonth, uniqueTotal, uniqueToday, uniqueMonth] = await Promise.all([
    store.get("total"),
    store.get(`daily:${day}`),
    store.get(`monthly:${month}`),
    store.get("unique:total"),
    store.get(`unique:daily:${day}`),
    store.get(`unique:monthly:${month}`),
  ]);

  const { blobs } = await store.list({ prefix: "page:" });
  const pages = [];
  for (const blob of blobs) {
    const val = await store.get(blob.key);
    pages.push({ page: blob.key.replace("page:", ""), hits: parseInt(val || "0", 10) });
  }
  pages.sort((a, b) => b.hits - a.hits);

  return Response.json({
    views: {
      total: parseInt(total || "0", 10),
      today: parseInt(today || "0", 10),
      this_month: parseInt(thisMonth || "0", 10),
    },
    unique: {
      total: parseInt(uniqueTotal || "0", 10),
      today: parseInt(uniqueToday || "0", 10),
      this_month: parseInt(uniqueMonth || "0", 10),
    },
    top_pages: pages.slice(0, 20),
  });
};

export const config = { path: "/api/stats" };
