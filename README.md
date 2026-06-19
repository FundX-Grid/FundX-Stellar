# FundX

**Stable Crowdfunding on Stellar. Powered by USDC.**

FundX is a decentralized fundraising platform that solves "volatility risk" for builders. It lets users raise capital in **USDC** (stable purchasing power) while leveraging **Soroban smart contracts** for trustless escrow, ensuring funds are only released when goals are met.

## The Problem
1. **Volatility:** Raising funds in volatile assets is risky. A 20% market dip can kill a project before it starts.
2. **Friction:** Cross-border contributors struggle with expensive or unavailable card rails, especially in emerging markets.

## Features
* **Trustless Escrow:** Funds are held in a Soroban smart contract, not a centralized wallet.
* **Two Funding Models:** Flexible (keep what you raise) and All-or-Nothing (automatic refunds if the goal isn't met by the deadline).
* **USDC Settlement:** Donations move through Stellar Asset Contracts (SAC) and settle in seconds at negligible cost.
* **Multi-Wallet:** Connect via Freighter, Albedo, Lobstr, and others through Stellar Wallets Kit.

## Technical Stack
* **Smart Contract:** Rust / Soroban
* **Frontend:** Next.js 14, React, Tailwind CSS
* **Integration:** `@stellar/stellar-sdk`, `@creit.tech/stellar-wallets-kit`
* **Testing:** `cargo test`

## Quick Start

### 1. Prerequisites
* [Rust](https://www.rust-lang.org/tools/install) with the `wasm32-unknown-unknown` target
* [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli)
* Node.js & NPM
* A Stellar wallet (Freighter recommended)

### 2. Contract Setup (Local Dev)
```bash
# Clone the repo
git clone https://github.com/FundX-Grid/FundX-Stellar.git
cd FundX-Stellar

# Install dependencies
npm install

# Build & test the contract
cargo test --manifest-path packages/contracts/Cargo.toml
npm run build:contracts
```

### 3. Deploy to Testnet
```bash
stellar contract deploy --network testnet --source <admin-key> \
  --wasm packages/contracts/target/wasm32-unknown-unknown/release/fundx_contracts.wasm

stellar contract invoke --network testnet --id <CONTRACT_ID> -- initialize --owner <admin>
stellar contract invoke --network testnet --id <CONTRACT_ID> -- set_allowed_token --token <USDC_SAC> --allowed true
```

### 4. Run the Frontend
```bash
# Add contract config to apps/web/.env.local, then:
npm run dev
```

## Repository Layout
| Path | Purpose |
|---|---|
| `packages/contracts` | Soroban escrow contract (Rust → WASM) |
| `apps/web` | Next.js frontend wired to Soroban RPC |

See [`PROGRESS.md`](./PROGRESS.md) for the full contract API, storage layout, and deploy steps.
