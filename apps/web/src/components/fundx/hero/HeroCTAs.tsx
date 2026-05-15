"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link href="/create">
        <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-slate-900 text-white font-bold hover:bg-[#7b3fe4] hover:text-slate-900 transition-all duration-250 ease-in-out hover:scale-[1.025] active:scale-[0.975]" style={{ boxShadow: "0 4px 20px 0 rgba(123, 63, 228, 0.3)" }}>
          Start a Campaign
        </Button>
      </Link>
      <Link href="/explore">
        <Button variant="outline" size="lg" className="h-16 px-10 rounded-full text-lg border-2 border-slate-200 bg-white text-slate-700 hover:border-[#7b3fe4] hover:bg-[#7b3fe4] hover:text-slate-900 transition-all duration-250 ease-in-out hover:scale-[1.025] active:scale-[0.975]">
          Explore Campaigns
        </Button>
      </Link>
    </div>
  )
}
