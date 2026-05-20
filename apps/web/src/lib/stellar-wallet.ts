"use client"

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit"
import { NETWORK_PASSPHRASE } from "./stellar-config"

let _kit: StellarWalletsKit | null = null

export function getKit(): StellarWalletsKit {
  if (typeof window === "undefined") {
    throw new Error("Wallet kit only available client-side")
  }
  if (!_kit) {
    const isMainnet = NETWORK_PASSPHRASE.includes("Public")
    _kit = new StellarWalletsKit({
      network: isMainnet ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    })
  }
  return _kit
}

export async function connectWallet(): Promise<string> {
  const kit = getKit()
  return new Promise<string>((resolve, reject) => {
    kit
      .openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id)
            const { address } = await kit.getAddress()
            resolve(address)
          } catch (e) {
            reject(e)
          }
        },
        onClosed: () => reject(new Error("Wallet selection cancelled")),
      })
      .catch(reject)
  })
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const kit = getKit()
    const { address } = await kit.getAddress()
    return address || null
  } catch {
    return null
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await getKit().disconnect()
  } catch {
    // no-op
  }
}
