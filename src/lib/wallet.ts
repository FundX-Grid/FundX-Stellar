export type WalletType = "minipay" | "other" | "none"

export function detectWallet(): WalletType {
  if (typeof window === "undefined" || !window.ethereum) return "none"
  if (window.ethereum.isMiniPay_) return "minipay"
  return "other"
}

export function isMiniPay_(): boolean {
  return detectWallet() === "minipay"
}
