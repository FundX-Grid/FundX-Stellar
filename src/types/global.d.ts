interface Window {
  ethereum?: {
    isMetaMask?: boolean
    isMiniPay?: boolean
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event: string, handler_: (...args: unknown[]) => void) => void
    removeListener: (event: string, handler_: (...args: unknown[]) => void) => void
  }
}
