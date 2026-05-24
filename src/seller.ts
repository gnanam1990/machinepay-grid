import express from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import { createPublicClient, formatUnits, http } from "viem";
import { arcTestnet } from "viem/chains";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  ARC_CAIP2,
  ARC_CHAIN_ID,
  ARC_GATEWAY_WALLET,
  ARC_RPC_URL,
  ARC_USDC_ADDRESS,
  CIRCLE_GATEWAY_FACILITATOR_URL,
  DEFAULT_POWER_SECONDS,
  DEFAULT_RESOURCE_PRICE_USD,
  getSellerAddress,
  isDemoSellerAddress,
} from "./config";

type PaidRequest = express.Request & {
  payment?: {
    verified: boolean;
    payer: string;
    amount: string;
    network: string;
    transaction?: string;
  };
};

const app = express();
const port = Number(process.env.PORT || 3337);
const sellerAddress = getSellerAddress();
const priceUsd = DEFAULT_RESOURCE_PRICE_USD;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC_URL),
});

const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;

app.use(express.json());
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, PAYMENT-SIGNATURE");
  res.setHeader("Access-Control-Expose-Headers", "PAYMENT-REQUIRED, PAYMENT-RESPONSE");
  next();
});

const gateway = createGatewayMiddleware({
  sellerAddress,
  networks: [ARC_CAIP2],
  facilitatorUrl: CIRCLE_GATEWAY_FACILITATOR_URL,
  description: "MachinePay Grid solar power window",
});

function getTelemetry() {
  const minute = Math.floor(Date.now() / 60_000);
  const wave = Math.sin(minute * 0.7);
  const availableWatts = Math.round(410 + wave * 70);

  return {
    seller: "Solar Node A17",
    resource: "10 seconds of metered power",
    availableWatts,
    utilizationPct: Math.max(28, Math.min(92, Math.round(62 + wave * 17))),
    priceUsd,
    seconds: DEFAULT_POWER_SECONDS,
  };
}

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    mode: isDemoSellerAddress() ? "demo-seller-address" : "real-seller-address",
    sellerAddress,
    priceUsd,
    arc: {
      chainId: ARC_CHAIN_ID,
      network: ARC_CAIP2,
      rpcUrl: ARC_RPC_URL,
      usdc: ARC_USDC_ADDRESS,
      gatewayWallet: ARC_GATEWAY_WALLET,
    },
    circle: {
      facilitatorUrl: CIRCLE_GATEWAY_FACILITATOR_URL,
      paymentProtocol: "x402",
      rail: "Circle Gateway Nanopayments",
    },
  });
});

app.get("/api/arc-health", async (_, res, next) => {
  try {
    const [chainId, blockNumber, usdcSymbol, usdcDecimals, gatewayCode] = await Promise.all([
      publicClient.getChainId(),
      publicClient.getBlockNumber(),
      publicClient.readContract({ address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "symbol" }),
      publicClient.readContract({ address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "decimals" }),
      publicClient.getBytecode({ address: ARC_GATEWAY_WALLET }),
    ]);

    res.json({
      ok: chainId === ARC_CHAIN_ID && Boolean(gatewayCode && gatewayCode !== "0x"),
      chainId,
      blockNumber: blockNumber.toString(),
      usdc: {
        address: ARC_USDC_ADDRESS,
        symbol: usdcSymbol,
        decimals: usdcDecimals,
      },
      gatewayWallet: {
        address: ARC_GATEWAY_WALLET,
        hasCode: Boolean(gatewayCode && gatewayCode !== "0x"),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/x402-proof", async (_, res, next) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/power`);
    const paymentRequired = response.headers.get("payment-required");

    if (!paymentRequired) {
      res.status(502).json({ ok: false, error: "Missing PAYMENT-REQUIRED header from paid resource." });
      return;
    }

    const decoded = JSON.parse(Buffer.from(paymentRequired, "base64").toString("utf8"));
    const requirement = decoded.accepts?.[0];

    res.json({
      ok: response.status === 402,
      status: response.status,
      paymentRequired,
      decoded,
      selectedRequirement: requirement,
      proof: {
        protocol: "x402",
        rail: "Circle Gateway Nanopayments",
        network: requirement?.network,
        asset: requirement?.asset,
        amount: requirement?.amount,
        payTo: requirement?.payTo,
        verifyingContract: requirement?.extra?.verifyingContract,
        domainName: requirement?.extra?.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/telemetry", (_, res) => {
  res.json({
    paid: false,
    ...getTelemetry(),
    note: "Free telemetry. Use /power for the paid x402 resource.",
  });
});

app.get("/", async (_, res, next) => {
  try {
    res.type("html").send(await readFile(join(process.cwd(), "index.html"), "utf8"));
  } catch (error) {
    next(error);
  }
});

app.get("/styles.css", async (_, res, next) => {
  try {
    res.type("css").send(await readFile(join(process.cwd(), "styles.css"), "utf8"));
  } catch (error) {
    next(error);
  }
});

app.get("/app.js", async (_, res, next) => {
  try {
    res.type("application/javascript").send(await readFile(join(process.cwd(), "app.js"), "utf8"));
  } catch (error) {
    next(error);
  }
});

app.get("/power", gateway.require(`$${priceUsd}`), (req: PaidRequest, res) => {
  const payment = req.payment;
  const paidAmount = payment ? formatUnits(BigInt(payment.amount), 6) : priceUsd;

  res.json({
    paid: true,
    ...getTelemetry(),
    deliveredAt: new Date().toISOString(),
    payment: {
      verified: payment?.verified ?? true,
      payer: payment?.payer,
      amountUsdc: paidAmount,
      network: payment?.network,
      transaction: payment?.transaction,
    },
    settlement: {
      rail: "Circle Gateway Nanopayments",
      arcNetwork: ARC_CAIP2,
      gatewayWallet: ARC_GATEWAY_WALLET,
    },
  });
});

const server = app.listen(port, () => {
  console.log(`MachinePay Grid seller API listening at http://localhost:${port}`);
  console.log(`Paid resource: http://localhost:${port}/power`);
  console.log(`Seller address: ${sellerAddress}${isDemoSellerAddress() ? " (demo placeholder)" : ""}`);
});

server.ref();
