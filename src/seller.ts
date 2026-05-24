import express from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import { formatUnits } from "viem";
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

app.get("/telemetry", (_, res) => {
  res.json({
    paid: false,
    ...getTelemetry(),
    note: "Free telemetry. Use /power for the paid x402 resource.",
  });
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
