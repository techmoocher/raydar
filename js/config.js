// Apps Script /exec URL. Empty turns email off. Setup: docs branch, #email.
const DEPLOYED_MAILER = "";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

export const EMAIL_ENDPOINT = DEPLOYED_MAILER || (isLocal ? "/__mock-mail" : "");
