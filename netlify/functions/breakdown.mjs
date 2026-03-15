import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "today";
  const store = getStore("analytics");
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const p = (v) => parseInt(v || "0", 10);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  let title, rows, chartHtml, summaryHtml;

  if (period === "today") {
    title = `Today — ${day}`;
    // Get today + yesterday for comparison
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yDay = yesterday.toISOString().slice(0, 10);

    const [views, unique, yViews, yUnique] = await Promise.all([
      store.get(`daily:${day}`),
      store.get(`unique:daily:${day}`),
      store.get(`daily:${yDay}`),
      store.get(`unique:daily:${yDay}`),
    ]);

    const v = p(views), u = p(unique), yv = p(yViews), yu = p(yUnique);
    const delta = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "↑ new" : "—";
      const pct = Math.round(((curr - prev) / prev) * 100);
      return pct > 0 ? `↑ ${pct}%` : pct < 0 ? `↓ ${Math.abs(pct)}%` : "=";
    };

    summaryHtml = `
    <div class="cards">
      <div class="card">
        <div class="label">Page Views</div>
        <div class="value">${v}</div>
        <div class="sub">${delta(v, yv)} vs yesterday (${yv})</div>
      </div>
      <div class="card">
        <div class="label">Unique Visitors</div>
        <div class="value">${u}</div>
        <div class="sub">${delta(u, yu)} vs yesterday (${yu})</div>
      </div>
      <div class="card">
        <div class="label">Views / Visitor</div>
        <div class="value">${u > 0 ? (v / u).toFixed(1) : "—"}</div>
        <div class="sub">pages per session</div>
      </div>
    </div>`;

    // Last 7 days mini table for context
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const [wv, wu] = await Promise.all([
        store.get(`daily:${k}`),
        store.get(`unique:daily:${k}`),
      ]);
      week.push({ date: k, views: p(wv), unique: p(wu) });
    }

    const maxW = Math.max(...week.map(d => d.views), 1);
    chartHtml = `
    <h2>Last 7 Days</h2>
    <table>
      <tr><th>Date</th><th>Visitors</th><th>Views</th><th></th></tr>
      ${week.map(d => {
        const barW = Math.round((d.views / maxW) * 100);
        const isToday = d.date === day;
        return `<tr${isToday ? ' style="background:#1f2233"' : ""}>
          <td>${d.date}${isToday ? " ●" : ""}</td>
          <td>${d.unique}</td>
          <td>${d.views}</td>
          <td style="width:40%"><div style="height:12px;border-radius:2px;width:${barW}%;background:${isToday ? "#4f8ff7" : "#2a3a5c"}"></div></td>
        </tr>`;
      }).join("")}
    </table>`;

  } else if (period === "month") {
    title = `This Month — ${month}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    const [mViews, mUnique] = await Promise.all([
      store.get(`monthly:${month}`),
      store.get(`unique:monthly:${month}`),
    ]);

    // Previous month for comparison
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevDate.toISOString().slice(0, 7);
    const [pmViews, pmUnique] = await Promise.all([
      store.get(`monthly:${prevMonth}`),
      store.get(`unique:monthly:${prevMonth}`),
    ]);

    const v = p(mViews), u = p(mUnique), pv = p(pmViews), pu = p(pmUnique);
    const avg = currentDay > 0 ? (v / currentDay).toFixed(1) : "0";

    summaryHtml = `
    <div class="cards">
      <div class="card">
        <div class="label">Page Views</div>
        <div class="value">${v}</div>
        <div class="sub">last month: ${pv}</div>
      </div>
      <div class="card">
        <div class="label">Unique Visitors</div>
        <div class="value">${u}</div>
        <div class="sub">last month: ${pu}</div>
      </div>
      <div class="card">
        <div class="label">Daily Average</div>
        <div class="value">${avg}</div>
        <div class="sub">views/day (${currentDay} days in)</div>
      </div>
    </div>`;

    // Day-by-day breakdown
    const days = [];
    for (let i = 1; i <= currentDay; i++) {
      const k = `${month}-${String(i).padStart(2, "0")}`;
      const [dv, du] = await Promise.all([
        store.get(`daily:${k}`),
        store.get(`unique:daily:${k}`),
      ]);
      days.push({ date: k, day: i, views: p(dv), unique: p(du) });
    }

    const maxD = Math.max(...days.map(d => d.views), 1);
    chartHtml = `
    <h2>Day by Day</h2>
    <table>
      <tr><th>Date</th><th>Visitors</th><th>Views</th><th></th></tr>
      ${days.map(d => {
        const barW = Math.round((d.views / maxD) * 100);
        const isToday = d.date === day;
        return `<tr${isToday ? ' style="background:#1f2233"' : ""}>
          <td>${d.date}${isToday ? " ●" : ""}</td>
          <td>${d.unique}</td>
          <td>${d.views}</td>
          <td style="width:40%"><div style="height:12px;border-radius:2px;width:${barW}%;background:${isToday ? "#4f8ff7" : "#2a3a5c"}"></div></td>
        </tr>`;
      }).join("")}
    </table>`;

  } else {
    // alltime
    title = "All Time";

    const [total, uTotal] = await Promise.all([
      store.get("total"),
      store.get("unique:total"),
    ]);
    const v = p(total), u = p(uTotal);

    // Collect all months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = d.toISOString().slice(0, 7);
      const [mv, mu] = await Promise.all([
        store.get(`monthly:${k}`),
        store.get(`unique:monthly:${k}`),
      ]);
      months.push({ month: k, views: p(mv), unique: p(mu) });
    }

    const activeMonths = months.filter(m => m.views > 0).length;

    summaryHtml = `
    <div class="cards">
      <div class="card">
        <div class="label">Total Page Views</div>
        <div class="value">${v}</div>
        <div class="sub">${activeMonths} active months</div>
      </div>
      <div class="card">
        <div class="label">Total Unique Visitors</div>
        <div class="value">${u}</div>
        <div class="sub">${u > 0 ? (v / u).toFixed(1) : "—"} views/visitor</div>
      </div>
      <div class="card">
        <div class="label">Monthly Average</div>
        <div class="value">${activeMonths > 0 ? Math.round(v / activeMonths) : "—"}</div>
        <div class="sub">views/month</div>
      </div>
    </div>`;

    const maxM = Math.max(...months.map(m => m.views), 1);
    chartHtml = `
    <h2>Monthly Breakdown</h2>
    <table>
      <tr><th>Month</th><th>Visitors</th><th>Views</th><th></th></tr>
      ${months.map(m => {
        const barW = Math.round((m.views / maxM) * 100);
        const label = monthNames[parseInt(m.month.slice(5), 10) - 1] + " " + m.month.slice(0, 4);
        const isCurrent = m.month === month;
        return `<tr${isCurrent ? ' style="background:#1f2233"' : ""}>
          <td>${label}${isCurrent ? " ●" : ""}</td>
          <td>${m.unique}</td>
          <td>${m.views}</td>
          <td style="width:40%"><div style="height:12px;border-radius:2px;width:${barW}%;background:${isCurrent ? "#4f8ff7" : "#2a3a5c"}"></div></td>
        </tr>`;
      }).join("")}
    </table>`;
  }

  // Top pages (always shown)
  const { blobs } = await store.list({ prefix: "page:" });
  const pages = [];
  for (const blob of blobs) {
    const val = await store.get(blob.key);
    pages.push({ page: blob.key.replace("page:", ""), hits: p(val) });
  }
  pages.sort((a, b) => b.hits - a.hits);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thinking in R — ${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1117; color: #e0e0e0; padding: 2rem; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; color: #fff; }
  .back { font-size: 0.8rem; color: #4f8ff7; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
  .back:hover { text-decoration: underline; }
  h2 { font-size: 1rem; margin: 2rem 0 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { background: #1a1d27; border-radius: 8px; padding: 1.25rem; }
  .card .label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  .card .value { font-size: 2rem; font-weight: 700; color: #fff; margin-top: 0.25rem; }
  .card .sub { font-size: 0.8rem; color: #4f8ff7; margin-top: 0.15rem; }
  table { width: 100%; border-collapse: collapse; background: #1a1d27; border-radius: 8px; overflow: hidden; }
  th, td { text-align: left; padding: 0.6rem 1rem; }
  th { font-size: 0.7rem; color: #666; text-transform: uppercase; border-bottom: 1px solid #2a2d37; }
  td { font-size: 0.85rem; border-bottom: 1px solid #1f222c; }
  tr:last-child td { border-bottom: none; }
  .page-path { color: #4f8ff7; }
  .refresh { color: #555; font-size: 0.7rem; margin-top: 2rem; text-align: center; }
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .tab { padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.8rem; text-decoration: none; color: #888; background: #1a1d27; }
  .tab:hover { color: #fff; }
  .tab.active { color: #fff; background: #2a3a5c; }
</style>
</head>
<body>
<a class="back" href="/api/dashboard">← Dashboard</a>
<h1>${title}</h1>

<div class="tabs">
  <a class="tab${period === "today" ? " active" : ""}" href="/api/breakdown?period=today">Today</a>
  <a class="tab${period === "month" ? " active" : ""}" href="/api/breakdown?period=month">Month</a>
  <a class="tab${period === "alltime" ? " active" : ""}" href="/api/breakdown?period=alltime">All Time</a>
</div>

${summaryHtml}
${chartHtml}

<h2>Top Pages</h2>
<table>
  <tr><th>Page</th><th>Views</th></tr>
  ${pages.slice(0, 30).map(pg => `<tr><td class="page-path">${pg.page}</td><td>${pg.hits}</td></tr>`).join("")}
</table>

<div class="refresh">Last refreshed: ${now.toISOString().replace("T", " ").slice(0, 19)} UTC</div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export const config = { path: "/api/breakdown" };
