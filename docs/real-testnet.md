# Real Arc/Circle Testnet Guide

This project includes a real Circle Gateway Nanopayments path on Arc Testnet.

## What is real

- `src/seller.ts` starts an Express API with Circle Gateway x402 middleware.
- `/power` is a paid resource and returns `402 Payment Required` when unpaid.
- `src/buyer.ts` uses `GatewayClient` from `@circle-fin/x402-batching/client`.
- `src/arc-health.ts` verifies Arc Testnet RPC, USDC, and Gateway Wallet contract code.

## What needs your local credentials

- `SELLER_ADDRESS`: wallet that receives testnet USDC payments.
- `PRIVATE_KEY`: funded buyer EOA used to sign Gateway deposits and x402 payment authorizations.
- Testnet USDC from the Circle Faucet on Arc Testnet.

Do not paste private keys into chat, commits, screenshots, or issue comments. Put them only in local `.env`.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```bash
SELLER_ADDRESS=0xYourSellerWalletAddress
PRIVATE_KEY=0xYourFundedBuyerPrivateKey
RESOURCE_PRICE_USD=0.0001
BUYER_RESOURCE_URL=http://localhost:3337/power
DEPOSIT_USDC=0
```

## Checks

Verify Arc Testnet:

```bash
npm run arc:check
```

Start the seller API:

```bash
npm run server
```

In another terminal, verify x402 negotiation:

```bash
curl -i http://localhost:3337/power
```

Expected unpaid result:

```text
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: ...
```

Run buyer dry mode:

```bash
npm run buyer
```

Execute a real payment:

```bash
npm run pay:real
```

If the buyer has no Gateway balance, set `DEPOSIT_USDC=1` in `.env` first. The deposit is an onchain Arc Testnet transaction and requires testnet USDC for gas.

## Output

Successful real payments write:

```text
artifacts/latest-payment.json
```

That receipt contains the buyer address, paid amount, Gateway transaction id, returned resource data, and updated Gateway balance.
