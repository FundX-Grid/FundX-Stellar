"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { StellarWalletsKit, WalletNetwork, allowAllModules } from "@creit.tech/stellar-wallets-kit"

interface StellarContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  kit: StellarWalletsKit | null
}

const StellarContext = createContext<StellarContextType | undefined>(undefined)

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)

  useEffect(() => {
    // Initialize the Stellar Wallets Kit
    const kitInstance = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: "freighter",
      modules: allowAllModules(),
    })
    setKit(kitInstance)
  }, [])

  const connect = async () => {
    if (!kit) return
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id)
          const { address } = await kit.getAddress()
          setAddress(address)
        },
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  return (
    <StellarContext.Provider value={{ address, isConnected: !!address, connect, disconnect, kit }}>
      {children}
    </StellarContext.Provider>
  )
}

export function useStellarWallet() {
  const context = useContext(StellarContext)
  if (context === undefined) {
    throw new Error("useStellarWallet must be used within a StellarProvider")
  }
  return context
}
