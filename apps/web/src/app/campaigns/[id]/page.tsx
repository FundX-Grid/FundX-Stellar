"use client"

import { useState, use, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/fundx/Navbar"
import { Footer } from "@/components/fundx/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ShieldCheck, Share2, MapPin, ArrowLeft, Loader2, CheckCircle2, XCircle, Wallet } from "lucide-react"
import { useStellarWallet } from "@/components/fundx/StellarProvider"
import { toast } from "sonner"
import { getCampaign } from "@/lib/data"
import { useCampaign, useDonation } from "@/lib/hooks/useContract"
import { FUNDX_CONTRACT, isContractDeployed } from "@/lib/stellar-config"
import { donateOnchain, withdrawOnchain, claimRefundOnchain, toUSDCUnits, waitForTx } from "@/lib/stellar-tx"

const PLACEHOLDER_IMAGES = ["/campaign-1.jpg", "/campaign-2.jpg", "/campaign-3.jpg"]

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { isConnected, address, connect } = useStellarWallet()
  const [donateAmount, setDonateAmount] = useState("")
  const [mounted, setMounted] = useState(false)
  const [txPending, setTxPending] = useState(false)

  const { id } = use(params)
  const campaignIndex = Number(id)
  const isMockId = isNaN(campaignIndex)

  useEffect(() => setMounted(true), [])

  const { campaign, isLoading, refetch } = useCampaign(isMockId ? 0 : campaignIndex)
  const { donation: userDonation } = useDonation(campaignIndex, address ?? undefined)

  const mockCampaign = isMockId ? getCampaign(id) : null

  if (!mounted || (!isMockId && isLoading)) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </main>
    )
  }

  // --- MOCK CAMPAIGN (slug ID) ---
  if (isMockId) {
    if (!mockCampaign) return notFound()
    const mockProgress = Math.min((mockCampaign.raised / mockCampaign.goal) * 100, 100)
    return (
      <main className="min-h-screen bg-slate-50 selection:bg-violet-100 font-sans">
        <Navbar />
        <div className="container mx-auto max-w-6xl px-4 pt-32 pb-20">
          <Link href="/explore" className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-8 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to campaigns
          </Link>
          <div className="mb-10">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="text-violet-600 bg-violet-50 border-violet-100 px-3 py-1 text-sm">Demo Campaign</Badge>
              <Badge variant="secondary" className="text-slate-500 bg-slate-50 border-slate-200 px-3 py-1 text-sm">{mockCampaign.category}</Badge>
              <div className="flex items-center text-slate-500 text-sm font-medium"><MapPin className="w-3 h-3 mr-1" />{mockCampaign.location}</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">{mockCampaign.title}</h1>
            <p className="text-xl text-slate-500 max-w-3xl">{mockCampaign.description}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-200 shadow-sm border border-slate-100">
                <Image src={mockCampaign.image} alt={mockCampaign.title} fill className="object-cover" />
              </div>
              <div className="flex items-center gap-4 border-y border-slate-200 py-6">
                <Avatar className="h-14 w-14 border-4 border-white shadow-sm">
                  <AvatarImage src={mockCampaign.creatorImage} />
                  <AvatarFallback>{mockCampaign.creator.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Organized by</p>
                  <p className="font-bold text-slate-900 text-lg">{mockCampaign.creator}</p>
                </div>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                <p>{mockCampaign.description}</p>
                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 not-prose mt-6">
                  <h4 className="font-bold text-violet-800 mb-2">Demo Campaign</h4>
                  <p className="text-violet-700/80 text-sm">This is a showcase campaign. On-chain donations are only available for live deployed campaigns.</p>
                </div>
              </div>
            </div>
            <div className="relative h-full">
              <div className="sticky top-32 p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl space-y-6">
                <div className="space-y-5">
                  <div>
                    <div className="text-4xl font-black text-slate-900">${mockCampaign.raised.toLocaleString()} <span className="text-xl font-bold text-slate-400">{mockCampaign.currency}</span></div>
                    <div className="text-base text-slate-400">of ${mockCampaign.goal.toLocaleString()} goal</div>
                  </div>
                  <Progress value={mockProgress} className="h-3 bg-slate-100" />
                  <div className="flex justify-between text-sm font-bold">
                    <span>{Math.round(mockProgress)}% funded</span>
                    <span className="flex items-center gap-1 text-violet-500"><Clock className="w-4 h-4" />{mockCampaign.daysLeft}d left</span>
                  </div>
                </div>
                <Separator />
                <Button disabled className="w-full h-14 rounded-xl bg-slate-200 text-slate-400 text-lg font-bold cursor-not-allowed">
                  Demo — Not Live
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-3 h-3" /> Deploy a real campaign to accept donations
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // --- ON-CHAIN CAMPAIGN (numeric ID) ---
  if (!isContractDeployed()) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Contract Not Deployed</h2>
          <p className="text-slate-500 mb-6">The Soroban FundX contract hasn&apos;t been deployed to this network yet.</p>
          <Link href="/explore"><Button>Back to demos</Button></Link>
        </div>
      </main>
    )
  }
  if (!campaign) return notFound()

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100)
  const isPast = campaign.status !== "active"
  const isFlexible = campaign.fundingModel === "Flexible Model"
  const goalReached = campaign.raised >= campaign.goal

  const isCreator = !!address && campaign.creator === address
  const canWithdraw = isCreator && isPast && !campaign.withdrawn && (isFlexible || goalReached)
  const canRefund = !isFlexible && isPast && !goalReached && userDonation > 0
  const image = PLACEHOLDER_IMAGES[campaignIndex % PLACEHOLDER_IMAGES.length]
  const creatorShort = `${campaign.creator.slice(0, 6)}...${campaign.creator.slice(-4)}`

  let donateDisabledReason = ""
  if (isPast) donateDisabledReason = "Campaign Ended"
  else if (!campaign.active) donateDisabledReason = "Campaign Closed"
  else if (!isFlexible && goalReached) donateDisabledReason = "Goal Reached"

  const handleDonate = async () => {
    if (!isConnected || !address) {
      await connect()
      return
    }
    if (!donateAmount || Number(donateAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid donation amount." })
      return
    }
    try {
      setTxPending(true)
      toast.loading("Awaiting wallet signature...", { id: "donate" })
      const hash = await donateOnchain(address, campaignIndex, toUSDCUnits(donateAmount))
      toast.loading("Confirming on-chain...", { id: "donate" })
      const ok = await waitForTx(hash)
      if (!ok) throw new Error("Tx not confirmed")
      toast.success("Contribution confirmed!", { id: "donate" })
      setDonateAmount("")
      refetch()
    } catch (err) {
      console.error(err)
      toast.error("Donation Failed", { id: "donate", description: "Transaction cancelled or failed." })
    } finally {
      setTxPending(false)
    }
  }

  const handleWithdraw = async () => {
    if (!address) return
    try {
      setTxPending(true)
      toast.loading("Awaiting wallet signature...", { id: "withdraw" })
      const hash = await withdrawOnchain(address, campaignIndex)
      toast.loading("Confirming on-chain...", { id: "withdraw" })
      const ok = await waitForTx(hash)
      if (!ok) throw new Error("Tx not confirmed")
      toast.success("Funds withdrawn successfully!", { id: "withdraw" })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error("Withdrawal Failed", { id: "withdraw", description: "Transaction cancelled or failed." })
    } finally {
      setTxPending(false)
    }
  }

  const handleRefund = async () => {
    if (!address) return
    try {
      setTxPending(true)
      toast.loading("Awaiting wallet signature...", { id: "refund" })
      const hash = await claimRefundOnchain(address, campaignIndex)
      toast.loading("Confirming on-chain...", { id: "refund" })
      const ok = await waitForTx(hash)
      if (!ok) throw new Error("Tx not confirmed")
      toast.success(`Refund of ${userDonation} USDC claimed!`, { id: "refund" })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error("Refund Failed", { id: "refund", description: "Transaction cancelled or failed." })
    } finally {
      setTxPending(false)
    }
  }

  const statusBadge = {
    active: { label: "Active", className: "text-green-600 bg-green-50 border-green-100" },
    successful: { label: "Funded", className: "text-blue-600 bg-blue-50 border-blue-100" },
    failed: { label: "Failed", className: "text-red-600 bg-red-50 border-red-100" },
  }[campaign.status]

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-violet-100 font-sans">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 pt-32 pb-20">
        <Link href="/explore" className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to campaigns
        </Link>

        <div className="mb-10">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="secondary" className={`px-3 py-1 text-sm border ${statusBadge.className}`}>
              {campaign.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
              {campaign.status === "failed" && <XCircle className="w-3 h-3 mr-1 inline" />}
              {statusBadge.label}
            </Badge>
            <Badge variant="secondary" className="text-slate-500 bg-slate-50 border-slate-200 px-3 py-1 text-sm">
              {campaign.fundingModel}
            </Badge>
            <div className="flex items-center text-slate-500 text-sm font-medium">
              <MapPin className="w-3 h-3 mr-1" /> Stellar Network
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Campaign #{id}
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl">
            A verified on-chain campaign raising USDC on Stellar.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-200 shadow-sm border border-slate-100">
              <Image src={image} alt={`Campaign #${id}`} fill className="object-cover" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-slate-200 py-6 gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-4 border-white shadow-sm">
                  <AvatarFallback>{creatorShort.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Deployed by</p>
                  <p className="font-bold text-slate-900 font-mono text-base">{creatorShort}</p>
                </div>
              </div>
              <div className="flex gap-6 text-slate-600 font-medium">
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" /> Verified</div>
                {userDonation > 0 && (
                  <div className="flex items-center gap-2 text-violet-500">
                    <Wallet className="w-5 h-5" /> You contributed {userDonation} USDC
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="story" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 mb-8">
                <TabsTrigger value="story" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:text-violet-600 px-6 py-3 text-base">
                  Campaign Info
                </TabsTrigger>
                <TabsTrigger value="updates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:text-violet-600 px-6 py-3 text-base">
                  Updates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="prose prose-slate prose-lg max-w-none text-slate-600">
                <div className="grid grid-cols-2 gap-6 not-prose mb-8">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Funding Model</p>
                    <p className="text-lg font-bold text-slate-900">{isFlexible ? "Flexible" : "All-or-Nothing"}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Token</p>
                    <p className="text-lg font-bold text-slate-900">USDC</p>
                    <p className="text-xs text-slate-400 mt-1">SAC-issued</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
                    <p className="text-lg font-bold text-slate-900">{new Date(campaign.deadline * 1000).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400 mt-1">{isPast ? "Ended" : `${campaign.daysLeft} days remaining`}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contract</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">{FUNDX_CONTRACT.slice(0, 8)}...{FUNDX_CONTRACT.slice(-4)}</p>
                    <p className="text-xs text-slate-400 mt-1">Soroban</p>
                  </div>
                </div>

                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 not-prose">
                  <h4 className="font-bold text-violet-800 mb-2">Smart Contract Enforced</h4>
                  <p className="text-violet-700/80 text-sm">
                    All fund movements are governed by the FundX Escrow contract on Stellar. No custodians, no discretion.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="updates" className="py-8 text-center text-slate-500">
                No updates yet.
              </TabsContent>
            </Tabs>
          </div>

          <div className="relative h-full">
            <div className="sticky top-32 p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl space-y-6">
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="text-4xl font-black text-slate-900 tracking-tight">
                    {campaign.raised.toLocaleString()} <span className="text-xl font-bold text-slate-400">USDC</span>
                  </div>
                  <div className="text-base font-medium text-slate-400">of {campaign.goal.toLocaleString()} goal</div>
                </div>

                <Progress value={progress} className="h-3 bg-slate-100" />

                <div className="flex justify-between text-sm font-bold pt-1">
                  <span className="text-slate-900">{Math.round(progress)}% funded</span>
                  <span className="flex items-center gap-1 text-violet-500">
                    <Clock className="w-4 h-4" />
                    {isPast ? "Ended" : `${campaign.daysLeft}d left`}
                  </span>
                </div>
              </div>

              <Separator />

              {canWithdraw && (
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <p className="text-sm font-bold text-green-800 mb-1">You are the creator</p>
                  <p className="text-xs text-green-600 mb-4">
                    {campaign.raised > 0 ? `${campaign.raised.toLocaleString()} USDC is ready to withdraw.` : "No funds to withdraw."}
                  </p>
                  <Button
                    onClick={handleWithdraw}
                    disabled={txPending || campaign.raised === 0}
                    className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {txPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Withdraw ${campaign.raised.toLocaleString()} USDC`}
                  </Button>
                </div>
              )}

              {canRefund && (
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  <p className="text-sm font-bold text-red-800 mb-1">Refund available</p>
                  <p className="text-xs text-red-600 mb-4">
                    Goal was not reached. You can reclaim your {userDonation} USDC.
                  </p>
                  <Button
                    onClick={handleRefund}
                    disabled={txPending}
                    className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    {txPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Claim ${userDonation} USDC Refund`}
                  </Button>
                </div>
              )}

              {!isCreator && campaign.status === "active" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Make a contribution</h4>
                    <p className="text-sm text-slate-500">Support this campaign.</p>
                  </div>

                  <div className={`transition-all duration-300 ${!isConnected ? "opacity-50 grayscale pointer-events-none" : ""}`}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-blue-600">USDC</span>
                      <Input
                        type="number"
                        placeholder="100"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        className="pl-20 h-14 rounded-xl border-slate-200 bg-slate-50 text-xl font-bold focus-visible:ring-violet-500"
                      />
                    </div>
                  </div>

                  {isConnected ? (
                    <Button
                      disabled={!!donateDisabledReason || txPending || !donateAmount || Number(donateAmount) <= 0}
                      onClick={handleDonate}
                      className="w-full h-14 rounded-xl bg-slate-900 text-white hover:scale-[1.02] transition-transform text-lg font-bold"
                    >
                      {txPending ? <Loader2 className="w-5 h-5 animate-spin" /> : donateDisabledReason || "Donate Now"}
                    </Button>
                  ) : (
                    <Button onClick={connect} className="w-full h-14 rounded-xl bg-slate-900 text-white text-lg font-bold">
                      Connect Wallet to Donate
                    </Button>
                  )}
                </div>
              )}

              {isCreator && campaign.withdrawn && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Funds withdrawn</p>
                  <p className="text-sm text-slate-400">This campaign has been settled.</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Secured by FundX Escrow on Stellar</span>
              </div>

              <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl h-12">
                <Share2 className="w-4 h-4 mr-2" /> Share this campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
