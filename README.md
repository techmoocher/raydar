# Raydar

An 8-bit scavenger hunt around Bucknell. It starts with a call from Ray
Bucknell, a pixel-art bison who's been on this hill longer than most of the
bricks. Crack his riddles (or beat his minigames for a bonus hint), then go
find each spot.

Built for the Bucknell App Makerspace **Hidden Gems: The Best of Bucknell**
contest in October 2026. Open it on your phone; there's nothing to install
and no account to create.

**Current state:** all twelve stops are playable. Only Taylor Hall has Ray's
password so far; the other stops finish with the check-in and the photo until
their passwords are confirmed on site.

## How a stop works

1. **Check in.** The phone's location has to put you at the stop, so keep
   location on for the whole hunt. With it off, the hunt waits behind a
   screen that shows how to turn it on.
2. **Photo.** Snap the sign with the building's name. It goes on your page
   in Ray's book. Ray looks it over and stamps it **APPROVED**, but that's
   just for fun: the photo itself isn't checked.
3. **Password.** Type Ray's password, something written at the stop. If
   Ray's card is still there, a photo of its QR code skips this step.

Cards are a bonus, so a missing card never blocks anyone. The
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
