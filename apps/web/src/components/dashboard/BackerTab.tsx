"use client"

import { Clock, CheckCircle2, Rocket, RefreshCcw, ShieldAlert, Loader2, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { useStellarWallet } from "@/components/fundx/StellarProvider"
import { useAllCampaigns, useUserDonations } from "@/lib/hooks/useContract"
import { OnChainCampaign } from "@/lib/stellar-contract"
import { claimRefundOnchain, waitForTx } from "@/lib/stellar-tx"
import { toast } from "sonner"

function formatMoney(amount: number) {
  return `${amount.toLocaleString()} USDC`
}

interface Contribution {
  campaign: OnChainCampaign
  myContribution: number
  status: "active" | "successful" | "refund_available"
}

function RefundCard({ c, address, onSuccess }: { c: Contribution; address: string; onSuccess: () => void }) {
  const [pending, setPending] = useState(false)

  const handleRefund = async () => {
    try {
      setPending(true)
      toast.loading("Awaiting wallet signature...", { id: `r-${c.campaign.id}` })
      const hash = await claimRefundOnchain(address, Number(c.campaign.id))
      toast.loading("Confirming on-chain...", { id: `r-${c.campaign.id}` })
      const ok = await waitForTx(hash)
      if (!ok) throw new Error("Tx not confirmed")
      toast.success(`Refund of ${c.myContribution} USDC claimed!`, { id: `r-${c.campaign.id}` })
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Refund Failed", { id: `r-${c.campaign.id}`, description: "Transaction cancelled or failed." })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-blue-200 shadow-[0_12px_28px_-6px_rgba(59,130,246,0.12)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <div className="absolute -right-4 -bottom-10 text-[120px] font-black text-blue-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">REFUND</div>
      <RefreshCcw strokeWidth={1} className="absolute right-10 -bottom-12 w-72 h-72 text-blue-500 opacity-5 z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 z-10" />

      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
        <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm grayscale-[0.2]">
          <Image src={c.campaign.image} alt={c.campaign.title} fill className="object-cover" />
        </div>
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-100/50 text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> Goal Missed
            </span>
            <span className="text-slate-400 text-sm font-semibold">{c.campaign.fundingModel}</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{c.campaign.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
            <div className="font-semibold text-blue-900 bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-200/60 text-base">
              My Contribution: <span className="text-blue-600 font-extrabold">{formatMoney(c.myContribution)}</span>
            </div>
            <div className="text-slate-500 font-medium text-base">
              Project raised {formatMoney(c.campaign.raised)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
        <Button
          onClick={handleRefund}
          disabled={pending}
          className="w-full md:w-auto h-16 px-10 rounded-xl bg-gradient-to-b from-blue-400 to-blue-500 border border-blue-600 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCcw className="w-5 h-5" /> Claim Refund</>}
        </Button>
      </div>
    </div>
  )
}

function ActiveCard({ c }: { c: Contribution }) {
  const progress = Math.min((c.campaign.raised / c.campaign.goal) * 100, 100)
  return (
    <div className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-violet-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">ACTIVE</div>
      <Rocket strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-violet-500 opacity-[0.04] z-0 pointer-events-none transform -rotate-12" />
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-violet-400 to-violet-500 z-10" />

      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
        <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <Image src={c.campaign.image} alt={c.campaign.title} fill className="object-cover" />
        </div>
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-lg bg-violet-50 border border-violet-100/50 text-violet-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5" /> Funding
            </span>
            <span className="text-slate-400 text-sm font-semibold">{c.campaign.fundingModel}</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{c.campaign.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
            <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 text-base">
              My Contribution: <span className="text-violet-600 font-extrabold">{formatMoney(c.myContribution)}</span>
            </div>
            <div className="text-slate-500 font-medium text-base">Goal: {c.campaign.goal.toLocaleString()} USDC</div>
          </div>
          <div className="w-full max-w-md bg-slate-100 rounded-full h-6 mt-6 overflow-hidden shadow-inner border border-slate-200/50 p-1">
            <div className="bg-gradient-to-r from-violet-400 to-violet-500 h-full rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto shrink-0 text-left md:text-right px-4 relative z-10 mt-6 md:mt-0">
        <div className="text-4xl font-black text-slate-900 tracking-tight">{c.campaign.daysLeft}</div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Days Left</div>
      </div>
    </div>
  )
}

function SuccessCard({ c }: { c: Contribution }) {
  return (
    <div className="bg-slate-50 p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-slate-200 opacity-50 z-0 select-none pointer-events-none tracking-tighter leading-none">FUNDED</div>
      <CheckCircle2 strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-slate-300 opacity-20 z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 z-10" />

      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
        <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
          <Image src={c.campaign.image} alt={c.campaign.title} fill className="object-cover" />
        </div>
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Funded
            </span>
            <span className="text-slate-400 text-sm font-semibold">{c.campaign.fundingModel}</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-700 tracking-tight">{c.campaign.title}</h3>
          <div className="flex items-center gap-4 text-sm mt-4">
            <div className="font-semibold text-slate-600 bg-white/80 px-5 py-2.5 rounded-xl border border-slate-200/60 text-base">
              My Contribution: {formatMoney(c.myContribution)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
        <Link href={`/campaigns/${c.campaign.id}`}>
          <Button variant="outline" className="w-full md:w-auto h-16 px-10 rounded-xl bg-white border-slate-200 text-slate-600 font-bold shadow-sm text-lg">
            View Campaign
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function BackerTab() {
  const { address } = useStellarWallet()
  const { campaigns, isLoading: isCampaignsLoading, refetch } = useAllCampaigns()
  const campaignIds = useMemo(() => campaigns.map((c) => Number(c.id)), [campaigns])
  const { donations, isLoading: isDonationsLoading } = useUserDonations(address ?? undefined, campaignIds)

  const contributions: Contribution[] = useMemo(() => {
    return campaigns
      .map((campaign) => {
        const myContribution = donations[Number(campaign.id)] || 0
        if (myContribution === 0) return null

        const isFlexible = campaign.fundingModel === "Flexible Model"
        const isPast = campaign.status !== "active"
        const goalReached = campaign.raised >= campaign.goal

        let status: Contribution["status"] = "active"
        if (!isPast) status = "active"
        else if (isFlexible || goalReached) status = "successful"
        else status = "refund_available"

        return { campaign, myContribution, status }
      })
      .filter(Boolean) as Contribution[]
  }, [campaigns, donations])

  if (isCampaignsLoading || isDonationsLoading) {
    return (
      <TabsContent value="contributions">
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your contributions...</span>
        </div>
      </TabsContent>
    )
  }

  if (contributions.length === 0) {
    return (
      <TabsContent value="contributions">
        <div className="text-center py-20">
          <PackageOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No contributions yet</h3>
          <p className="text-slate-500 mb-8">You haven&apos;t backed any campaigns on Stellar.</p>
          <Link href="/explore">
            <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold">
              Explore Campaigns
            </Button>
          </Link>
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="contributions" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {contributions.map((c) => {
        if (c.status === "refund_available" && address)
          return <RefundCard key={c.campaign.id} c={c} address={address} onSuccess={refetch} />
        if (c.status === "active") return <ActiveCard key={c.campaign.id} c={c} />
        return <SuccessCard key={c.campaign.id} c={c} />
      })}
    </TabsContent>
  )
}
