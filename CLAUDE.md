# Thinking in R — Development Notes

## Deployment

- Book hosted on **Netlify** at `thinking-in-r.gillescolling.com` (serves `docs/` from `main`, alongside `/api/*` analytics functions)
- DNS: `thinking-in-r.gillescolling.com` is a CNAME to `thinking-in-r.netlify.app`
- GitHub Pages also builds `docs/` on every push (workflow `Deploy to GitHub Pages`), reachable at `gcol33.github.io/thinking-in-r/`, but not bound to the custom domain
- **TODO (Option B):** if we want to restore the original split (book on GitHub Pages, Netlify only for `/api/*`), change the DNS CNAME at the registrar from `thinking-in-r.netlify.app` to `gcol33.github.io`, then re-set the Pages custom domain via `gh api repos/gcol33/thinking-in-r/pages -X PUT -f cname=thinking-in-r.gillescolling.com -F https_enforced=true`. `analytics.html` already uses absolute `thinking-in-r.netlify.app/api/*` URLs so stats keep flowing across origins.
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
