interface Window {
  ethereum?: {
    isMetaMask?: boolean
    isMiniPay?: boolean
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event: string, handler: (...args: unknown[]) => void_) => void_
    removeListener: (event: string, handler: (...args: unknown[]) => void_) => void_
  }
}
