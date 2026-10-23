// Apps Script /exec URL.
// Empty turns email off.
// More about setup: https://techmoocher.github.io/raydar.docs/#email

const DEPLOYED_MAILER = "https://script.google.com/macros/s/AKfycbyz6ytwtKdp4gEDibyWLjUMlmtYHfs3urIohxdRem-T-MLtFUWcLOlSVUVDMRePxUQ/exec";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

export const EMAIL_ENDPOINT = DEPLOYED_MAILER || (isLocal ? "/__mock-mail" : "");

// Linked from the title screen.
export const DOCS_URL = "https://techmoocher.github.io/raydar.docs/";
export const REPO_URL = "https://github.com/techmoocher/raydar";

// Localhost only: open http://localhost:5173/?nogps to skip the location check off campus.
export const SKIP_GPS = isLocal && new URLSearchParams(location.search).has("nogps");
