import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const page = url.searchParams.get("p") || "/";
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  const store = getStore("analytics");

  // Increment helpers — read, parse, increment, write
  const inc = async (key) => {
    const val = await store.get(key);
    const count = val ? parseInt(val, 10) + 1 : 1;
    await store.set(key, count.toString());
    return count;
  };

  await Promise.all([
    inc("total"),
    inc(`daily:${day}`),
    inc(`monthly:${month}`),
    inc(`page:${page}`),
  ]);

  return new Response("ok", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
};

export const config = { path: "/api/hit" };
