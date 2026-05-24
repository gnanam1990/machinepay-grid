# Submission Pack

## Project name

MachinePay Grid

## Short description

Autonomous machine-to-machine USDC nanopayments for electricity, compute, data, and services, with Circle as the payment rail and Arc as the stablecoin-native settlement layer.

## One-line pitch

MachinePay Grid lets autonomous machines and AI agents buy resources using USDC nanopayments, then batch settlement proofs to Arc.

## Problem

Machines and AI agents need to buy very small resource units in real time. Existing payment systems are too slow, expensive, or human-operated for decisions that happen every few seconds.

## Solution

MachinePay Grid demonstrates a seller machine broadcasting price and capacity, a buyer agent enforcing profitability and spend policy, and a real x402 paid API path that uses Circle Gateway Nanopayments on Arc Testnet.

## Why Arc

Arc is the right settlement layer for stablecoin-native machine commerce because the core value transfer is USDC-based, high frequency, and designed for predictable settlement.

## Why Circle

Circle provides the Gateway Nanopayments route, USDC balance layer, and x402 authorization flow needed for autonomous agents to safely authorize payments.

## Current build

- Simulated solar seller with dynamic power and spot price.
- Buyer agent with revenue, margin, and hourly spend policy.
- USDC-style authorization ledger.
- Proof packet showing authorization digest, Circle route, Arc batch, and policy.
- Responsive web demo for reviewers.
- Real Express seller API that returns `402 Payment Required` for unpaid `/power` requests.
- Real buyer script that uses Circle `GatewayClient` on `arcTestnet`.
- Arc Testnet health check verifying RPC, chain id, USDC, and Gateway Wallet bytecode.

## Next milestone

Fund a dedicated testnet buyer wallet, run `npm run pay:real`, and attach the produced Gateway transaction ID to the browser ledger and final video.

## Links to fill before final submission

- GitHub repository: https://github.com/gnanam1990/machinepay-grid
- Live demo URL: https://gnanam1990.github.io/machinepay-grid/
- Demo video: https://gnanam1990.github.io/machinepay-grid/docs/assets/video/machinepay-grid-demo.mp4
- Questbook submission: pending final form submission.

## Suggested Questbook answer

MachinePay Grid is a resource market for autonomous machines and AI agents. A simulated solar node publishes power availability and a 10-second USDC price. A buyer agent evaluates profitability and spend policy, while the real seller API protects `/power` with x402. Unpaid requests return `402 Payment Required`; a funded buyer EOA can pay through Circle Gateway Nanopayments on Arc Testnet.

This fits Circle because USDC is the native payment unit and the project now uses Circle Gateway Nanopayments for high-frequency authorization. It fits Arc because Arc Testnet is the stablecoin settlement layer used by the real buyer/seller scripts. The project can expand from solar power into compute, API data, storage, and connectivity.
