"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useConnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { isMiniPay } from "@/lib/wallet"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Copy, LogOut } from "lucide-react"
import { toast } from "sonner"

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.info("Address Copied", {
        description: "Copied to clipboard",
        duration: 2000,
      })
    }
  }

  useEffect(() => {
    setMounted(true)
    if (isMiniPay()) {
      setIsMini(true)
      connect({ connector: injected({ target: "metaMask" }) })
    }
  }, [])

  useEffect(() => {
    if (isConnected) {
      setJustConnected(true)
      toast.success("Wallet Connected", {
        description: "Ready to fund the future.",
        duration: 3000,
      })
      const timer = setTimeout(() => setJustConnected(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const [mounted, setMounted] = useState(false)
  const [justConnected, setJustConnected] = useState(false)
  const [isMini, setIsMini] = useState(false)

  if (!mounted) {
    return (
      <Button className="rounded-full bg-slate-900 text-white px-6 opacity-50">
        Loading...
      </Button>
    )
  }

  // Inside MiniPay: wallet connects silently — hide the button until resolved
  if (isMini && !isConnected) return null

  if (isConnected && address) {
    return (
      <div className="relative inline-flex">
        {justConnected && (
          <span className="absolute -inset-1 rounded-full bg-green-500 opacity-75 animate-ping duration-1000" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button
              className={`
                relative z-10 rounded-full px-6 font-bold tracking-tight transition-all duration-500
                ${justConnected
                  ? "bg-[#fbe72b] border-[#fbe72b] text-slate-900 shadow-lg"
                  : "bg-gradient-tush text-slate-900 shadow-glow hover:opacity-90 hover:scale-105"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                {isMini && (
                  <span className="text-[10px] text-emerald-600 border border-emerald-300/50 bg-emerald-50 px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                    MiniPay
                  </span>
                )}
                <span className="font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 rounded-xl p-2 shadow-xl border-slate-100 mt-2">
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
              My Wallet
            </DropdownMenuLabel>

            <div className="mx-1 px-3 py-2 mb-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-700">Celo Mainnet</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono break-all leading-tight">
                {address}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={copyAddress}
              className="cursor-pointer focus:bg-slate-50 font-medium text-slate-600 py-2.5"
            >
              <Copy className="w-4 h-4 mr-2 opacity-70" />
              Copy Address
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {!isMini && (
              <ConnectButton.Custom>
                {({ openAccountModal }) => (
                  <DropdownMenuItem
                    onClick={openAccountModal}
                    className="cursor-pointer focus:bg-red-50 focus:text-red-600 text-red-500 font-medium py-2.5"
                  >
                    <LogOut className="w-4 h-4 mr-2 opacity-70" />
                    Disconnect
                  </DropdownMenuItem>
                )}
              </ConnectButton.Custom>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <Button
          onClick={openConnectModal}
          className="rounded-full bg-slate-900 text-white hover:bg-[#fbe72b] hover:text-slate-900 shadow-lg shadow-slate-900/20 px-6 transition-all hover:scale-105"
        >
          Connect Wallet
        </Button>
      )}
    </ConnectButton.Custom>
  )
}
