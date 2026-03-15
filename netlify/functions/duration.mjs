import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const page = url.searchParams.get("p") || "/";
  const secs = parseInt(url.searchParams.get("s") || "0", 10);

  // Ignore unreasonable values
  if (secs < 5 || secs > 3600) {
    return new Response("ignored", { status: 200 });
  }

  const store = getStore("analytics");
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  const inc = async (key, amount) => {
    const val = await store.get(key);
    const count = val ? parseInt(val, 10) + amount : amount;
    await store.set(key, count.toString());
  };

  // Store cumulative seconds and session count
  await Promise.all([
    inc("duration:total", secs),
    inc(`duration:daily:${day}`, secs),
    inc(`duration:monthly:${month}`, secs),
    inc("duration:sessions:total", 1),
    inc(`duration:sessions:daily:${day}`, 1),
    inc(`duration:sessions:monthly:${month}`, 1),
  ]);

  return new Response("ok", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
};

export const config = { path: "/api/duration" };
