# Raydar

Welcome to **Raydar**, an 8-bit scavenger hunt around Bucknell's
campus.

Ray Bucknell, a pixel-art bison in a game-day jersey, will guide you to
twelve hidden spots. At each stop, solve his riddle, find one of his cards,
and take a photo with it. As you go, your photos fill up a page in Ray's
book.

The game was built for the Bucknell App Makerspace **Hidden Gems: The Best of
Bucknell** contest in October 2026.

You don't need to install anything, create an account, or download an app.
Just open the website on your phone and start exploring. The game is made
with plain HTML, CSS, and JavaScript, so there is no build step either.

## How to play

1. **Start the game.** Tap **PRESS START** and tell Ray your name. He'll also
   offer to email you your finished page, but that part is completely
   optional.
2. **Follow the map.** The orange marker shows you where to go next. Tap
   **GO** to read Ray's riddle. If you get stuck, tap **HINT** once for a
   small nudge or again for a bigger one.
3. **Show that you found it.** Look for one of Ray's cards near the location.
   Tap **I FOUND IT!**, hold the card in front of the place, and take a photo.
   The game will read the card's QR code. If the code won't scan, type the
   word printed beneath it instead.
4. **Add the gem to your collection.** Ray will share a memory about the
   location, and your photo will be added to his book.
5. **Save your page.** Open **Ray's book** and tap **SAVE PAGE** to save a
   picture of your collection. **EMAIL MY PAGE** can send it to your inbox.

You can also scan a card with your phone's regular camera app. Its link will
open the game at the right gem automatically.

## Run it locally

