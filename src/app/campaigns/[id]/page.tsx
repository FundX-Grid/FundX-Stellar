"use client"

import { useState, use, useEffect } from "react" 
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/fundx/Navbar"
import { Footer } from "@/components/fundx/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, ShieldCheck, Share2, MapPin, ArrowLeft } from "lucide-react" 
import { useAccount, useWriteContract } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"
import { parseUnits, formatUnits, erc20Abi } from "viem"
import { FUNDX_ABI } from "@/lib/fundx-abi"
import { FUNDX_CONTRACT, TOKEN_ADDRESSES, config } from "@/lib/celo-config"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"
import { getCampaign } from "@/lib/data"
import { useCampaign } from "@/lib/hooks/useContract"
import { isMiniPay } from "@/lib/wallet"

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [donateAmount, setDonateAmount] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isMini, setIsMini] = useState(false)

  const { id } = use(params)
  
  useEffect(() => {
    setMounted(true)
    setIsMini(isMiniPay())
  }, [])

  const { data: campaignData, isLoading: isLoadingContract, error } = useCampaign(Number(id))
  
  const localMock = getCampaign(id)

  let campaign: any = null
  let isContractCampaign = false

  if (campaignData && campaignData.creator !== "0x0000000000000000000000000000000000000000") {
     isContractCampaign = true
     const isCUSD = campaignData.token.toLowerCase() === TOKEN_ADDRESSES.cUSD.toLowerCase()
     const decimals = isCUSD ? 18 : 6
     const c = {
        id,
        creator: campaignData.creator,
        goal: Number(formatUnits(campaignData.goal, decimals)),
        raised: Number(formatUnits(campaignData.totalRaised, decimals)),
        currency: isCUSD ? "cUSD" : "USDC",
        deadline: Number(campaignData.deadline),
        withdrawn: campaignData.withdrawn,
        active: campaignData.active,
        fundingModel: campaignData.fundingModel === 0 ? "Flexible Model" : "All-or-Nothing",

        title: `Campaign #${id}`,
        description: "An on-chain Celo campaign.",
        category: "Web3",
        location: "Celo Network",
        image: "/campaign-1.jpg",
        creatorImage: "https://github.com/shadcn.png",
        backers: 0,
        daysLeft: Math.max(0, Math.floor((Number(campaignData.deadline) - Date.now() / 1000) / 86400))
     }

     if (localMock) {
        c.title = localMock.title
        c.description = localMock.description
        c.category = localMock.category
        c.location = localMock.location
        c.image = localMock.image
        c.creatorImage = localMock.creatorImage
     }
     
     campaign = c
  } else if (localMock) {
     campaign = localMock
  }

  if (!mounted || isLoadingContract) {
    return (
      <main className="min-h-screen bg-slate-50 selection:bg-green-100 font-sans flex items-center justify-center">
         <div className="animate-spin w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent"></div>
      </main>
    )
  }

  if (error && !localMock) {
    return (
      <main className="min-h-screen bg-slate-50 pt-32 pb-20 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Error loading campaign</h1>
        <p className="text-slate-500 mb-6 w-96">{error.message}</p>
        <Link href="/explore"><Button>Back to explore</Button></Link>
      </main>
    )
  }

  if (!campaign) {
    return notFound()
  }

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100)

  let donateDisabledReason = ""
  if (isContractCampaign && campaignData) {
      if (Number(campaignData.deadline) * 1000 <= Date.now()) donateDisabledReason = "Campaign Ended"
      else if (!campaignData.active) donateDisabledReason = "Campaign Closed"
      else if (campaignData.fundingModel === 1 && campaignData.totalRaised >= campaignData.goal) donateDisabledReason = "Goal Reached"
  } else {
     if (campaign.daysLeft <= 0) donateDisabledReason = "Campaign Ended"
  }
  
  if (!donateDisabledReason && donateAmount === "0") donateDisabledReason = "Enter Amount"
  // Mock campaigns (slug IDs) can't accept on-chain donations
  if (!donateDisabledReason && !isContractCampaign) donateDisabledReason = "Demo Campaign"

  const handleDonate = async () => {
    if (!isContractCampaign) {
      toast.error("Demo Campaign", { description: "This is a demo campaign. On-chain donations are only available for real campaigns." })
      return
    }
    if (!isConnected && !isMini) {
      toast.error("Connect Wallet", { description: "Please connect your wallet to donate." })
      return
    }
    if (!donateAmount || Number(donateAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount to donate." })
      return
    }

    const campaignIdNum = Number(id)
    if (isNaN(campaignIdNum)) {
      toast.error("Invalid Campaign", { description: "This campaign cannot receive on-chain donations." })
      return
    }
    
    try {
      toast.loading("Approving token...", { id: "donate" })
      const isCUSD = campaign.currency === "cUSD"
      const tokenAddress = isCUSD ? TOKEN_ADDRESSES.cUSD : TOKEN_ADDRESSES.USDC
      const decimals = isCUSD ? 18 : 6
      const amountUnits = parseUnits(donateAmount, decimals)
      // feeCurrency: in MiniPay use cUSD (only supported option);
      // otherwise use the campaign's own token so gas comes from the same balance
      const feeCurrency = isMini
        ? (TOKEN_ADDRESSES.cUSD as `0x${string}`)
        : (tokenAddress as `0x${string}`)

      const approveHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [FUNDX_CONTRACT as `0x${string}`, amountUnits],
        feeCurrency,
      } as any)

      toast.loading("Confirming approval...", { id: "donate" })
      await waitForTransactionReceipt(config, { hash: approveHash })

      toast.loading("Sending donation...", { id: "donate" })
      const donateHash = await writeContractAsync({
        address: FUNDX_CONTRACT as `0x${string}`,
        abi: FUNDX_ABI,
        functionName: "donate",
        args: [BigInt(campaignIdNum), amountUnits],
        feeCurrency,
      } as any)

      toast.loading("Confirming donation...", { id: "donate" })
      const receipt = await waitForTransactionReceipt(config, { hash: donateHash })
      if (receipt.status !== "success") throw new Error("Donation was reverted on-chain")

      toast.success("Thank you for your contribution!", { id: "donate" })
      setDonateAmount("")
    } catch (error) {
       console.error(error)
       toast.error("Donation Failed", { id: "donate", description: "Failed to complete transaction on Celo." })
    }
  }

  const showDonateButton = isConnected || isMini

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-green-100 font-sans">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 pt-32 pb-20">
        
        <Link href="/explore" className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to campaigns
        </Link>

        <div className="mb-10 text-center md:text-left">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
             <Badge variant="secondary" className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 text-sm border border-green-100">
               {campaign.category}
             </Badge>
             <div className="flex items-center text-slate-500 text-sm font-medium">
               <MapPin className="w-3 h-3 mr-1" /> {campaign.location}
             </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
            {campaign.title}
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl">
            {campaign.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-10">
            
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-200 shadow-sm border border-slate-100 group">
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold bg-slate-100">
                 {/* Replace with actual image later */}
                 {campaign.title}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-slate-200 py-6 gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-4 border-white shadow-sm">
                  <AvatarImage src={campaign.creatorImage} />
                  <AvatarFallback>{campaign.creator?.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Organized by</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {campaign.creator?.startsWith("0x") ? `${campaign.creator.slice(0, 6)}...${campaign.creator.slice(-4)}` : campaign.creator}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-slate-600 font-medium">
                 <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> Verified</div>
                 <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-500"/> {campaign.backers} Backers</div>
              </div>
            </div>

            <Tabs defaultValue="story" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 mb-8 overflow-x-auto">
                <TabsTrigger value="story" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 px-6 py-3 text-base">
                  The Story
                </TabsTrigger>
                <TabsTrigger value="updates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 px-6 py-3 text-base">
                  Updates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="story" className="prose prose-slate prose-lg max-w-none text-slate-600">
                <p>{campaign.description}</p>
                <p>
                  This is the full story of the campaign. In a real app, this would be rich text content loaded from the database.
                </p>
                
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 my-8 not-prose">
                  <h4 className="font-bold text-green-800 mb-2">Risks & Challenges</h4>
                  <p className="text-green-700/80 text-sm">
                    All projects involve risk. Please do your own research (DYOR) before contributing.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="updates" className="py-8 text-center text-slate-500">
                 No updates yet.
              </TabsContent>
            </Tabs>
          </div>

     
          <div className="relative h-full">
            <div className="sticky top-32 p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl">
              
              <div className="space-y-5 mb-8">
                <div className="space-y-1">
                   <div className="text-4xl font-black text-slate-900 tracking-tight">${campaign.raised.toLocaleString()}</div>
                   <div className="text-base font-medium text-slate-400">raised of ${campaign.goal.toLocaleString()} goal</div>
                </div>
                
                <Progress value={progress} className="h-3 bg-slate-100" />

                <div className="flex justify-between text-sm font-bold pt-2">
                  <span className="text-slate-900">{Math.round(progress)}% funded</span>
                  <span className="flex items-center gap-1 text-green-600"><Clock className="w-4 h-4"/> {campaign.daysLeft} days left</span>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-lg">Make a contribution</h4>
                  <p className="text-sm text-slate-500">Support the creator to make this happen.</p>
                </div>
                
                <div className={`transition-all duration-300 ${!showDonateButton ? "opacity-50 grayscale pointer-events-none" : "opacity-100"}`}>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg ${campaign.currency === 'cUSD' ? 'text-green-600' : 'text-blue-600'}`}>
                      {campaign.currency || "cUSD"}
                    </span>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                      className="pl-24 h-14 rounded-xl border-slate-200 bg-slate-50 text-xl font-bold focus-visible:ring-green-500"
                    />
                  </div>
                </div>

                {showDonateButton ? (
                  <Button disabled={!!donateDisabledReason} onClick={handleDonate} className="w-full h-14 rounded-xl bg-slate-900 text-white shadow-glow hover:scale-[1.02] transition-transform text-lg font-bold">
                    {donateDisabledReason || "Donate Now"}
                  </Button>
                ) : (
                  <div className="flex justify-center mt-4">
                    <ConnectButton />
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Secure transaction via Celo</span>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                 <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl h-12">
                    <Share2 className="w-4 h-4 mr-2" /> Share this campaign
                 </Button>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}