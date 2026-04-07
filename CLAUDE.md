# Thinking in R — Development Notes

## Deployment

- Book hosted on **GitHub Pages** at `https://gillescolling.com/thinking-in-r/` as a project page under the user site `gcol33/gcol33.github.io` (which serves `gillescolling.com`). No CNAME / DNS record needed for the book — GH Pages routes project repos onto the user site's custom domain at `/<repo>/` automatically. Project Pages config has `cname` cleared so it doesn't redirect to a subdomain.
- **Netlify** still runs at `thinking-in-r.netlify.app` and only matters for the `/api/*` analytics functions. `analytics.html` calls them via absolute `https://thinking-in-r.netlify.app/api/*` URLs, so tracking works from any origin (including the GH Pages subpath).
- The Netlify site still publishes `docs/` as a side-effect of the existing `netlify.toml`, so `thinking-in-r.netlify.app` is a hidden mirror. Harmless. Could be removed later by stripping the `publish` line or pointing it at a stub directory.
- **Always re-render before pushing**: run `quarto render --to html` locally, then commit `docs/` along with source changes
- The `_date.lua` Lua filter auto-sets `date-modified` from the latest git commit
- Analytics: custom hit counter via Netlify Functions + Blobs
  - Dashboard: `thinking-in-r.netlify.app/api/dashboard`
  - Reset: `thinking-in-r.netlify.app/api/reset?key=reset-thinking-in-r-2026`

## Workflow

1. Edit `.qmd` source files
2. `quarto render --to html`
3. Commit source + `docs/`
4. Push to `main` — GitHub Pages auto-deploys

## PDF

- Render separately with `quarto render --to pdf` — never commit the PDF (it's sold separately)
- Covers: `covers/front-cover.tex` (front) and `covers/back-cover.tex` (back) are included via `_quarto.yml` (`include-before-body` / `include-after-body`)
- Cover images: `covers/cover1/front.png` and `covers/cover1/back.png` — uses PNG because LaTeX doesn't natively support SVG
- TikZ overlay places covers full-bleed on their own pages
