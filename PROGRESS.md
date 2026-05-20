# FundX-Stellar — Integration Progress

> Stellar/Soroban port of FundXEscrow.sol. Contract complete, frontend pending.

---

## Status

| # | Task | Status |
|---|---|---|
| 6 | Build FundX Soroban contract | ✅ done — compiles to WASM, 5/5 tests pass |
| 7 | Port FundX-Stellar frontend | ✅ done |

---

## Contract — `packages/contracts/src/lib.rs`

**Compiles**: `cargo build --target wasm32-unknown-unknown --release` — clean.
**Tests**: `cargo test` — 5 passing (create, donate, withdraw with fee, AON refund, AON withdraw blocked, expired donate blocked).

### Public functions (mirrors Solidity contract)

| Function | Auth | Purpose |
|---|---|---|
| `initialize(owner)` | once-only | Sets contract owner |
| `set_allowed_token(token, allowed)` | owner | Whitelist a SAC token |
| `deactivate_campaign(id)` | owner | Admin kill switch |
| `create_campaign(creator, token, goal, duration, funding_model)` | creator | Returns u32 ID, 0-indexed |
| `donate(donor, id, amount)` | donor | Pulls tokens via SAC |
| `withdraw(id)` | creator | Past deadline, fee deducted, sent to owner |
| `claim_refund(donor, id)` | donor | AON only, past deadline, goal not reached |
| `get_campaign(id)`, `get_donation(id, donor)`, `campaign_count()`, `is_past_deadline(id)`, `is_goal_reached(id)`, `calculate_fee(amount)`, `calculate_net(amount)`, `is_token_allowed(token)` | read-only | |

### Constants
- `FLEXIBLE = 0`, `ALL_OR_NOTHING = 1`
- `PLATFORM_FEE_BPS = 200` (2%)

### Storage layout
- **Instance**: `Owner`, `CampaignCount`, `AllowedToken(addr)` — small, accessed every call
- **Persistent**: `Campaign(id)`, `Donation(id, donor)` — scales with usage

### Events emitted
- `campaign_created`, `donation_received`, `funds_withdrawn`, `refund_claimed`

### Deviations from Celo

| | Celo | Stellar |
|---|---|---|
| ID base | 0-indexed via state var | 0-indexed via instance storage |
| Deadline | `block.timestamp + duration` | `env.ledger().timestamp() + duration` |
| Token interface | ERC20 + SafeERC20 | `token::Client` over SAC |
| Token allowlist | hardcoded cUSD + USDC | dynamic `set_allowed_token` |
| Auth | `msg.sender` | `Address::require_auth()` |
| Fee transfer | both in `withdraw` | both in `withdraw` |
| Reentrancy | OpenZeppelin nonReentrant + check-effects-interactions | check-effects-interactions only (Soroban host enforces auth) |

---

## Frontend (Task 7) — wired

### New / rewritten files

| File | Purpose |
|---|---|
| `apps/web/src/lib/stellar-config.ts` | Contract ID, USDC SAC, RPC + network passphrase, env-var override, `isContractDeployed()` guard |
| `apps/web/src/lib/stellar-contract.ts` | Read-only layer via `rpc.simulateTransaction` — `getCampaignRaw`, `getDonation`, `campaign_count`, `mapCampaign`, `fetchAllCampaigns`. Mirrors Stacks/Celo helper. |
| `apps/web/src/lib/stellar-wallet.ts` | Singleton `StellarWalletsKit`, `connectWallet`, `getConnectedAddress`, `disconnectWallet` |
| `apps/web/src/lib/stellar-tx.ts` | Write layer: `donateOnchain`, `withdrawOnchain`, `claimRefundOnchain`, `toUSDCUnits`, `waitForTx`. Uses `prepareTransaction` + wallet-kit signing + `sendTransaction`. |
| `apps/web/src/lib/hooks/useContract.ts` | Hand-rolled React hooks (no react-query needed for v1): `useAllCampaigns`, `useCampaign`, `useDonation`, `useUserDonations` |
| `apps/web/src/components/fundx/StellarProvider.tsx` | Updated context: `address`, `isConnected`, `connect`, `disconnect`, `isLoading` |
| `apps/web/src/app/explore/page.tsx` | Live + mock merge, loading skeleton, never-empty UX |
| `apps/web/src/app/campaigns/[id]/page.tsx` | Numeric IDs → contract; slug IDs → mock demo. Full donate/withdraw/refund + status badge. |
| `apps/web/src/components/dashboard/CreatorTab.tsx` | Filter `useAllCampaigns` by `creator === address`, withdraw with receipt wait |
| `apps/web/src/components/dashboard/BackerTab.tsx` | `useUserDonations` batch, refund with receipt wait |

### Configuration to flip live

Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_FUNDX_CONTRACT_ID=C...           # after deploy
NEXT_PUBLIC_USDC_CONTRACT_ID=CBIELTK6YBZ...  # testnet USDC SAC (already default)
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

Until the contract is deployed, `isContractDeployed()` short-circuits all reads — Explore shows only mock campaigns with a "contract pending" annotation, Campaign Detail for numeric IDs shows a "Contract Not Deployed" notice.

### Stellar-specific notes (differences from Celo/Stacks)

1. **Reads via simulation** — no batched multicall; we use `simulateTransaction` per call, parallelised with `Promise.all`. Uses a dummy source account ("GBZX...") since simulation doesn't require signatures.
2. **`scValToNative`** handles the Campaign struct conversion automatically — i128 → bigint, Address → string, etc.
3. **Writes via `prepareTransaction`** — auto-assembles SAC token auth (donor approves the contract's transfer via Soroban auth). User signs once via wallet-kit modal.
4. **`waitForTx` polls** `getTransaction(hash)` every 2s up to 60s — cleaner than Stacks' setTimeout heuristic.
5. **`@creit.tech/stellar-wallets-kit`** modal handles Freighter / Albedo / Lobstr / etc. Default selected wallet is Freighter.
6. **USDC has 7 decimals** on Stellar SAC, not 6 like Celo or Stacks.

### Pre-deploy steps

1. **Generate TypeScript bindings**: `stellar contract bindings typescript --network testnet --contract-id <ID> --output-dir apps/web/src/contracts`
2. **Deploy to testnet**:
   ```bash
   stellar contract deploy --network testnet --source <admin-key> \
     --wasm target/wasm32-unknown-unknown/release/fundx_contracts.wasm
   ```
3. **Initialize**:
   ```bash
   stellar contract invoke --network testnet --id <ID> -- initialize --owner <admin>
   stellar contract invoke --network testnet --id <ID> -- set_allowed_token --token <USDC-SAC> --allowed true
   ```
4. **Frontend wiring**: mirror `useStacksContract.ts` pattern — hand-rolled hooks over `@stellar/stellar-sdk` `Server.simulateTransaction` for reads and signing via Freighter/Albedo for writes.

USDC SAC on Stellar testnet: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
