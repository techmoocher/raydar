// Emails a player their page of Ray's book. Setup: https://techmoocher.github.io/raydar.docs/#email

var MAX_PER_ADDRESS = 3;
var WINDOW_SECONDS = 6 * 60 * 60;
var MAX_IMAGE_BYTES = 3 * 1024 * 1024;

var C = {
  night: "#001E3A", blue: "#003865", blueHi: "#2F6DA3", orange: "#E87722",
  orangeHi: "#FFB26B", paper: "#FFF4E0", ink: "#0B0F1A", gem: "#6FE3FF",
};
var MONO = "'Courier New', Courier, monospace";

function doGet() {
  return json_({ ok: true, hello: "Ray's mailbox is open." });
}

function doPost(e) {
  try {
    var data = parse_(e && e.postData && e.postData.contents);
    if (!data) return json_({ ok: false, error: "invalid" });

    var cache = CacheService.getScriptCache();
    var key = "r:" + Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.to.toLowerCase())
    );
    var count = Number(cache.get(key) || 0);
    if (count >= MAX_PER_ADDRESS) return json_({ ok: false, error: "rate" });
    if (MailApp.getRemainingDailyQuota() < 2) return json_({ ok: false, error: "quota" });

    var image = Utilities.newBlob(data.imageBytes, "image/jpeg", "rays-book.jpg");
    var site = PropertiesService.getScriptProperties().getProperty("SITE_URL") || "";
    var mail = buildEmail_(data, site);

    MailApp.sendEmail({
      to: data.to,
      subject: mail.subject,
      body: mail.text,
      htmlBody: mail.html,
      name: "Ray Bucknell",
      inlineImages: { page: image },
      attachments: [image.copyBlob().setName(mail.fileName)],
    });

    cache.put(key, String(count + 1), WINDOW_SECONDS);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  }
}

function parse_(raw) {
  if (!raw || raw.length > 6 * 1024 * 1024) return null;
  var d;
  try {
    d = JSON.parse(raw);
  } catch (e) {
    return null;
  }
  var to = String(d.to || "").trim();
  if (to.length > 254 || !/^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]{2,}$/.test(to)) return null;

  var name = clean_(d.name, 12).toUpperCase() || "PLAYER";
  var total = Math.min(Math.max(parseInt(d.total, 10) || 12, 1), 20);
  if (!Array.isArray(d.gems) || d.gems.length < 1 || d.gems.length > 20) return null;
  var gems = d.gems.map(function (g) {
    return {
      n: Math.min(Math.max(parseInt(g.n, 10) || 0, 0), 99),
      name: clean_(g.name, 40),
      found: g.found === true,
      at: clean_(g.at, 40),
    };
  });

  var b64 = String(d.image || "");
  if (!b64 || b64.length > MAX_IMAGE_BYTES * 1.4) return null;
  var bytes = Utilities.base64Decode(b64);
  // JPEG files start with FF D8 (bytes are signed in Apps Script).
  if (bytes.length > MAX_IMAGE_BYTES || bytes[0] !== -1 || bytes[1] !== -40) return null;

  return { to: to, name: name, total: total, gems: gems, imageBytes: bytes };
}

