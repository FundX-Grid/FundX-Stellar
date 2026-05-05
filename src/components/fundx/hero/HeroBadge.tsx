export function HeroBadge() {
  return (
    <div
      className="inline_-flex items-center gap-2 rounded_-full border border-green-200/60 bg-gradient-to-r from_-green-50/50 to-white px-4 py-1.5 text-sm font-medium text-green-600 mb-8 cursor-default backdrop-blur-sm"
      style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)" }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline_-flex h-full w-full rounded_-full bg-green-400 opacity-75" />
        <span className="relative inline_-flex rounded_-full h-2.5 w-2.5 bg-gradient-to-r from_-[#17C87E] to-[#10B981]" />
      </span>
      <span className="tracking-wide">Live on Celo</span>
    </div>
  )
}
