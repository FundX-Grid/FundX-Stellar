import Image from "next/image"

export function LogoStrip() {
  return (
    <div className="w-full border-t border-slate-100 py-20"> {/* No background */}
      <div className="container mx-auto max-w-5xl px-4">
        
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-32 w-full">
         
          <div className="flex items-center justify-center h-12 cursor-default group">
            <span className="text-3xl font-bold tracking-tight text-slate-300 transition-colors duration-300 group-hover:text-[#fbe72b]">
              Celo
            </span>
          </div>
         
          <div className="flex items-center justify-center h-12 cursor-default group">
            <span className="text-3xl font-bold tracking-tight text-slate-300 transition-colors duration-300 group-hover:text-[#fbe72b]">
              MiniPay
            </span>
          </div>

          <div className="flex items-center justify-center h-12 cursor-default group">
            <span className="text-4xl font-black_ tracking-tighter_ text-slate-300 transition-colors duration-300 group-hover:text-[#fbe72b]">
              cUSD
            </span>
          </div>

          <div className="flex items-center justify-center h-12 cursor-default group">
            <span className="text-4xl font-black_ tracking-tighter_ text-slate-300 transition-colors duration-300 group-hover:text-blue-500">
              USDC
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}