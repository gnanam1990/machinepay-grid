# MachinePay Grid Proposal

## One-line pitch

MachinePay Grid lets autonomous machines and AI agents buy electricity, compute, data, and services using USDC nanopayments, with Arc as the stablecoin-native settlement layer.

## Why this fits Arc

Arc is the settlement surface for high-frequency machine commerce. The demo shows a solar node publishing a live price signal, a buyer agent deciding whether power is profitable, and settlement batching toward Arc Testnet.

## Why this fits Circle

Circle infrastructure becomes the payment layer for agents and machines. The current MVP mocks USDC authorizations, but the production path is Circle Agent Wallets, Gateway or Nanopayments, policy controls, and Arc settlement proofs.

## MVP scope

- Simulated solar seller with dynamic power availability and price.
- Autonomous buyer agent with revenue, safety margin, and spend controls.
- USDC-style authorization ledger with verified and batched states.
- Responsive dashboard for live demos, grant review, and event pitches.

## Build roadmap

1. Replace mock buyer wallet with Circle-controlled test wallet.
2. Add Circle Gateway or Nanopayments API calls for real USDC payment authorization.
3. Write settlement events to Arc Testnet and show ArcScan links in the ledger.
4. Add machine identity credentials and policy rules for spend limits.
5. Add a second resource type, such as API data or compute time, to prove this is a marketplace pattern and not only a solar demo.

## Demo narrative

The seller machine broadcasts a changing price for 10 seconds of power. The buyer agent compares expected revenue against the power cost and its safety margin. When the trade is profitable, the agent authorizes a tiny USDC payment, updates its spend limit, and batches the settlement toward Arc.
