"use client"

import { Clock, XCircle, CheckCircle2, Rocket, Loader2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useStellarWallet } from "@/components/fundx/StellarProvider"
import { useAllCampaigns } from "@/lib/hooks/useContract"
import { OnChainCampaign } from "@/lib/stellar-contract"
import { withdrawOnchain, waitForTx } from "@/lib/stellar-tx"
import { toast } from "sonner"

function formatMoney(amount: number) {
  return `${amount.toLocaleString()} USDC`
}

export function CreatorTab() {
  const { address } = useStellarWallet()
  const { campaigns, isLoading, refetch } = useAllCampaigns()
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const myCampaigns = campaigns.filter((c) => address && c.creator === address)

  const handleWithdraw = async (campaign: OnChainCampaign) => {
    if (!address) return
    try {
      setWithdrawingId(campaign.id)
      toast.loading("Awaiting wallet signature...", { id: `w-${campaign.id}` })
      const hash = await withdrawOnchain(address, Number(campaign.id))
      toast.loading("Confirming on-chain...", { id: `w-${campaign.id}` })
      const ok = await waitForTx(hash)
      if (!ok) throw new Error("Tx not confirmed")
      toast.success("Funds withdrawn successfully!", { id: `w-${campaign.id}` })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error("Withdrawal Failed", { id: `w-${campaign.id}`, description: "Transaction cancelled or failed." })
    } finally {
      setWithdrawingId(null)
    }
  }

  if (isLoading) {
    return (
      <TabsContent value="campaigns">
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your campaigns...</span>
        </div>
      </TabsContent>
    )
  }

  if (myCampaigns.length === 0) {
    return (
      <TabsContent value="campaigns">
        <div className="text-center py-20">
          <Rocket className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No campaigns yet</h3>
          <p className="text-slate-500 mb-8">You haven&apos;t deployed any campaigns on Stellar.</p>
          <Link href="/create">
            <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold">
              <PlusCircle className="w-4 h-4 mr-2" /> Launch a Campaign
            </Button>
          </Link>
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="campaigns" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {myCampaigns.map((campaign) => {
        const progress = Math.min((campaign.raised / campaign.goal) * 100, 100)
        const isWithdrawing = withdrawingId === campaign.id
        const canWithdraw =
          campaign.status !== "active" &&
          !campaign.withdrawn &&
          (campaign.fundingModel === "Flexible Model" || campaign.raised >= campaign.goal)

        if (campaign.status === "successful" || (campaign.status !== "active" && campaign.fundingModel === "Flexible Model")) {
          return (
            <div key={campaign.id} className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-green-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">SUCCESS</div>
              <CheckCircle2 strokeWidth={1} className="absolute right-10 -bottom-12 w-72 h-72 text-green-500 opacity-5 z-0 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500 z-10" />

              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
                <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-lg bg-green-50 border border-green-100/50 text-green-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {campaign.withdrawn ? "Withdrawn" : "Successful"}
                    </span>
                    <span className="text-slate-400 text-sm font-semibold">{campaign.fundingModel}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.title}</h3>
                  <div className="flex items-center gap-4 text-sm mt-4">
                    <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 text-base">
                      Raised: <span className="text-green-600 font-extrabold">{formatMoney(campaign.raised)}</span>
                    </div>
                    <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} USDC</div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 relative z-10">
                {campaign.withdrawn ? (
                  <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Settled
                  </div>
                ) : (
                  <Button
                    onClick={() => handleWithdraw(campaign)}
                    disabled={!canWithdraw || isWithdrawing}
                    className="w-full md:w-auto h-16 px-10 rounded-xl bg-gradient-to-b from-green-300 to-green-400 border border-green-500 text-green-950 font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Withdraw Funds"}
                  </Button>
                )}
              </div>
            </div>
          )
        }

        if (campaign.status === "active") {
          return (
            <div key={campaign.id} className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-violet-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">ACTIVE</div>
              <Rocket strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-violet-500 opacity-[0.04] z-0 pointer-events-none transform -rotate-12" />
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-violet-400 to-violet-500 z-10" />

              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
                <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-lg bg-violet-50 border border-violet-100/50 text-violet-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3.5 h-3.5" /> Active
                    </span>
                    <span className="text-slate-400 text-sm font-semibold">{campaign.fundingModel}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.title}</h3>
                  <div className="flex items-center gap-4 text-sm mt-4">
                    <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 text-base">
                      Raised: <span className="text-violet-600 font-extrabold">{formatMoney(campaign.raised)}</span>
                    </div>
                    <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} USDC</div>
                  </div>
                  <div className="w-full max-w-md bg-slate-100 rounded-full h-6 mt-6 overflow-hidden shadow-inner border border-slate-200/50 p-1">
                    <div className="bg-gradient-to-r from-violet-400 to-violet-500 h-full rounded-full relative" style={{ width: `${progress}%` }}>
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 text-left md:text-right px-4 relative z-10 mt-6 md:mt-0">
                <div className="text-4xl font-black text-slate-900 tracking-tight">{campaign.daysLeft}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Days Left</div>
              </div>
            </div>
          )
        }

        return (
          <div key={campaign.id} className="bg-slate-50 p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
            <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-slate-200 opacity-50 z-0 select-none pointer-events-none tracking-tighter leading-none">FAILED</div>
            <XCircle strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-slate-500 opacity-5 z-0 pointer-events-none" />
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 z-10" />

            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
              <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
                <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
              </div>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-lg bg-white border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Failed
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">{campaign.fundingModel}</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-500 line-through decoration-slate-300 decoration-2 tracking-tight">{campaign.title}</h3>
                <div className="flex items-center gap-4 text-sm mt-4">
                  <div className="font-semibold text-slate-500 bg-white/50 px-5 py-2.5 rounded-xl border border-slate-200/60 text-base">
                    Raised: {formatMoney(campaign.raised)}
                  </div>
                  <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} USDC</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
              <Button variant="outline" disabled className="w-full md:w-auto h-16 px-10 rounded-xl bg-slate-100 border-slate-200 text-slate-400 font-bold cursor-not-allowed text-lg">
                Goal Not Met
              </Button>
            </div>
          </div>
        )
      })}
    </TabsContent>
  )
}
