"use client"
import { LayoutDashboard, Wallet, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/fundx/Navbar"
import { Footer } from "@/components/fundx/Footer"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CreatorTab } from "@/components/dashboard/CreatorTab"
import { BackerTab } from "@/components/dashboard/BackerTab" 


export default function DashboardPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 pt-48 pb-20 text-center">
           <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-6" />
           <h1 className="text-3xl font-bold text-slate-900 mb-4">Connect your wallet</h1>
           <p className="text-slate-500 mb-8">You need to connect your wallet to view your dashboard.</p>
           <div className="flex justify-center">
             <ConnectButton />
           </div>
        </div>
        <Footer />
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto max-w-6xl px-4 pt-32 pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
           <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
             <LayoutDashboard className="w-6 h-6 text-orange-500" />
           </div>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Capital Hub</h1>
        </div>

        {/* The Tabs (Creator vs Backer) */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-auto p-0 mb-8 no-scrollbar">
            <TabsTrigger value="campaigns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 px-6 py-3 text-base font-bold">
              My Campaigns
            </TabsTrigger>
            <TabsTrigger value="contributions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 px-6 py-3 text-base font-bold">
              My Contributions
            </TabsTrigger>
          </TabsList>
          
  {/* Creator View: My Campaigns */}
       <CreatorTab />
          
          {/* Backer View Placeholder */}
      <BackerTab />
        </Tabs>

     

      </div>
      
      <Footer />
    </main>
  )
}