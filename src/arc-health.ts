import { createPublicClient, http, formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { ARC_CHAIN_ID, ARC_GATEWAY_WALLET, ARC_RPC_URL, ARC_USDC_ADDRESS } from "./config";

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
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC_URL),
});

const chainId = await client.getChainId();
if (chainId !== ARC_CHAIN_ID) {
  throw new Error(`Unexpected Arc chain id ${chainId}; expected ${ARC_CHAIN_ID}.`);
}

const [blockNumber, usdcSymbol, usdcDecimals, gatewayCode] = await Promise.all([
  client.getBlockNumber(),
  client.readContract({ address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "symbol" }),
  client.readContract({ address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "decimals" }),
  client.getBytecode({ address: ARC_GATEWAY_WALLET }),
]);

const addressToCheck = process.env.ARC_ADDRESS as `0x${string}` | undefined;
const walletBalance = addressToCheck
  ? await client.readContract({
      address: ARC_USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addressToCheck],
    })
  : undefined;

console.log(
  JSON.stringify(
    {
      ok: true,
      chainId,
      blockNumber: blockNumber.toString(),
      rpcUrl: ARC_RPC_URL,
      usdc: {
        address: ARC_USDC_ADDRESS,
        symbol: usdcSymbol,
        decimals: usdcDecimals,
        checkedBalance: walletBalance === undefined ? null : formatUnits(walletBalance, usdcDecimals),
      },
      gatewayWallet: {
        address: ARC_GATEWAY_WALLET,
        hasCode: Boolean(gatewayCode && gatewayCode !== "0x"),
      },
    },
    null,
    2,
  ),
);
