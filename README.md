# Raydar

An 8-bit scavenger hunt around Bucknell. It starts with a call from Ray
Bucknell, a pixel-art bison who's been on this hill longer than most of the
bricks. Crack his riddles (or beat his minigames for a bonus hint), then go
find each spot.

Built for the Bucknell App Makerspace **Hidden Gems: The Best of Bucknell**
contest in October 2026. Open it on your phone; there's nothing to install
and no account to create.

**Current state:** all twelve stops are playable. Ten have Ray's number,
taken from campus histories and still to be checked on site; the food truck
and the quad need only the check-in.

## How a stop works

1. **Check in.** The phone's location has to put you at the stop, so keep
   location on for the whole hunt. With it off, the hunt waits behind a
   screen that shows how to turn it on.
2. **Ray's card or the number.** Scan Ray's card with the live camera. If
   the card is gone, type Ray's number instead, a year shown at the stop.
3. **Photo for the book.** Take a picture with the building. It's a
   keepsake, not a check; Ray stamps it **FOR THE BOOK** just for fun.

A missing card never blocks anyone, because the number always works. The
[walkthrough](https://techmoocher.github.io/raydar.docs/#play) covers the
whole game.

## Try it locally

With Node.js 18 or newer:

```bash
node tools/serve.mjs 5173
```

Open <http://localhost:5173>. No dependencies or build step needed. Off
campus, open <http://localhost:5173/?nogps> to skip the location check. That
switch only works on localhost.

## Documentation

Setup, content editing, email, and hosting instructions live in the
[documentation site](https://techmoocher.github.io/raydar.docs/), maintained
in [techmoocher/raydar.docs](https://github.com/techmoocher/raydar.docs). The
game's title screen links there too.

The [game](https://techmoocher.github.io/raydar/) publishes from this repository's
`main` branch. The docs publish independently from `main` in `raydar.docs`.

## License

This project is licensed under the [MIT License](./LICENSE).

Ray's art and music are original to this project. His design
is inspired by Bucknell's Bucky the Bison; this project is not affiliated
with Bucknell.
