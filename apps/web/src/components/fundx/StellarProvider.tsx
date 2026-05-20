"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit"
import { getKit, connectWallet, disconnectWallet, getConnectedAddress } from "@/lib/stellar-wallet"

interface StellarContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isLoading: boolean
  kit: StellarWalletsKit | null
}

const StellarContext = createContext<StellarContextType | undefined>(undefined)

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)

  useEffect(() => {
    setKit(getKit())
    getConnectedAddress()
      .then((a) => setAddress(a))
      .finally(() => setIsLoading(false))
  }, [])

  const connect = useCallback(async () => {
    try {
      const addr = await connectWallet()
      setAddress(addr)
    } catch (err) {
      console.error("Failed to connect wallet:", err)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await disconnectWallet()
    setAddress(null)
  }, [])

  return (
    <StellarContext.Provider value={{ address, isConnected: !!address, connect, disconnect, isLoading, kit }}>
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
