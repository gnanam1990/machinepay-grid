import type { Address } from "viem";

export const ARC_CHAIN_ID = 5042002;
export const ARC_CAIP2 = `eip155:${ARC_CHAIN_ID}`;
export const ARC_RPC_URL = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";
export const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Address;
export const ARC_GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as Address;
export const CIRCLE_GATEWAY_FACILITATOR_URL =
  process.env.GATEWAY_FACILITATOR_URL || "https://gateway-api-testnet.circle.com";

export const DEFAULT_RESOURCE_PRICE_USD = process.env.RESOURCE_PRICE_USD || "0.0001";
export const DEFAULT_POWER_SECONDS = 10;

export function getSellerAddress() {
  const envAddress = process.env.SELLER_ADDRESS;
  if (envAddress && /^0x[a-fA-F0-9]{40}$/.test(envAddress)) return envAddress as Address;

  return "0x000000000000000000000000000000000000dEaD" as Address;
}

export function requirePrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error("PRIVATE_KEY is required in .env and must be a 0x-prefixed EOA private key.");
  }

  return privateKey as `0x${string}`;
}

export function isDemoSellerAddress() {
  return getSellerAddress().toLowerCase() === "0x000000000000000000000000000000000000dead";
}
