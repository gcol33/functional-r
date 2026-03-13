import { getStore } from "@netlify/blobs";

// IPs to track separately (owner visits)
const OWNER_IPS = ["84.112.10.156"];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export default async (req) => {
  const url = new URL(req.url);
  const page = url.searchParams.get("p") || "/";
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-nf-client-connection-ip")
    || "unknown";

  const isOwner = OWNER_IPS.includes(ip);
  const prefix = isOwner ? "owner:" : "";

  // Half-day buckets for dedup (0-11h = "a", 12-23h = "b")
  const halfDay = day + (now.getUTCHours() < 12 ? "a" : "b");
  const visitorId = hash(ip + halfDay);
  const store = getStore("analytics");

  // Deduplicate by IP per half-day
  const seenKey = `${prefix}seen:${halfDay}:${visitorId}`;
  const alreadySeen = await store.get(seenKey);
  const isNewVisitor = !alreadySeen;

  if (isNewVisitor) {
    await store.set(seenKey, "1");
  }

  const inc = async (key) => {
    const val = await store.get(key);
    const count = val ? parseInt(val, 10) + 1 : 1;
    await store.set(key, count.toString());
  };

  // Page views (prefixed for owner)
  await Promise.all([
    inc(`${prefix}total`),
    inc(`${prefix}daily:${day}`),
    inc(`${prefix}monthly:${month}`),
    inc(`${prefix}page:${page}`),
  ]);

  // Unique visitors
  if (isNewVisitor) {
    await Promise.all([
      inc(`${prefix}unique:total`),
      inc(`${prefix}unique:daily:${day}`),
      inc(`${prefix}unique:monthly:${month}`),
    ]);
  }

  return new Response("ok", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
};

export const config = { path: "/api/hit" };
