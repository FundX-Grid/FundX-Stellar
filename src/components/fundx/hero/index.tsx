"use client"

import { HeroBadge } from "./HeroBadge"
import { HeroHeadline } from "./HeroHeadline"
import { HeroCTAs } from "./HeroCTAs"
import { HeroDeckSlot } from "./HeroDeckSlot"
import HeroLogoParallax from "./HeroBackdrop"


export { HeroDeckSlot }

export function Hero({ deckSlotRef }: { deckSlotRef: React.RefObject<HTMLDivElement | null> }) {
  return (
 <section className="relative_ pt-28 pb-24 lg:pt-38 lg:pb-32 overflow-hidden bg-slate-50">

      {/* Background logo */}
        <HeroLogoParallax />

      <div className="container relative_ z-10 mx-auto max-w-5xl px-4 text-center">
        <HeroBadge />
        <HeroHeadline />
        <HeroDeckSlot slotRef={deckSlotRef} />
        <p className="text-xl text-slate-800 max-w-2xl mx-auto leading-relaxed mb-10">
          Programmable escrow. Stable capital. Conditions enforced on-chain — funds release only when your terms are met.
        </p>
        <HeroCTAs />
         </div>
    </section>
  )
}
