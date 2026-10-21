// Apps Script /exec URL.
// Empty turns email off.
// More about setup: https://techmoocher.github.io/raydar.docs/#email

const DEPLOYED_MAILER = "https://script.google.com/macros/s/AKfycbyz6ytwtKdp4gEDibyWLjUMlmtYHfs3urIohxdRem-T-MLtFUWcLOlSVUVDMRePxUQ/exec";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

export const EMAIL_ENDPOINT = DEPLOYED_MAILER || (isLocal ? "/__mock-mail" : "");
