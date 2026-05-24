import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "docs/proposal.md",
  "docs/assets/machinepay-grid-proof-demo.png",
  "docs/assets/machinepay-grid-demo.png",
  "docs/assets/machinepay-grid-mobile-top.png",
  "docs/assets/machinepay-grid-mobile-mid.png",
];

const requiredHtmlSnippets = [
  '<link rel="stylesheet" href="./styles.css" />',
  '<script src="./app.js"></script>',
  'id="pauseToggle"',
  'id="forceBuyButton"',
  'id="ledgerList"',
  'aria-label="Architecture"',
];

const requiredAppSnippets = [
  "authorizePayment",
  "setInterval",
  "gatewayBalance",
  "settlementStatus",
  "ledgerBadge",
  "drawChart",
];

const requiredProposalSnippets = [
  "Circle Agent Wallets",
  "Gateway or Nanopayments",
  "Arc Testnet",
  "USDC",
];

async function assertFileExists(path) {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`Missing required file: ${path}`);
  }
}

function assertIncludes(label, content, snippets) {
  const missing = snippets.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`${label} is missing: ${missing.join(", ")}`);
  }
}

function assertNoDraftMarkers(label, content) {
  const forbidden = ["TODO", "FIXME", "console.log"];
  const found = forbidden.filter((token) => content.includes(token));
  if (found.length) {
    throw new Error(`${label} contains draft marker(s): ${found.join(", ")}`);
  }
}

for (const file of requiredFiles) {
  await assertFileExists(file);
}

const html = await readFile("index.html", "utf8");
const app = await readFile("app.js", "utf8");
const readme = await readFile("README.md", "utf8");
const proposal = await readFile("docs/proposal.md", "utf8");

assertIncludes("index.html", html, requiredHtmlSnippets);
assertIncludes("app.js", app, requiredAppSnippets);
assertIncludes("docs/proposal.md", proposal, requiredProposalSnippets);
assertIncludes("README.md", readme, ["docs/assets/machinepay-grid-proof-demo.png", "python3 -m http.server 4173"]);

assertNoDraftMarkers("index.html", html);
assertNoDraftMarkers("app.js", app);
assertNoDraftMarkers("styles.css", await readFile("styles.css", "utf8"));
assertNoDraftMarkers("README.md", readme);
assertNoDraftMarkers("docs/proposal.md", proposal);

console.info("MachinePay Grid repo checks passed.");
