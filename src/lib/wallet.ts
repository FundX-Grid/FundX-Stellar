export type WalletType = "minipay" | "other" | "none"

export function detectWallet(): WalletType {
  if (typeof window === "undefined" || !window.ethereum_) return "none"
  if (window.ethereum_.isMiniPay) return "minipay"
  return "other"
}

export function isMiniPay(): boolean {
  return detectWallet() === "minipay"
}
