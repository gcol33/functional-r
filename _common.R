set.seed(1014)

knitr::opts_chunk$set(
  comment = "#>",
  collapse = TRUE,
  fig.retina = 1,
  fig.width = 5,
  fig.asp = 2 / 3,
  fig.show = "hold",
  out.width = "5in",
  # PDF output: cairo_pdf embeds all fonts (KDP rejects PDFs that
  # leave /Helvetica unembedded, which the default pdf() device does).
  # HTML output: keep PNG so the website still renders figures.
  dev = if (knitr::is_latex_output()) "cairo_pdf" else "png"
)

options(
  width = 77
)
