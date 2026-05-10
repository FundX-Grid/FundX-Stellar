"use client"

import { useRef } from "react"
import { Navbar } from "@/components/fundx/Navbar"
import { Hero } from "@/components/fundx/hero/index"
import { LogoStrip } from "@/components/fundx/LogoStrip"
import { Footer } from "@/components/fundx/Footer"
import { CampaignFan } from "@/components/fundx/CampaignFan"

export default function Home() {
  const deckSlotRef = useRef<HTMLDivElement | null>(null)
 

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-orange-100 font-sans">
      <Navbar />
      <Hero deckSlotRef={deckSlotRef} />

      {/* Campaign Section */}
      <section id="campaigns" className="relative_ py-32 bg-white overflow-visible border-t border-slate-100">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

        <div className="container relative_ z-10 mx-auto max-w-7xl px-4">
          <CampaignFan deckSlotRef={deckSlotRef} />
        </div>
      </section>

      <LogoStrip />
      <Footer />
    </main>
  )
}