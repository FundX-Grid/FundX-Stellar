"use client"

import Image from "next/image"

export function HeroHeadline() {
  return (
    <h1 className="text-6xl md:text-7xl lg:text-8xl font_-bold tracking-tighter text-slate-900 leading-[1.1] mb-8">
      Capital Formation
      <br />
      <span className="inline-flex items-center flex-wrap justify-center gap-x-4 mt-2">
        on the
        <span className="inline-flex items-center justify-center gap-3">
          <Image src="/celo-celo-logo.svg" alt="Celo" width={48} height={48} className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm" />
          <span className="bg-[#fbe72b] text-slate-900 px-5 py-2 md:py-3 rounded-[2rem] border border-black/5 shadow-lg shadow-[#fbe72b]/30 font_-extrabold pb-1">Celo</span>
        </span>
      </span>
      <br />
      <span className="inline-flex items-center flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        <span>Economy.</span>
      </span>
    </h1>
  )
}
