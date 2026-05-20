"use client"

import {
  rpc,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Address,
  nativeToScVal,
  xdr,
  TimeoutInfinite,
} from "@stellar/stellar-sdk"
import {
  FUNDX_CONTRACT,
  RPC_URL,
  NETWORK_PASSPHRASE,
  TOKEN_DECIMALS,
} from "./stellar-config"
import { getKit } from "./stellar-wallet"

let _server: rpc.Server | null = null
function server(): rpc.Server {
  if (!_server) _server = new rpc.Server(RPC_URL, { allowHttp: false })
  return _server
}

export function toUSDCUnits(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".")
  const decimals = TOKEN_DECIMALS.USDC
  const fractionPadded = (fraction + "0".repeat(decimals)).slice(0, decimals)
  return BigInt(whole || 0) * BigInt(10) ** BigInt(decimals) + BigInt(fractionPadded || 0)
}

async function buildAndSubmit(
  source: string,
  functionName: string,
  args: xdr.ScVal[]
): Promise<string> {
  const contract = new Contract(FUNDX_CONTRACT)
  const account = await server().getAccount(source)

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(TimeoutInfinite)
    .build()

  // Prepare (simulates + assembles auth)
  const prepared = await server().prepareTransaction(tx)

  // Sign via wallet kit
  const kit = getKit()
  const { signedTxXdr } = await kit.signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: source,
  })

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
  const sendResult = await server().sendTransaction(signedTx as any)

  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult.errorResult)}`)
  }

  return sendResult.hash
}

export async function donateOnchain(
  source: string,
  campaignId: number,
  amountUnits: bigint
): Promise<string> {
  return buildAndSubmit(source, "donate", [
    new Address(source).toScVal(),
    nativeToScVal(campaignId, { type: "u32" }),
    nativeToScVal(amountUnits, { type: "i128" }),
  ])
}

export async function withdrawOnchain(source: string, campaignId: number): Promise<string> {
  return buildAndSubmit(source, "withdraw", [
    nativeToScVal(campaignId, { type: "u32" }),
  ])
}

export async function claimRefundOnchain(
  source: string,
  campaignId: number
): Promise<string> {
  return buildAndSubmit(source, "claim_refund", [
    new Address(source).toScVal(),
    nativeToScVal(campaignId, { type: "u32" }),
  ])
}

export async function waitForTx(hash: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await server().getTransaction(hash)
      if (res.status === "SUCCESS") return true
      if (res.status === "FAILED") return false
    } catch {
      // not yet indexed
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  return false
}