function clean_(s, max) {
  return String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F<>]/g, "").trim().slice(0, max);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function pad2_(n) {
  return n < 10 ? "0" + n : String(n);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Tables and inline styles for Gmail and Outlook.
function buildEmail_(d, site) {
  var found = d.gems.filter(function (g) { return g.found; }).length;
  var all = found >= d.total;
  var score = pad2_(found) + "/" + pad2_(d.total);
  var subject = d.name + "'s page in Ray's book (" + score + " gems)";
  var fileName = "rays-book-" + d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".jpg";

  var note = all
    ? "Here's your page in my book. You found all " + d.total + ". Every first-year walks in through the gates, every senior walks out, and now you're in my book for good."
    : "Here's your page in my book. You found " + found + " of my " + d.total + " gems. Every photo below is a spot I never want you to forget. Come back for the rest anytime.";

  var safeSite = /^https:\/\//.test(site) ? site : "";

  var pips = d.gems.map(function (g) {
    return '<td width="14" height="14" style="width:14px;height:14px;background:' + (g.found ? C.gem : C.blueHi) +
      ';font-size:0;line-height:0;">&nbsp;</td><td width="6" style="width:6px;font-size:0;">&nbsp;</td>';
  }).join("");

  var rows = d.gems.map(function (g) {
    var bg = g.found ? C.paper : C.blue;
    var fg = g.found ? C.ink : C.blueHi;
    var badgeBg = g.found ? C.orange : C.night;
    var badgeFg = g.found ? C.ink : C.blueHi;
    return '' +
      '<tr><td style="padding:0 0 8px 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + bg + ';border:4px solid ' + C.ink + ';">' +
      '<tr>' +
      '<td width="56" align="center" style="width:56px;background:' + badgeBg + ';color:' + badgeFg + ';font:bold 16px ' + MONO + ';padding:12px 0;">' + pad2_(g.n) + '</td>' +
      '<td style="padding:12px 14px;color:' + fg + ';font:bold 15px ' + MONO + ';letter-spacing:1px;text-transform:uppercase;">' +
      (g.found ? esc_(g.name) : "???") + '</td>' +
      '<td align="right" style="padding:12px 14px;color:' + (g.found ? C.blue : C.blueHi) + ';font:13px ' + MONO + ';white-space:nowrap;">' +
      (g.found ? esc_(g.at) : "NOT YET") + '</td>' +
      '</tr></table></td></tr>';
  }).join("");

  var button = safeSite
    ? '<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 0;">' +
      '<tr><td style="background:' + C.orange + ';border:4px solid ' + C.ink + ';border-top-color:' + C.orangeHi + ';">' +
      '<a href="' + esc_(safeSite) + '" style="display:inline-block;padding:16px 28px;color:' + C.ink +
      ';font:bold 16px ' + MONO + ';letter-spacing:2px;text-decoration:none;">' +
      (all ? "PLAY AGAIN &#9656;" : "KEEP HUNTING &#9656;") + '</a></td></tr></table>'
    : "";

  var html = '' +
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="dark light"><title>' + esc_(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + C.night + ';">' +
    '<div style="display:none;max-height:0;overflow:hidden;">' + esc_(found + " of " + d.total + " gems found. Your photos are inside.") + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.night + ';">' +
    '<tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">' +

    // Header
    '<tr><td align="center" style="padding:16px 0 8px;">' +
    '<div style="font:bold 40px ' + MONO + ';letter-spacing:8px;color:' + C.paper + ';text-shadow:4px 4px 0 ' + C.blueHi + ';">HIDDEN</div>' +
    '<div style="font:bold 52px ' + MONO + ';letter-spacing:10px;color:' + C.orange + ';text-shadow:4px 4px 0 ' + C.ink + ';">GEMS</div>' +
    '<div style="font:bold 13px ' + MONO + ';letter-spacing:4px;color:' + C.gem + ';padding-top:8px;">RAYDAR</div>' +
    '</td></tr>' +

    // Ray's note
    '<tr><td style="padding:16px 0;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.blue + ';border:4px solid ' + C.ink + ';border-top-color:' + C.blueHi + ';">' +
    '<tr><td style="padding:18px 20px;">' +
    '<div style="font:bold 13px ' + MONO + ';letter-spacing:3px;color:' + C.orangeHi + ';padding-bottom:10px;">RAY</div>' +
    '<div style="font:18px/1.45 ' + MONO + ';color:' + C.paper + ';">Hey ' + esc_(d.name) + ',<br><br>' + esc_(note) + '<br><br>&mdash; Ray &#9660;</div>' +
    '</td></tr></table></td></tr>' +

    // Score
    '<tr><td align="center" style="padding:4px 0 16px;">' +
    '<div style="font:bold 22px ' + MONO + ';letter-spacing:3px;color:' + C.orange + ';padding-bottom:10px;">GEMS ' + score + '</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>' + pips + '</tr></table>' +
    '</td></tr>' +

    // Collage
    '<tr><td align="center" style="padding:8px 0 20px;">' +
    '<img src="cid:page" width="560" alt="' + esc_(d.name) + '\'s page in Ray\'s book: a collage of every gem photo" ' +
    'style="display:block;width:100%;max-width:560px;height:auto;border:4px solid ' + C.ink + ';outline:4px solid ' + C.blueHi + ';">' +
    '</td></tr>' +

    // Gem list
    '<tr><td style="padding:0 0 8px;font:bold 13px ' + MONO + ';letter-spacing:3px;color:' + C.orangeHi + ';">THE GEMS</td></tr>' +
    '<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rows + '</table></td></tr>' +

    // Button + footer
    '<tr><td align="center" style="padding:20px 0 8px;">' + button + '</td></tr>' +
    '<tr><td align="center" style="padding:24px 8px 8px;font:12px/1.6 ' + MONO + ';color:' + C.blueHi + ';">' +
    'RAYDAR &middot; RAY BUCKNELL&#39;S HUNT<br>You asked Ray to mail you your page from Raydar. He won\'t write again unless you ask.' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';

  var text = "Hey " + d.name + ",\n\n" + note + "\n\n— Ray\n\nGEMS " + score + "\n\n" +
    d.gems.map(function (g) {
      return pad2_(g.n) + "  " + (g.found ? g.name + "  (" + g.at + ")" : "???");
    }).join("\n") +
    (safeSite ? "\n\nKeep hunting: " + safeSite : "") +
    "\n\nYour page is attached as a picture.";

  return { subject: subject, html: html, text: text, fileName: fileName };
}
