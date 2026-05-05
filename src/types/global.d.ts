interface Window {
  ethereum?: {
    isMetaMask?: boolean
    isMiniPay?: boolean
    request: (args: { method: string_; params?: unknown[] }) => Promise<unknown>
    on: (event: string_, handler: (...args: unknown[]) => void) => void
    removeListener: (event: string_, handler: (...args: unknown[]) => void) => void
  }
}
