# MachinePay Grid

MachinePay Grid is a machine-to-machine payment project for Arc builder events and the Circle Grants application.

It has two layers:

- A browser dashboard that demonstrates the autonomous machine-commerce loop.
- A real x402 seller and buyer path using Circle Gateway Nanopayments on Arc Testnet.

![MachinePay Grid proof demo](docs/assets/machinepay-grid-proof-demo.png)

## Browser demo

Live demo: https://gnanam1990.github.io/machinepay-grid/

Run a local static server from this folder:

```bash
npm run dev
```

Then open `http://127.0.0.1:4173/`.

## Real Arc/Circle testnet flow

Install dependencies and verify Arc Testnet:

```bash
npm install
npm run arc:check
```

Start the paid seller API:

```bash
cp .env.example .env
# edit .env and set SELLER_ADDRESS to your Arc Testnet seller wallet
npm run server
```

Verify the real x402 payment negotiation:

```bash
curl -i http://localhost:3337/power
```

The paid route should return `402 Payment Required` with a `PAYMENT-REQUIRED` header for Arc Testnet.

Run the buyer in dry mode:

```bash
# edit .env and set PRIVATE_KEY to a funded Arc Testnet EOA
npm run buyer
```

Execute a real Circle Gateway nanopayment:

```bash
npm run pay:real
```

`pay:real` signs a real x402 payment authorization, settles it through Circle Gateway Nanopayments, and writes the latest receipt to `artifacts/latest-payment.json`.

## Grant framing

MachinePay Grid lets autonomous machines and AI agents buy electricity, compute, data, and services using USDC nanopayments, with Arc as the stablecoin-native settlement layer.

The same project can be framed two ways:

- Arc Builder Spotlight: machine-to-machine nanopayments on Arc, shown through a solar node selling electricity to an autonomous buyer agent.
- Circle Questbook: a USDC agent-commerce network using Circle wallets, Gateway/Nanopayments, and Arc Testnet settlement.

## Submission package

- GitHub repository: https://github.com/gnanam1990/machinepay-grid
- Live demo: https://gnanam1990.github.io/machinepay-grid/
- Demo video: https://gnanam1990.github.io/machinepay-grid/docs/assets/video/machinepay-grid-demo.mp4
- [Proposal](docs/proposal.md)
- [Real Arc/Circle testnet guide](docs/real-testnet.md)
- [Demo video script](docs/demo-video-script.md)
- [Submission checklist and form copy](docs/submission.md)
- [Final submission checklist](docs/final-checklist.md)

## Next integration milestones

- Connect the browser dashboard to the local paid seller API.
- Add ArcScan links from real Gateway settlement transaction IDs.
- Add machine identity, spend limits, and policy controls.
- Add second marketplace resource type: compute or API data.