You only need [Node.js](https://nodejs.org/) 18 or newer.

```bash
node tools/serve.mjs 5173
```

Then open <http://localhost:5173>. For a phone-sized view, set your browser's
device toolbar to about 375 pixels wide.

The local server includes a mock email service, so **EMAIL MY PAGE** works
without any setup. The most recent mock email is available at
<http://localhost:5173/__mock-mail/last.html>.

### Handy testing shortcuts

- **Erase your save:** press and hold the title logo for about a second.
- **Pretend to scan a card:** open `/#/found/<gem-id>/<token>`. The IDs and
  tokens are listed in `js/data/gems.js`.

## Deploy to GitHub Pages

Raydar is a static website, which makes it a good fit for GitHub Pages.
The game uses hash routes such as `#/map`, so Pages does not need to serve
separate files for each screen.

1. **Push the repository to GitHub:**

   ```bash
   git remote add origin https://github.com/<your-user>/hiddengems-hackathon.git
   git push -u origin main
   ```

2. **Enable Pages.** In your GitHub repository, open **Settings → Pages**.
   Under **Build and deployment**, choose **Deploy from a branch**, select
   `main` and `/ (root)`, and click **Save**.

3. **Open the game.** After about a minute, it should be available at:

   ```text
   https://<your-user>.github.io/hiddengems-hackathon/
   ```

4. **Try it on a real phone.** Check that the camera opens when you tap
   **SNAP PHOTO**, photos are upright, and a card's QR code scans from about
   arm's length.

GitHub Pages serves the site over HTTPS, which phones require before a website
can use the camera or location. When you push updates to `main`, Pages will
redeploy automatically.

## Turn on "Email my page"

Email is optional. If it is not configured, **EMAIL MY PAGE** falls back to
**SAVE PAGE**, so players can still keep their picture.

The website itself does not send email. Instead, a small
[Google Apps Script](https://script.google.com/) sends the message from a
Google account. Setting it up takes about five minutes.

1. **Choose the sender account.** Emails come from the Google account that
   deploys the script, and players will see that address. A separate account
   with a name such as "Ray Bucknell" is a good choice.

2. **Create the script.** Sign in with that account at
   [script.google.com](https://script.google.com/), click **New project**, and
   replace the contents of `Code.gs` with `tools/email-apps-script.gs`. Save
   the project.

3. **Tell the script where the game lives.** Open **Project Settings** (the
   gear icon), find **Script properties**, and add:

   | Property | Value |
   | --- | --- |
   | `SITE_URL` | `https://<your-user>.github.io/hiddengems-hackathon/` |

   The **KEEP HUNTING** button in the email uses this URL. It must begin with
   `https://`.

4. **Deploy the script as a web app.** Choose **Deploy → New deployment**,
   select **Web app**, and use these settings:

   - **Execute as:** Me
   - **Who has access:** Anyone

   Click **Deploy**, then approve the permission to send email on your behalf.

5. **Connect the game.** Copy the web app URL ending in `/exec` into
   `js/config.js`:

   ```js
   const DEPLOYED_MAILER = "https://script.google.com/macros/s/…/exec";
   ```

   Commit and push the change. The live game can now send email.

6. **Test it.** Open the `/exec` URL in a browser. You should see:
   `{"ok":true,"hello":"Ray's mailbox is open."}`. Then send yourself a page
   from the game and check that the collage looks right in Gmail, Outlook, and
   iCloud.

If you edit the script later, go to **Deploy → Manage deployments**, edit the
deployment, and choose **New version**. Otherwise, the deployed web app will
continue running the old code.

### Email limits

- A personal Gmail account can send to about 100 recipients per day.
- The script allows three emails per address every six hours.
- It stops sending when the daily quota is nearly used up.

## Configuration

| What | Where | Notes |
| --- | --- | --- |
| Email service URL | `js/config.js` | Leave it empty to turn email off |
| Game content | `js/data/gems.js` | Riddles, hints, codes, memories, and GPS data |
| Colors and fonts | `css/tokens.css` | The game's 15 flat colors and sprite-only fur and horn colors |
| Music | `js/music.js` | Tracks written as text, one bar per line |
| Pixel art | `js/sprites.js` | Ray, the hall, and icons as editable grids |

`js/data/gems.js` is the single source of truth for the game's content. The
app, the planned card printer, and the answer key can all use the same data,
so each fact only needs to be changed once.

## How it works

- **Proof photos:** Photos are decoded on the phone with
  [jsQR](https://github.com/cozmo/jsQR). Because a card held in front of a
  building can be small in the frame, the game tries the full photo, the
  center of the photo, and a smaller copy. The same photo becomes the
  player's keepsake.
- **Saving:** Progress and photos are stored in the browser's IndexedDB, so
  they survive closing the tab. If the browser does not provide storage, the
  game keeps running in memory and tells the player.
- **Sound:** Music and sound effects are created live with the Web Audio API
  in an 8-bit style, so there are no audio files to download. Music starts
  after the first tap, pauses when the tab is hidden, and follows the game's
  screens. The **♪** button opens the sound controls.
- **Your page:** **SAVE PAGE** and **EMAIL MY PAGE** both create a 1080×1920
  collage on a canvas. Saving uses the phone's share sheet when available and
  downloads the image otherwise.
- **Email:** The game sends the mail service only the player's name and
  address, the list of gems and their completion times, and the collage
  image. The script builds the email itself and does not accept HTML from the
  browser.
- **Motion:** Animations use frame-by-frame steps to match the retro-console
  look. The phone's "reduce motion" setting disables them.

## Privacy

- Photos stay on the phone unless the player taps **EMAIL MY PAGE**.
- An email address is optional. It is stored only on the player's phone and
  is sent only when the player asks for their page.
- The mail script keeps no records. Its six-hour rate limit uses a one-way
  hash of the address.
- Location is used only for the optional "you're getting warmer" signal
  bars, and only after Ray asks. The game works without location access.

## Project layout

```text
index.html                 the single page
css/                       design tokens, pixel components, screen layouts
js/app.js                  router and screens
js/data/gems.js            all game content
js/                        storage, proof, photos, sound, sprites, collage, email
tools/serve.mjs             local server with a mock mail service
tools/email-apps-script.gs  the mail service for script.google.com
vendor/                    pinned third-party libraries
assets/fonts/              self-hosted pixel fonts
```

## License

This project is open source under the MIT License. See [LICENSE](LICENSE).

**Disclaimer:** Ray Bucknell, the pixel art, and the music are original to
this project. Ray's design is inspired by Bucknell's Bucky the Bison mascot,
but this project is not affiliated with Bucknell or its mascot.
