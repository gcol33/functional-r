import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const secret = url.searchParams.get("key");

  // Simple auth — change this secret after first use
  if (secret !== "reset-thinking-in-r-2026") {
    return new Response("unauthorized", { status: 401 });
  }

  const store = getStore("analytics");
  const { blobs } = await store.list();

  // Delete only non-owner keys (keep owner: prefixed data)
  let deleted = 0;
  for (const blob of blobs) {
    if (!blob.key.startsWith("owner:")) {
      await store.delete(blob.key);
      deleted++;
    }
  }

  return Response.json({ deleted, message: "Public counters reset" });
};

export const config = { path: "/api/reset" };
