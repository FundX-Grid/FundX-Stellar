import {
  rpc,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Address,
  scValToNative,
  nativeToScVal,
  xdr,
  Account,
} from "@stellar/stellar-sdk"
import {
  FUNDX_CONTRACT,
  RPC_URL,
  NETWORK_PASSPHRASE,
  TOKEN_DECIMALS,
  isContractDeployed,
} from "./stellar-config"

// Dummy source account used only for simulation (no signatures needed)
const DUMMY_SOURCE_ADDRESS = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"

const PLACEHOLDER_IMAGES = ["/campaign-1.jpg", "/campaign-2.jpg", "/campaign-3.jpg"]

export interface OnChainCampaign {
  id: string
  title: string
  description: string
  image: string
  category: string
  creator: string
  token: string
  currency: "USDC"
  goal: number
  raised: number
  deadline: number
  daysLeft: number
  fundingModel: "Flexible Model" | "All-or-Nothing"
  status: "active" | "successful" | "failed"
  active: boolean
  withdrawn: boolean
}

let _server: rpc.Server | null = null
function server(): rpc.Server {
  if (!_server) _server = new rpc.Server(RPC_URL, { allowHttp: false })
  return _server
}

async function readOnly(functionName: string, args: xdr.ScVal[] = []): Promise<any> {
  if (!isContractDeployed()) {
    throw new Error("CONTRACT_NOT_DEPLOYED")
  }
  const contract = new Contract(FUNDX_CONTRACT)
  const sourceAccount = new Account(DUMMY_SOURCE_ADDRESS, "0")

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build()

  const sim = await server().simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error(`Simulation failed for ${functionName}`)
  }
  return scValToNative(sim.result.retval)
}

export async function getCampaignCount(): Promise<number> {
  const result = await readOnly("campaign_count")
  return Number(result)
}

export async function getCampaignRaw(id: number): Promise<any | null> {
  try {
    return await readOnly("get_campaign", [nativeToScVal(id, { type: "u32" })])
  } catch {
    return null
  }
}

export async function getDonation(id: number, donor: string): Promise<bigint> {
  try {
    const result = await readOnly("get_donation", [
      nativeToScVal(id, { type: "u32" }),
      new Address(donor).toScVal(),
    ])
    return BigInt(result ?? 0)
  } catch {
    return BigInt(0)
  }
}

export async function getLatestLedgerTimestamp(): Promise<number> {
  try {
    const latest = await server().getLatestLedger()
    // getLatestLedger returns { sequence }; for timestamp we need a different call
    // Best-effort: use local time as fallback since ledger close time ≈ wall time on Stellar
    return Math.floor(Date.now() / 1000)
  } catch {
    return Math.floor(Date.now() / 1000)
  }
}

function toAmount(units: bigint, decimals = TOKEN_DECIMALS.USDC): number {
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = units / divisor
  const fraction = units % divisor
  return Number(whole) + Number(fraction) / Number(divisor)
}

export function mapCampaign(raw: any, id: number, nowSec: number): OnChainCampaign {
  const deadline = Number(raw.deadline)
  const goalRaw = BigInt(raw.goal)
  const raisedRaw = BigInt(raw.total_raised ?? raw.totalRaised ?? 0)
  const isPast = nowSec >= deadline
  const isFlexible = Number(raw.funding_model ?? raw.fundingModel) === 0
  const goal = toAmount(goalRaw)
  const raised = toAmount(raisedRaw)
  const daysLeft = isPast ? 0 : Math.ceil((deadline - nowSec) / 86400)

  let status: OnChainCampaign["status"]
  if (!isPast) status = "active"
  else if (isFlexible || raised >= goal) status = "successful"
  else status = "failed"

  return {
    id: String(id),
    title: `Campaign #${id}`,
    description: "A verified on-chain campaign raising USDC on Stellar.",
    image: PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length],
    category: "DeFi",
    creator: raw.creator,
    token: raw.token,
    currency: "USDC",
    goal,
    raised,
    deadline,
    daysLeft,
    fundingModel: isFlexible ? "Flexible Model" : "All-or-Nothing",
    status,
    active: Boolean(raw.active),
    withdrawn: Boolean(raw.withdrawn),
  }
}

export async function fetchAllCampaigns(): Promise<{
  campaigns: OnChainCampaign[]
  count: number
  deployed: boolean
}> {
  if (!isContractDeployed()) {
    return { campaigns: [], count: 0, deployed: false }
  }
  const count = await getCampaignCount()
  if (count === 0) return { campaigns: [], count: 0, deployed: true }

  // Soroban contract IDs are 0-indexed
  const ids = Array.from({ length: count }, (_, i) => i)
  const nowSec = await getLatestLedgerTimestamp()
  const results = await Promise.all(ids.map((i) => getCampaignRaw(i)))

  const campaigns = results
    .map((raw, i) => (raw ? mapCampaign(raw, ids[i], nowSec) : null))
    .filter(Boolean) as OnChainCampaign[]

  return { campaigns, count, deployed: true }
}
