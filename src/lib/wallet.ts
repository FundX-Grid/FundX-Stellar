export type WalletType = "minipay" | "other" | "none"

export function isMiniPay(): boolean {
  return detectWallet() === "minipay"
}


export function detectWallet(): WalletType {
  if (typeof window === "undefined" || !window.ethereum) return "none"
  if (window.ethereum.isMiniPay) return "minipay"
  return "other"
}