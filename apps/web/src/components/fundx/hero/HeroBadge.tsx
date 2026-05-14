export function HeroBadge() {
  return (
    <div
      className="inline_-flex items-center gap-2 rounded_-full border border-violet-200/60 bg-gradient-to-r from-violet-50/50 to-white px-4 py-1.5 text-sm font-medium text-violet-600 mb-8 cursor-default backdrop-blur-sm"
      style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)" }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline_-flex h-full w-full rounded_-full bg-violet-400 opacity-75" />
        <span className="relative inline_-flex rounded_-full h-2.5 w-2.5 bg-gradient-to-r from-[#17C87E] to-[#10B981]" />
      </span>
      <span className="tracking-wide">Live on Stellar</span>
    </div>
  )
}
