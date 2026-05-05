"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/fundx/Navbar"
import { Footer } from "@/components/fundx/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAccount, useWriteContract } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"
import { parseUnits } from "viem"
import { FUNDX_ABI } from "@/lib/fundx-abi"
import { FUNDX_CONTRACT, TOKEN_ADDRESSES, config } from "@/lib/celo-config"
import { toast } from "sonner"

import { WizardSteps } from "@/components/create/WizardSteps"
import { LivePreview } from "@/components/create/LivePreview"
import { isMiniPay } from "@/lib/wallet"

export interface CreateCampaignData {
  creatorName: string;
  creatorBio: string;
  email: string;
  twitter: string;       
  github: string;        
  portfolio: string;     
  title: string;
  tagline: string;
  category: string;
  projectStage: string;
  description: string;
  videoUrl: string;      
  budgetBreakdown: string; 
  roadmap: string;       
  image: string;
  goal: string;
  duration: string;
  fundingModel: "0" | "1";
  currency: "cUSD" | "USDC"; 
}

export default function CreateCampaign() {
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState(1)
  const [isMini, setIsMini] = useState(false)
  
  const [formData, setFormData] = useState<CreateCampaignData>({
    creatorName: "",
    creatorBio: "",
    email: "",
    twitter: "",
    github: "",
    portfolio: "",
    title: "",
    tagline: "",
    category: "DeFi",
    projectStage: "MVP",
    description: "",
    videoUrl: "",
    budgetBreakdown: "",
    roadmap: "",
    image: "",
    goal: "10000",
    duration: "30",
    fundingModel: "0",
    currency: "cUSD", 
  })

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  useEffect(() => {
    if (isMiniPay()) {
      setIsMini(true)
      setFormData((prev) => ({ ...prev, currency: "cUSD" }))
    }
  }, [])

  const handleSubmit = async () => {
    if (!isConnected && !isMini) {
      toast.error("Connect Wallet", {
        description: "You need to connect your wallet to deploy.",
      });
      return;
    }
    try {
      toast.loading("Deploying Campaign...", { id: "deploy" })
      const tokenAddress = formData.currency === "cUSD" ? TOKEN_ADDRESSES.cUSD : TOKEN_ADDRESSES.USDC
      const decimals = formData.currency === "cUSD" ? 18 : 6
      const goalUnits = parseUnits(formData.goal, decimals)
      const durationSeconds = BigInt(Number(formData.duration) * 86400)
      const fundingModelUint = Number(formData.fundingModel)
      // feeCurrency: in MiniPay use cUSD (only supported); otherwise use the campaign token
      const feeCurrency = isMini
        ? (TOKEN_ADDRESSES.cUSD as `0x${string}`)
        : (tokenAddress as `0x${string}`)

      const hash = await writeContractAsync({
        address: FUNDX_CONTRACT as `0x${string}`,
        abi: FUNDX_ABI,
        functionName: "createCampaign",
        args: [tokenAddress as `0x${string}`, goalUnits, durationSeconds, fundingModelUint],
        feeCurrency,
      } as any)

      toast.loading("Confirming on-chain...", { id: "deploy" })
      const receipt = await waitForTransactionReceipt(config, { hash })
      if (receipt.status !== "success") throw new Error("Campaign creation was reverted on-chain")

      toast.success("Campaign Deployed!", { id: "deploy" })
    } catch (error) {
      console.error(error)
      toast.error("Deployment Failed", { id: "deploy", description: "Failed to deploy on Celo." })
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Launch your Vision
          </h1>
          <p className="text-slate-500 text-lg">
            Create a trustless <strong>cUSD</strong> crowdfunding campaign.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* LEFT: Wizard */}
          <div className="space-y-8">
          
       {/* Steps Indicator */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
               {["Identity", "Bio", "Basics", "Story", "Execute", "Fund"].map((label, idx) => {
                 const num = idx + 1;
                 
                 // 🚨 Determine the status of the step
                 const isCompleted = step > num;
                 const isCurrent = step === num;
                 
                 // 🚨 Apply the right colors
                 let circleStyle = "bg-white text-slate-300 border-slate-200"; // Upcoming
                 if (isCompleted) circleStyle = "bg-[#FF6B4A] text-white border-[#FF6B4A]"; // Completed (Orange)
                 else if (isCurrent) circleStyle = "bg-slate-900 text-white border-slate-900"; // Current (Black)

                 return (
                   <div key={num} className="flex items-center gap-2 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${circleStyle}`}>
                         {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : num}
                      </div>
                      <span className={`text-sm font-bold ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-300"}`}>{label}</span>
                   </div>
                 )
               })}
            </div>

            <div className="bg-white p-8 pb-28 rounded-[2rem] shadow-xl border border-slate-100 min-h-[550px] relative">
              {/* RENDER STEP MODULE */}
              <WizardSteps
                step={step}
                formData={formData}
                setFormData={setFormData}
              />

              {/* NAVIGATION */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="h-12 px-6 rounded-xl text-slate-500 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <Button
                    onClick={handleNext}
                    className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 transition-all"
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="h-12 px-8 rounded-xl bg-gradient-tush text-white shadow-glow hover:scale-105 transition-all font-bold"
                  >
                    {(isConnected || isMini) ? "Deploy Campaign" : "Connect & Deploy"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Preview Module */}
          <div className="hidden lg:block relative">
            <LivePreview formData={formData} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
