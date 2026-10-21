// Site settings. Edit and push; no build step.

// The Google Apps Script web app URL, ending in /exec. See the deploy steps at
// the top of tools/email-apps-script.gs. Leave empty to turn email off:
// EMAIL MY PAGE then falls back to saving the page image.
const DEPLOYED_MAILER = "";

// On localhost, with no mailer deployed, tools/serve.mjs fakes one so the
// whole flow can be tested. The preview lands at /__mock-mail/last.html.
const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

export const EMAIL_ENDPOINT = DEPLOYED_MAILER || (isLocal ? "/__mock-mail" : "");
