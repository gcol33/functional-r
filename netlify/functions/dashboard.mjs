import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  // Gather stats
  const [total, today, thisMonth, uTotal, uToday, uMonth] = await Promise.all([
    store.get("total"),
    store.get(`daily:${day}`),
    store.get(`monthly:${month}`),
    store.get("unique:total"),
    store.get(`unique:daily:${day}`),
    store.get(`unique:monthly:${month}`),
  ]);

  // Last 30 days (views + unique)
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const [views, uniq] = await Promise.all([
      store.get(`daily:${key}`),
      store.get(`unique:daily:${key}`),
    ]);
    daily.push({ date: key, views: parseInt(views || "0", 10), unique: parseInt(uniq || "0", 10) });
  }

  // Last 12 months
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const [views, uniq] = await Promise.all([
      store.get(`monthly:${key}`),
      store.get(`unique:monthly:${key}`),
    ]);
    monthly.push({ month: key, views: parseInt(views || "0", 10), unique: parseInt(uniq || "0", 10) });
  }

  // Top pages
  const { blobs } = await store.list({ prefix: "page:" });
  const pages = [];
  for (const blob of blobs) {
    const val = await store.get(blob.key);
    pages.push({ page: blob.key.replace("page:", ""), hits: parseInt(val || "0", 10) });
  }
  pages.sort((a, b) => b.hits - a.hits);

  const maxDaily = Math.max(...daily.map(d => d.views), 1);
  const maxMonthly = Math.max(...monthly.map(m => m.views), 1);

  const p = (v) => parseInt(v || "0", 10);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thinking in R — Analytics</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1117; color: #e0e0e0; padding: 2rem; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; color: #fff; }
  .subtitle { font-size: 0.75rem; color: #555; margin-bottom: 1.5rem; }
  h2 { font-size: 1rem; margin: 2rem 0 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { background: #1a1d27; border-radius: 8px; padding: 1.25rem; }
  .card .label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  .card .value { font-size: 2rem; font-weight: 700; color: #fff; margin-top: 0.25rem; }
  .card .sub { font-size: 0.8rem; color: #4f8ff7; margin-top: 0.15rem; }
  .chart { display: flex; align-items: flex-end; gap: 2px; height: 140px; background: #1a1d27; border-radius: 8px; padding: 1rem 1rem 2rem; position: relative; }
  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0; height: 100%; justify-content: flex-end; position: relative; }
  .bars { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
  .bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 0; }
  .bar.views { background: #2a3a5c; }
  .bar.unique { background: #4f8ff7; position: absolute; bottom: 0; }
  .bar-label { font-size: 0.5rem; color: #555; position: absolute; bottom: -16px; white-space: nowrap; }
  .bar-group:hover .bar.views { background: #3a4a6c; }
  .bar-group:hover .bar.unique { background: #6ea8ff; }
  .legend { display: flex; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.7rem; color: #888; }
  .legend span { display: flex; align-items: center; gap: 4px; }
  .legend .dot { width: 8px; height: 8px; border-radius: 2px; }
  .dot.views { background: #2a3a5c; }
  .dot.unique { background: #4f8ff7; }
  table { width: 100%; border-collapse: collapse; background: #1a1d27; border-radius: 8px; overflow: hidden; }
  th, td { text-align: left; padding: 0.6rem 1rem; }
  th { font-size: 0.7rem; color: #666; text-transform: uppercase; border-bottom: 1px solid #2a2d37; }
  td { font-size: 0.85rem; border-bottom: 1px solid #1f222c; }
  td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  tr:last-child td { border-bottom: none; }
  .page-path { color: #4f8ff7; }
  .refresh { color: #555; font-size: 0.7rem; margin-top: 2rem; text-align: center; }
</style>
</head>
<body>
<h1>Thinking in R — Analytics</h1>
<div class="subtitle">Engaged readers only (5s+ on page, deduplicated per session)</div>

<h2>Overview</h2>
<div class="cards">
  <div class="card">
    <div class="label">Today</div>
    <div class="value">${p(uToday)}</div>
    <div class="sub">${p(today)} page views</div>
  </div>
  <div class="card">
    <div class="label">This Month</div>
    <div class="value">${p(uMonth)}</div>
    <div class="sub">${p(thisMonth)} page views</div>
  </div>
  <div class="card">
    <div class="label">All Time</div>
    <div class="value">${p(uTotal)}</div>
    <div class="sub">${p(total)} page views</div>
  </div>
</div>

<h2>Last 30 Days</h2>
<div class="chart">
  ${daily.map(d => {
    const vh = (d.views / maxDaily) * 100;
    const uh = (d.unique / maxDaily) * 100;
    return `<div class="bar-group" title="${d.date}&#10;${d.unique} visitors, ${d.views} views"><div class="bar views" style="height:${vh}%"></div><div class="bar unique" style="height:${uh}%"></div><div class="bar-label">${d.date.slice(8)}</div></div>`;
  }).join("")}
</div>
<div class="legend"><span><div class="dot unique"></div> Unique visitors</span><span><div class="dot views"></div> Page views</span></div>

<h2>Monthly</h2>
<div class="chart">
  ${monthly.map(m => {
    const vh = (m.views / maxMonthly) * 100;
    const uh = (m.unique / maxMonthly) * 100;
    return `<div class="bar-group" title="${m.month}&#10;${m.unique} visitors, ${m.views} views"><div class="bar views" style="height:${vh}%"></div><div class="bar unique" style="height:${uh}%"></div><div class="bar-label">${m.month.slice(5)}</div></div>`;
  }).join("")}
</div>
<div class="legend"><span><div class="dot unique"></div> Unique visitors</span><span><div class="dot views"></div> Page views</span></div>

<h2>Top Pages</h2>
<table>
  <tr><th>Page</th><th>Views</th></tr>
  ${pages.slice(0, 30).map(p => `<tr><td class="page-path">${p.page}</td><td>${p.hits}</td></tr>`).join("")}
</table>

<div class="refresh">Last refreshed: ${now.toISOString().replace("T", " ").slice(0, 19)} UTC</div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export const config = { path: "/api/dashboard" };
