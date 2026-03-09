# Thinking in R

[![Book status](https://img.shields.io/badge/book-published-brightgreen)](https://gillescolling.com/thinking-in-r/)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

A free, open-source book that teaches R as a functional programming language. Five parts, 33 chapters, from first function call to metaprogramming and package development.

R descends from lambda calculus through Scheme and S. This book follows that lineage: everything is an expression, every expression returns a value, functions are values. Understanding the design makes vectorization, pipes, tidyverse, and ggplot2 click into place.

No programming experience is assumed.

**[Read the book online](https://gillescolling.com/thinking-in-r/)**

## Structure

- **Foundations** (ch. 1--9): computation models, vectors, functions, logic, algorithms
- **Working with data** (ch. 10--17): lists, data frames, strings, I/O, dplyr, tidy data, ggplot2
- **Thinking functionally** (ch. 18--23): closures, map/reduce, function factories, recursion, lazy evaluation
- **The type system** (ch. 24--27): S3/S7 objects, contracts, metaprogramming, building a DSL
- **Going further** (ch. 28--33): performance, R internals, C++/Rust/Python interop, packages, reproducibility

## Contributing

Spotted a typo, unclear explanation, or broken code? [Open an issue](https://github.com/gcol33/thinking-in-r/issues) or submit a pull request.

## Building locally

The book is built with [Quarto](https://quarto.org/).

```bash
quarto render
quarto preview   # live reload
```

## License

Text: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) · Code: [MIT](https://opensource.org/licenses/MIT)

## Citation

```bibtex
@book{thinking-in-r,
  author = {Colling, Gilles},
  title  = {Thinking in R},
  year   = {2026},
  url    = {https://gillescolling.com/thinking-in-r/}
}
```

## Support

If this book helped you, [buying me a coffee](https://buymeacoffee.com/gcol33) is a nice way to say thanks.
