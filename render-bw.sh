#!/usr/bin/env bash
# ---------------------------------------------------------------
# Render the black & white PDF for KDP B&W interior printing.
#
# Usage:
#   ./render-bw.sh            # render only
#   ./render-bw.sh --gs       # render + ghostscript grayscale pass
#
# The Quarto profile (_quarto-bw.yml) handles text, rules, code
# highlighting, and link colors. The optional ghostscript step
# additionally converts embedded raster/vector images to grayscale,
# producing a fully device-gray PDF suitable for KDP B&W upload.
# ---------------------------------------------------------------
set -euo pipefail

quarto render --profile bw --to pdf

if [[ "${1:-}" == "--gs" ]]; then
  in="docs/Thinking-in-R-BW.pdf"
  out="docs/Thinking-in-R-BW-gray.pdf"
  gs \
    -sDEVICE=pdfwrite \
    -sProcessColorModel=DeviceGray \
    -sColorConversionStrategy=Gray \
    -dOverrideICC \
    -dCompatibilityLevel=1.7 \
    -dNOPAUSE -dBATCH -dQUIET \
    -o "$out" "$in"
  mv "$out" "$in"
  echo "Ghostscript grayscale pass complete: $in"
fi
