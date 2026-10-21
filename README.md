# Raydar

An 8-bit scavenger hunt around Bucknell, guided by Ray Bucknell, a pixel-art
bison with a few stories to tell. Solve a riddle, find Ray's card, and take a
photo to add a memory to his book.

Built for the Bucknell App Makerspace **Hidden Gems: The Best of Bucknell**
contest in October 2026. Open it on your phone; there's nothing to install
and no account to create.

**Current demo:** Taylor Hall is playable. The other eleven stops are
placeholders while the rest of the hunt comes together.

## Try it locally

With Node.js 18 or newer:

```bash
node tools/serve.mjs 5173
```

Open <http://localhost:5173>. No dependencies or build step needed.

## Documentation

Setup, content editing, email, and hosting instructions live in the
[documentation site](https://techmoocher.github.io/raydar.docs/), maintained
in [techmoocher/raydar.docs](https://github.com/techmoocher/raydar.docs).

The [game](https://techmoocher.github.io/raydar/) publishes from this repository's
`main` branch. The docs publish independently from `main` in `raydar.docs`.

## License

This project is licensed under the [MIT License](./LICENSE).

Ray's art and music are original to this project. His design
is inspired by Bucknell's Bucky the Bison; this project is not affiliated
with Bucknell.
