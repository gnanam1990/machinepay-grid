const state = {
  paused: false,
  cycle: 0,
  balance: 24,
  totalSpend: 0,
  powerBought: 0,
  authorizations: [],
  priceHistory: [],
  marginHistory: [],
  availablePower: 420,
  utilization: 61,
  spotPrice: 0.003,
};

const els = {
  pauseToggle: document.querySelector("#pauseToggle"),
  resetButton: document.querySelector("#resetButton"),
  forceBuyButton: document.querySelector("#forceBuyButton"),
  gatewayBalance: document.querySelector("#gatewayBalance"),
  settlementStatus: document.querySelector("#settlementStatus"),
  cycleCount: document.querySelector("#cycleCount"),
  availablePower: document.querySelector("#availablePower"),
  spotPrice: document.querySelector("#spotPrice"),
  utilization: document.querySelector("#utilization"),
  solarMode: document.querySelector("#solarMode"),
  agentDecision: document.querySelector("#agentDecision"),
  expectedMargin: document.querySelector("#expectedMargin"),
  revenueInput: document.querySelector("#revenueInput"),
  marginInput: document.querySelector("#marginInput"),
  limitInput: document.querySelector("#limitInput"),
  revenueValue: document.querySelector("#revenueValue"),
  marginValue: document.querySelector("#marginValue"),
  limitValue: document.querySelector("#limitValue"),
  totalSpend: document.querySelector("#totalSpend"),
  powerBought: document.querySelector("#powerBought"),
  authorizationCount: document.querySelector("#authorizationCount"),
  ledgerBadge: document.querySelector("#ledgerBadge"),
  ledgerList: document.querySelector("#ledgerList"),
  proofAuthId: document.querySelector("#proofAuthId"),
  proofRoute: document.querySelector("#proofRoute"),
  proofBatch: document.querySelector("#proofBatch"),
  proofPolicy: document.querySelector("#proofPolicy"),
  canvas: document.querySelector("#profitCanvas"),
};

const ctx = els.canvas.getContext("2d");

function money(value, digits = 6) {
  return Number(value).toFixed(digits);
}

function shortId() {
  return `auth_${Math.random().toString(16).slice(2, 8)}`;
}

function pseudoDigest(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const left = (hash >>> 0).toString(16).padStart(8, "0");
  const right = Math.abs(Math.imul(hash, 2654435761)).toString(16).padStart(8, "0").slice(0, 8);
  return `0x${left}${right}`;
}

function getControls() {
  return {
    revenue: Number(els.revenueInput.value),
    safetyMargin: Number(els.marginInput.value),
    hourlyLimit: Number(els.limitInput.value),
  };
}

function updateControls() {
  const { revenue, safetyMargin, hourlyLimit } = getControls();
  els.revenueValue.textContent = money(revenue, 4);
  els.marginValue.textContent = money(safetyMargin, 4);
  els.limitValue.textContent = money(hourlyLimit, 2);
}

function computePrice() {
  const wave = Math.sin(state.cycle * 0.82) * 0.00055;
  const jitter = (Math.random() - 0.5) * 0.00042;
  const utilizationPressure = (state.utilization - 55) * 0.000012;
  return Math.max(0.0012, Math.min(0.0068, 0.003 + wave + jitter + utilizationPressure));
}

function computeMachineTelemetry() {
  state.availablePower = Math.round(350 + Math.sin(state.cycle * 0.46) * 78 + Math.random() * 64);
  state.utilization = Math.round(52 + Math.sin(state.cycle * 0.31) * 18 + Math.random() * 12);
  state.spotPrice = computePrice();
}

function getHourlySpendWindow() {
  return state.authorizations.slice(0, 360).reduce((sum, item) => sum + item.amount, 0);
}

function authorizePayment(reason = "auto") {
  const amount = state.spotPrice;
  if (state.balance < amount) return false;

  const sequence = state.authorizations.length + 1;
  const id = shortId();
  const timestamp = new Date();
  const status = sequence % 4 === 0 ? "batched" : "verified";
  const arcBatch = status === "batched" ? `arc_batch_${String(Math.ceil(sequence / 4)).padStart(3, "0")}` : "pending";
  const digest = pseudoDigest(`${id}:${money(amount)}:${state.cycle}:${timestamp.toISOString()}`);
  const { hourlyLimit } = getControls();

  state.balance -= amount;
  state.totalSpend += amount;
  state.powerBought += 10;

  state.authorizations.unshift({
    id,
    amount,
    arcBatch,
    digest,
    reason,
    price: state.spotPrice,
    power: state.availablePower,
    timestamp,
    status,
    route: "Circle Nanopayments",
    policy: `${money(hourlyLimit, 2)} USDC/hour cap`,
  });

  return true;
}

function decide(force = false) {
  const { revenue, safetyMargin, hourlyLimit } = getControls();
  const expectedMargin = revenue - state.spotPrice - safetyMargin;
  const hourlySpend = getHourlySpendWindow();
  const underLimit = hourlySpend + state.spotPrice <= hourlyLimit;
  const shouldBuy = force || (expectedMargin > 0 && underLimit && state.availablePower > 320);

  if (shouldBuy && authorizePayment(force ? "manual" : "profitable")) {
    setDecision("Buying", "success");
    state.marginHistory.push(expectedMargin);
    return expectedMargin;
  }

  setDecision(underLimit ? "Waiting" : "Spend Limit", underLimit ? "warning" : "danger");
  state.marginHistory.push(expectedMargin);
  return expectedMargin;
}

