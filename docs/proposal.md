# MachinePay Grid Proposal

## One-line pitch

MachinePay Grid lets autonomous machines and AI agents buy electricity, compute, data, and services using USDC nanopayments, with Arc as the stablecoin-native settlement layer.

## Why this fits Arc

Arc is the settlement surface for high-frequency machine commerce. The project includes a live Arc Testnet health check and a real x402 paid API flow scoped to `eip155:5042002`.

## Why this fits Circle

Circle infrastructure becomes the payment layer for agents and machines. The real integration uses Circle Gateway Nanopayments: the seller API returns `402 Payment Required`, and the buyer uses `GatewayClient` on `arcTestnet` to sign and submit payment authorizations.

## MVP scope

- Simulated browser dashboard with dynamic power availability and price.
- Real Express seller API protected by Circle Gateway x402 middleware.
- Buyer script using `@circle-fin/x402-batching` on Arc Testnet.
- Arc health check verifying chain id, USDC, and Gateway Wallet contract code.

## Build roadmap

1. Fund a dedicated buyer EOA with Arc Testnet USDC from the Circle Faucet.
2. Run a real `npm run pay:real` payment against the seller API.
3. Show Gateway transaction IDs and ArcScan links in the browser ledger.
4. Add machine identity credentials and policy rules for spend limits.
5. Add a second resource type, such as API data or compute time, to prove this is a marketplace pattern and not only a solar demo.

## Demo narrative

The seller machine broadcasts a changing price for 10 seconds of power. The buyer agent compares expected revenue against the power cost and its safety margin. In real mode, the buyer pays the `/power` route through Circle Gateway Nanopayments and receives the paid resource only after the x402 authorization is accepted.
