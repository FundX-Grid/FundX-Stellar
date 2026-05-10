import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { stellar } from "wagmi/chains"
import { http } from "wagmi"

export const config = getDefaultConfig({
  appName: "FundX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [stellar],
  transports: {
    [stellar.id]: http("https://forno.stellar.org"),
  },
})

export const FUNDX_CONTRACT = "0x4e10d988765EA22aAD4E52353f183EbD54D3ea8C"

export const TOKEN_ADDRESSES = {
  USDC: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
}

export const TOKEN_DECIMALS = {
  USDC: 18,
  USDC: 6,
}