function setDecision(text, tone) {
  els.agentDecision.textContent = text;
  els.agentDecision.className = `badge ${tone}`;
}

function tick(force = false) {
  if (!force) {
    state.cycle += 1;
    computeMachineTelemetry();
  }

  const expectedMargin = decide(force);
  state.priceHistory.push(state.spotPrice);

  if (state.priceHistory.length > 36) state.priceHistory.shift();
  if (state.marginHistory.length > 36) state.marginHistory.shift();

  updateView(expectedMargin);
}

function updateView(expectedMargin = 0) {
  els.gatewayBalance.textContent = money(state.balance);
  els.cycleCount.textContent = state.cycle;
  els.availablePower.textContent = state.availablePower;
  els.spotPrice.textContent = money(state.spotPrice, 4);
  els.utilization.textContent = state.utilization;
  els.expectedMargin.textContent = money(expectedMargin, 4);
  els.totalSpend.textContent = money(state.totalSpend);
  els.powerBought.textContent = state.powerBought;
  els.authorizationCount.textContent = state.authorizations.length;
  els.ledgerBadge.textContent = `${state.authorizations.filter((item) => item.status === "batched").length} Settled`;
  els.settlementStatus.textContent = state.authorizations.length ? "Batching" : "Ready";
  els.proofPolicy.textContent = `${money(getControls().hourlyLimit, 2)} USDC/hour cap`;

  els.solarMode.textContent = state.availablePower > 330 ? "Selling" : "Limited";
  els.solarMode.className = state.availablePower > 330 ? "badge success" : "badge warning";

  renderProof();
  renderLedger();
  drawChart();
}

function renderProof() {
  const latest = state.authorizations.find((item) => item.status === "batched") || state.authorizations[0];
  if (!latest) {
    els.proofAuthId.textContent = "Awaiting profitable cycle";
    els.proofRoute.textContent = "Nanopayments mock";
    els.proofBatch.textContent = "pending";
    return;
  }

  els.proofAuthId.textContent = latest.digest;
  els.proofRoute.textContent = latest.route;
  els.proofBatch.textContent = latest.arcBatch;
}

function renderLedger() {
  const items = state.authorizations.slice(0, 8);
  els.ledgerList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.innerHTML = `
      <div class="ledger-row"><strong>No payment authorizations yet</strong><span>watching</span></div>
      <div class="ledger-row"><span>Agent will buy when expected margin turns positive.</span><span></span></div>
    `;
    els.ledgerList.append(empty);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="ledger-row">
        <strong>${item.id}</strong>
        <span>${item.status}</span>
      </div>
      <div class="ledger-row">
        <span>${money(item.amount)} USDC for 10 sec</span>
        <span>${item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
      <div class="ledger-row">
        <span>${item.reason} buy at ${money(item.price, 4)} USDC</span>
        <span>${item.power} W</span>
      </div>
      <div class="ledger-row">
        <span>${item.route}</span>
        <span>${item.arcBatch}</span>
      </div>
    `;
    els.ledgerList.append(li);
  }
}

function drawChart() {
  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#edf6ef";
  ctx.fillRect(0, 0, width, height);

  drawGrid(width, height);
  drawLine(state.priceHistory, "#d98521", width, height, 0.001, 0.008);
  drawLine(state.marginHistory, "#167b88", width, height, -0.003, 0.006);
  drawZeroLine(width, height, -0.003, 0.006);

  ctx.fillStyle = "#171717";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText("Price", 18, 24);
  ctx.fillStyle = "#d98521";
  ctx.fillRect(56, 16, 18, 3);
  ctx.fillStyle = "#171717";
  ctx.fillText("Margin", 88, 24);
  ctx.fillStyle = "#167b88";
  ctx.fillRect(142, 16, 18, 3);
}

function drawGrid(width, height) {
  ctx.strokeStyle = "rgba(23, 23, 23, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += width / 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += height / 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawZeroLine(width, height, min, max) {
  const y = height - ((0 - min) / (max - min)) * height;
  ctx.strokeStyle = "rgba(47, 143, 88, 0.44)";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLine(values, color, width, height, min, max) {
  if (values.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();

  values.forEach((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / (max - min)) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function reset() {
  state.paused = false;
  state.cycle = 0;
  state.balance = 24;
  state.totalSpend = 0;
  state.powerBought = 0;
  state.authorizations = [];
  state.priceHistory = [];
  state.marginHistory = [];
  state.availablePower = 420;
  state.utilization = 61;
  state.spotPrice = 0.003;
  els.pauseToggle.classList.remove("is-paused");
  updateControls();
  setDecision("Watching", "muted");
  updateView(0);
}

els.pauseToggle.addEventListener("click", () => {
  state.paused = !state.paused;
  els.pauseToggle.classList.toggle("is-paused", state.paused);
  els.pauseToggle.setAttribute("aria-label", state.paused ? "Resume simulation" : "Pause simulation");
  els.pauseToggle.setAttribute("title", state.paused ? "Resume simulation" : "Pause simulation");
});

els.resetButton.addEventListener("click", reset);
els.forceBuyButton.addEventListener("click", () => tick(true));

for (const input of [els.revenueInput, els.marginInput, els.limitInput]) {
  input.addEventListener("input", () => {
    updateControls();
    const { revenue, safetyMargin } = getControls();
    updateView(revenue - state.spotPrice - safetyMargin);
  });
}

reset();
setInterval(() => {
  if (!state.paused) tick();
}, 2200);
