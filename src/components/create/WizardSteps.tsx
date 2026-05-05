"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket } from "lucide-react"
import { CreateCampaignData } from "@/app/create/page" 


interface WizardProps {
  step: number
  formData: CreateCampaignData
  setFormData: (data: CreateCampaignData) => void
}

export function WizardSteps({ step, formData, setFormData }: WizardProps) {
  
  // STEP 1: IDENTITY
  if (step === 1) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Who is building this?</h2>
            <p className="text-slate-500 text-sm">Let's get your basic details and social proof.</p>
         </div>
         <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                 <Label>Creator Name / Org</Label>
                 <Input placeholder="e.g. Satoshi Nakamoto" className="h-14 rounded-xl" value={formData.creatorName} onChange={(e) => setFormData({...formData, creatorName: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label>Email (Private)</Label>
                 <Input placeholder="you@example.com" className="h-14 rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
               <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input placeholder="@username" className="h-14 rounded-xl" value={formData.twitter} onChange={(e) => setFormData({...formData, twitter: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>GitHub</Label>
                  <Input placeholder="github.com/..." className="h-14 rounded-xl" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Website / Portfolio</Label>
                  <Input placeholder="https://..." className="h-14 rounded-xl" value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} />
               </div>
            </div>
         </div>
      </div>
    )
  }

  // STEP 2: BIO (Lots of room to type)
  if (step === 2) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Background</h2>
            <p className="text-slate-500 text-sm">Why are you the right person or team to build this?</p>
         </div>
         <div className="space-y-4">
            <Textarea 
               placeholder="Tell us about your past experience, previous projects, and what drives you..." 
               className="h-64 rounded-xl resize-none p-5 text-base leading-relaxed"
               value={formData.creatorBio}
               onChange={(e) => setFormData({...formData, creatorBio: e.target.value})}
            />
         </div>
      </div>
    )
  }

 // STEP 3: BASICS
  if (step === 3) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Project Basics</h2>
            <p className="text-slate-500 text-sm">Define what you are building and give it a face.</p>
         </div>
         <div className="space-y-6">
            <div className="space-y-2">
               <Label>Project Title</Label>
               <Input placeholder="e.g. Celo DeFi Academy" className="h-14 rounded-xl text-lg font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
               <div className="space-y-2">
                  <Label>Short Tagline</Label>
                  <Input placeholder="Explain it in one catchy sentence..." className="h-14 rounded-xl" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} />
               </div>
    

           
               <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input 
                     placeholder="https://example.com/image.png" 
                     className="h-14 rounded-xl" 
                     value={formData.image} 
                     onChange={(e) => setFormData({...formData, image: e.target.value})} 
                  />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-4">
              <div className="space-y-2">
                 <Label>Category</Label>
                 <Select onValueChange={(val) => setFormData({...formData, category: val})} defaultValue={formData.category}>
                    <SelectTrigger className="h-14 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                       <SelectItem value="DeFi">DeFi & Finance</SelectItem>
                       <SelectItem value="Mining">Mining & Infra</SelectItem>
                       <SelectItem value="Education">Education</SelectItem>
                       <SelectItem value="Gaming">Gaming</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label>Current Stage</Label>
                 <Select onValueChange={(val) => setFormData({...formData, projectStage: val})} defaultValue={formData.projectStage}>
                    <SelectTrigger className="h-14 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                       <SelectItem value="Idea">Concept / Idea</SelectItem>
                       <SelectItem value="Prototype">Prototype / Alpha</SelectItem>
                       <SelectItem value="MVP">Live MVP</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
         </div>
      </div>
    )
  }
  // STEP 4: THE STORY (Massive text box)
  if (step === 4) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">The Pitch</h2>
            <p className="text-slate-500 text-sm">Explain the problem and how your product fixes it.</p>
         </div>
         <div className="space-y-5">
            <div className="space-y-2">
               <Label>Pitch Video URL (Optional but highly recommended)</Label>
               <Input placeholder="https://youtube.com/..." className="h-14 rounded-xl" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
               <Label>The Problem & Solution</Label>
               <Textarea 
                  placeholder="Dive deep. What specific problem are you solving? How does it work? Why now?" 
                  className="h-64 rounded-xl resize-none p-5 text-base leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>
         </div>
      </div>
    )
  }

  // STEP 5: EXECUTION (Stacked big boxes)
  if (step === 5) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Execution Plan</h2>
            <p className="text-slate-500 text-sm">Show backers exactly how you will spend their funds and hit your goals.</p>
         </div>
         <div className="space-y-6">
            <div className="space-y-2">
               <Label>Budget Breakdown</Label>
               <Textarea 
                  placeholder="e.g., 60% Full-Stack Dev ($6,000), 20% Audits ($2,000), 20% Infrastructure ($2,000)..." 
                  className="h-32 rounded-xl resize-none p-4"
                  value={formData.budgetBreakdown}
                  onChange={(e) => setFormData({...formData, budgetBreakdown: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <Label>Product Roadmap</Label>
               <Textarea 
                  placeholder="Month 1: Smart contracts finalized. Month 2: Testnet launch. Month 3: Mainnet deployment..." 
                  className="h-32 rounded-xl resize-none p-4"
                  value={formData.roadmap}
                  onChange={(e) => setFormData({...formData, roadmap: e.target.value})}
               />
            </div>
         </div>
      </div>
    )
  }


 if (step === 6) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Funding Goals</h2>
            <p className="text-slate-500 text-sm">Set your target and define your on-chain rules.</p>
         </div>
         

         <div className="space-y-2 mb-6">
            <Label>Funding Asset</Label>
            <Select onValueChange={(val) => setFormData({...formData, currency: val as "cUSD" | "USDC"})} defaultValue={formData.currency}>
               <SelectTrigger className="h-14 rounded-xl text-base font-bold text-slate-700 bg-white border-slate-200 shadow-sm">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                  <SelectItem value="cUSD" className="text-sm font-bold text-green-600 py-3 cursor-pointer">cUSD (Celo Dollar)</SelectItem>
                  <SelectItem value="USDC" className="text-sm font-bold text-blue-500 py-3 cursor-pointer">USDC (Circle USD)</SelectItem>
               </SelectContent>
            </Select>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label>Target Amount</Label>
               <div className="relative">
     
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${formData.currency === 'cUSD' ? 'text-green-600' : 'text-blue-500'}`}>
                     {formData.currency}
                  </span>
                  <Input type="number" className="pl-20 h-14 rounded-xl text-lg font-bold" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})} />
               </div>
            </div>
            <div className="space-y-2">
               <Label>Duration (Days)</Label>
               <Input type="number" className="h-14 rounded-xl text-lg font-bold" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            </div>
         </div>

         <div className="space-y-2 mt-6">
            <Label>Funding Model</Label>
            <Select onValueChange={(val) => setFormData({...formData, fundingModel: val as "0" | "1"})} defaultValue={formData.fundingModel}>
               <SelectTrigger className="h-12 rounded-xl text-sm font-semibold text-slate-700 bg-white border-slate-200 shadow-sm">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                  <SelectItem value="0" className="text-sm font-medium text-slate-700 py-3 cursor-pointer">Flexible (Keep what you raise)</SelectItem>
                  <SelectItem value="1" className="text-sm font-medium text-slate-700 py-3 cursor-pointer">All-or-Nothing (Refunds if goal fails)</SelectItem>
               </SelectContent>
            </Select>
         </div>

         <div className={`p-6 rounded-xl border flex gap-4 items-start mt-6 ${formData.currency === 'cUSD' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
               <Rocket className={`w-5 h-5 ${formData.currency === 'cUSD' ? 'text-green-500' : 'text-blue-500'}`} />
            </div>
            <div>
               <h4 className={`font-bold ${formData.currency === 'cUSD' ? 'text-green-900' : 'text-blue-900'}`}>
                  Raising in {formData.currency}
               </h4>
               <p className={`text-sm mt-1 ${formData.currency === 'cUSD' ? 'text-green-700/80' : 'text-blue-700/80'}`}>
                  {formData.currency === 'cUSD' 
                     ? "cUSD ensures your funding runway doesn't evaporate due to market volatility, natively on Celo." 
                     : "USDC is the industry standard stablecoin, providing deep liquidity and trust."}
               </p>
            </div>
         </div>
      </div>
    )
  }
  return null
}