export const FUNDX_CONTRACT =
  process.env.NEXT_PUBLIC_FUNDX_CONTRACT_ID || "C..."

// Stellar testnet USDC SAC (Circle-issued USDC bridged)
export const TOKEN_ADDRESSES = {
  USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT_ID || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
}

export const TOKEN_DECIMALS = {
  USDC: 7,
}

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015"

export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org"

export const PLATFORM_FEE_BPS = 200

export const FUNDING_MODEL = {
  FLEXIBLE: 0,
  ALL_OR_NOTHING: 1,
} as const

export const isContractDeployed = () =>
  FUNDX_CONTRACT.length > 5 && FUNDX_CONTRACT.startsWith("C") && !FUNDX_CONTRACT.startsWith("C...")
