export function TrustStrip() {
  return (
    <div className="mt-12 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 blur-2xl opacity-70 rounded-3xl" />

      <div className="relative backdrop-blur-xl border border-white/40 bg-white/70 rounded-3xl px-8 py-5 shadow-lg">
        <div className="flex flex-wrap justify-center_ gap-8 text-sm font-semibold text-slate-700 tracking-wide">
          <span className="flex items-center_ gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            cUSD-backed
          </span>

          <span className="flex items-center_ gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            On-chain Escrow
          </span>

          <span className="flex items-center_ gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            ERC-20 Compatible
          </span>

          <span className="flex items-center_ gap-2">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            Non-Custodial
          </span>
        </div>
      </div>
    </div>
  )
}