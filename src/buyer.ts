import { mkdir, writeFile } from "node:fs/promises";
import { GatewayClient } from "@circle-fin/x402-batching/client";
import { ARC_RPC_URL, requirePrivateKey } from "./config";

const privateKey = requirePrivateKey();
const resourceUrl = process.env.BUYER_RESOURCE_URL || "http://localhost:3337/power";
const shouldPay = process.argv.includes("--pay");
const depositAmount = process.env.DEPOSIT_USDC || "0";

const client = new GatewayClient({
  chain: "arcTestnet",
  privateKey,
  rpcUrl: ARC_RPC_URL,
});

console.log(`Buyer wallet: ${client.address}`);
console.log(`Resource URL: ${resourceUrl}`);

const before = await client.getBalances();
console.log(`Wallet USDC: ${before.wallet.formatted}`);
console.log(`Gateway available: ${before.gateway.formattedAvailable}`);

const support = await client.supports(resourceUrl);
console.log(`Gateway batching supported: ${support.supported}`);
if (!support.supported) {
  console.log(`Support check error: ${support.error || "No Gateway batching payment option found."}`);
}

if (!shouldPay) {
  console.log("Dry check complete. Run npm run pay:real after funding .env PRIVATE_KEY to execute a payment.");
  process.exit(support.supported ? 0 : 1);
}

if (Number(depositAmount) > 0) {
  console.log(`Depositing ${depositAmount} USDC into Gateway on Arc Testnet...`);
  const deposit = await client.deposit(depositAmount);
  console.log(`Deposit tx: ${deposit.depositTxHash}`);
  if (deposit.approvalTxHash) console.log(`Approval tx: ${deposit.approvalTxHash}`);
}

console.log("Paying x402-protected resource through Circle Gateway Nanopayments...");
const payment = await client.pay(resourceUrl);
const after = await client.getBalances();

const receipt = {
  paid: true,
  resourceUrl,
  buyer: client.address,
  status: payment.status,
  amountUsdc: payment.formattedAmount,
  transaction: payment.transaction,
  data: payment.data,
  balances: {
    walletUsdc: after.wallet.formatted,
    gatewayAvailable: after.gateway.formattedAvailable,
  },
  createdAt: new Date().toISOString(),
};

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/latest-payment.json", JSON.stringify(receipt, null, 2));

console.log(JSON.stringify(receipt, null, 2));
