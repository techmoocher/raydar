// Dev-only static server: node tools/serve.mjs [port]
// Also fakes the email Apps Script at POST /__mock-mail by running the real
// tools/email-apps-script.gs with stand-ins for Google's services. The last
// email it "sent" is at /__mock-mail/last.html.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createHash } from "node:crypto";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2]) || 5173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

// ---------- mock mailer ----------

const cache = new Map(); // shared across requests so the rate limit is testable
let lastHtml = "<p>No mail sent yet.</p>";

async function mockMail(body) {
  let sent = null;
  const blob = (bytes, type, name) => ({
    bytes,
    type,
    name,
    getBytes: () => bytes,
    copyBlob() {
      return blob(bytes, type, name);
    },
    setName(n) {
      this.name = n;
      return this;
    },
  });
  const sandbox = {
    console,
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" },
      computeDigest: (alg, s) => [...createHash(alg).update(s).digest()],
      base64Encode: (bytes) => Buffer.from(bytes.map((b) => b & 255)).toString("base64"),
      base64Decode: (s) => [...Buffer.from(s, "base64")].map((b) => (b > 127 ? b - 256 : b)),
      newBlob: blob,
    },
    CacheService: {
      getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }),
    },
    MailApp: {
      getRemainingDailyQuota: () => 100,
      sendEmail: (opts) => {
        sent = opts;
      },
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => "https://example.github.io/hiddengems-hackathon/" }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(await readFile(join(root, "tools/email-apps-script.gs"), "utf8"), sandbox);
  const out = sandbox.doPost({ postData: { contents: body } });
  if (sent) {
    const img = Buffer.from(sent.inlineImages.page.bytes.map((b) => b & 255)).toString("base64");
    lastHtml = sent.htmlBody.replace("cid:page", `data:image/jpeg;base64,${img}`);
    console.log(`[mock-mail] to=${sent.to} subject="${sent.subject}" image=${Math.round(img.length * 0.75 / 1024)}KB`);
  }
  return out.text;
}

// ---------- server ----------

function readBody(req) {
  return new Promise((res, rej) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => res(Buffer.concat(chunks).toString("utf8")));
    req.on("error", rej);
  });
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);

  if (path === "/__mock-mail" && req.method === "POST") {
    try {
      const text = await mockMail(await readBody(req));
      res.writeHead(200, { "Content-Type": "application/json" }).end(text);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "application/json" }).end('{"ok":false,"error":"server"}');
    }
    return;
  }
  if (path === "/__mock-mail/last.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }).end(lastHtml);
    return;
  }

  const file = normalize(join(root, path.endsWith("/") ? path + "index.html" : path));
  if (!file.startsWith(normalize(root))) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
