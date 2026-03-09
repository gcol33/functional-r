# Thinking in R

[![Book status](https://img.shields.io/badge/book-in%20progress-orange)](https://gillescolling.com/thinking-in-r/)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Learn R the way it was meant to be used.**

Most R books teach R as a statistics tool: load data, run a test, make a plot, copy-paste until it works. This book teaches R as a *language*, one built on functions, composition, and mathematical thinking. It starts from scratch but never talks down. By the end, you don't just use R; you understand it.

Read the book online at **[gillescolling.com/thinking-in-r](https://gillescolling.com/thinking-in-r/)**.

## Why this book

R is a functional programming language descended from Scheme. Everything in R is an expression, every expression returns a value, and functions are values. Once you see this, everything clicks: vectorization, pipes, formulas, tidyverse, ggplot2. They're not magic; they're consequences of the language's design.

No existing free book takes you from zero to deep understanding of R as a language. [R for Data Science](https://r4ds.hadley.nz/) teaches tidyverse workflows, not the language itself. [Advanced R](https://adv-r.hadley.nz/) is a reference for experts, not accessible to beginners. This book fills the gap: standalone, no prerequisites, no assumed reading.

## Structure

The book is organized in five parts and 33 chapters:

- **Foundations** (ch. 1-9): computation models, vectors, functions, logic, algorithms
- **Working with data** (ch. 10-17): lists, data frames, strings, I/O, dplyr, tidy data, ggplot2
- **Thinking functionally** (ch. 18-23): closures, map/reduce, function factories, recursion, lazy evaluation
- **The type system** (ch. 24-27): S3/S7 objects, contracts, metaprogramming, building a DSL
- **Going further** (ch. 28-33): performance, R internals, C++/Rust/Python interop, packages, reproducibility

No programming experience is assumed. By the end, you will have written real code, understood functional programming, and seen ideas that transfer to any language.

## Building locally

The book is built with [Quarto](https://quarto.org/).

```bash
quarto render
quarto preview   # live reload
```

## Contributing

Spotted a typo, unclear explanation, or broken code example? [Open an issue](https://github.com/gcol33/thinking-in-r/issues) or submit a pull request. Contributions are welcome.

## Support

> "Software is like sex: it's better when it's free." -- Linus Torvalds

I'm a PhD student who writes R books and packages in my free time because I believe good tools should be free and open.

If this book helped you learn something, buying me a coffee is a nice way to say thanks.

[![Buy Me A Coffee](https://img.shields.io/badge/-Buy%20me%20a%20coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/gcol33)

## License

Text: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
Code: [MIT](https://opensource.org/licenses/MIT)

## Citation

```bibtex
@book{thinking-in-r,
  author = {Colling, Gilles},
  title = {Thinking in R},
  year = {2026},
  url = {https://gillescolling.com/thinking-in-r/}
}
```
