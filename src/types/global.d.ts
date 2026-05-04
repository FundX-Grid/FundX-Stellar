interface Window {
  ethereum?: {
    isMetaMask?: boolean
    isMiniPay?: boolean
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event_: string, handler: (...args: unknown[]) => void) => void
    removeListener: (event_: string, handler: (...args: unknown[]) => void) => void
  }
}
