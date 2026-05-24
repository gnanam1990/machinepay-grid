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

MachinePay Grid demonstrates a seller machine broadcasting price and capacity, a buyer agent enforcing profitability and spend policy, and a USDC authorization ledger that can settle through Arc.

## Why Arc

Arc is the right settlement layer for stablecoin-native machine commerce because the core value transfer is USDC-based, high frequency, and designed for predictable settlement.

## Why Circle

Circle provides the wallet, USDC balance, Gateway or Nanopayments route, and future policy controls needed for autonomous agents to safely authorize payments.

## Current MVP

- Simulated solar seller with dynamic power and spot price.
- Buyer agent with revenue, margin, and hourly spend policy.
- USDC-style authorization ledger.
- Proof packet showing authorization digest, Circle route, Arc batch, and policy.
- Responsive web demo for reviewers.

## Next milestone

Replace the mock payment authorization with Circle test wallet and Nanopayments or Gateway calls, then attach Arc Testnet transaction hashes to the ledger.

## Links to fill before final submission

- GitHub repository: add after pushing the repo.
- Live demo URL: add after deploy.
- Demo video: add after recording.
- Questbook submission: add after form submission.

## Suggested Questbook answer

MachinePay Grid is a resource market for autonomous machines and AI agents. In the MVP, a simulated solar node publishes power availability and a 10-second USDC price. A buyer agent evaluates profitability, enforces an hourly spend limit, and creates a nanopayment authorization when the trade makes sense. The dashboard shows the payment ledger, Circle route, Arc batch proof, and policy state.

This fits Circle because USDC is the native payment unit, and the production path uses Circle Agent Wallets plus Gateway or Nanopayments for safe, high-frequency authorization. It fits Arc because Arc becomes the stablecoin settlement layer for batched machine payments. The project can expand from solar power into compute, API data, storage, and connectivity.
