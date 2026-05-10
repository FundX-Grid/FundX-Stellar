import { Clock, XCircle, CheckCircle2, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { useWriteContract, useAccount, useReadContracts } from "wagmi"
import { FUNDX_CONTRACT, TOKEN_ADDRESSES } from "@/lib/celo-config"
import { FUNDX_ABI } from "@/lib/fundx-abi"
import { toast } from "sonner"
import { useCampaignCount } from "@/lib/hooks/useContract"
import { formatUnits } from "viem"

type CampaignStatus = "active" | "successful" | "failed";

interface CreatorCampaign {
  id: string;
  title: string;
  image: string;
  raised: number;
  goal: number;
  currency: "cUSD" | "USDC";
  model: "Flexible Model" | "All-or-Nothing";
  status: CampaignStatus;
  daysRemaining?: number;
}

const MOCK_CREATOR_CAMPAIGNS: CreatorCampaign[] = [
  {
    id: "mock-1",
    title: "DeFi Yield Aggregator",
    image: "/campaign-2.jpg",
    raised: 55000,
    goal: 50000,
    currency: "cUSD",
    model: "Flexible Model",
    status: "successful",
  },
  {
    id: "mock-2",
    title: "Celo Dev Bootcamp",
    image: "/campaign-1.jpg",
    raised: 4500,
    goal: 10000,
    currency: "USDC",
    model: "All-or-Nothing",
    status: "active",
    daysRemaining: 12,
  },
  {
    id: "mock-3",
    title: "NFT Marketplace",
    image: "/campaign-3.jpg",
    raised: 1200,
    goal: 50000,
    currency: "USDC",
    model: "All-or-Nothing",
    status: "failed",
  }
];

export function CreatorTab() {
  const { writeContractAsync } = useWriteContract();
  const { isConnected, address } = useAccount();

  const { data: countData } = useCampaignCount();
  const count = Number(countData || 0);

  const contracts = [];
  for (let i = 1; i <= count; i++) {
     contracts.push({
        address: FUNDX_CONTRACT as `0x${string}`,
        abi: FUNDX_ABI,
        functionName: 'getCampaign',
        args: [BigInt(i)]
     });
  }

  const { data: campaignsData, isLoading } = useReadContracts({
    contracts,
    query: {
       enabled: count > 0 && !!address
    }
  });

  const liveCreatorCampaigns: CreatorCampaign[] = [];
  
  if (campaignsData && address) {
     campaignsData.forEach((result, index) => {
        if (result.status === 'success' && result.result) {
           const camp = result.result as any;
           
           if (camp.creator.toLowerCase() === address.toLowerCase()) {
              const model = camp.fundingModel === 0 ? "Flexible Model" : "All-or-Nothing";
              const isCUSD = camp.token.toLowerCase() === TOKEN_ADDRESSES.cUSD.toLowerCase();
              const decimals = isCUSD ? 18 : 6;
              const goal = Number(formatUnits(camp.goal, decimals));
              const raised = Number(formatUnits(camp.totalRaised, decimals));
              const id = String(index + 1);
              const deadline = Number(camp.deadline);
              
              let status: CampaignStatus = "active";
              
              const now = Date.now() / 1000;
              const isPastDeadline = deadline <= now;
              
              if (camp.withdrawn) {
                 status = "successful";
              } else if (!isPastDeadline) {
                 status = "active";
              } else if (model === "Flexible Model") {
                 status = "successful";
              } else if (raised >= goal) {
                 status = "successful";
              } else {
                 status = "failed";
              }
              
              const daysRemaining = Math.max(0, Math.floor((deadline - now) / 86400));
              
              liveCreatorCampaigns.push({
                 id,
                 title: `My Campaign #${id}`, 
                 image: "/campaign-1.jpg",
                 raised,
                 goal,
                 currency: isCUSD ? "cUSD" : "USDC",
                 model,
                 status,
                 daysRemaining
              });
           }
        }
     });
  }

  const allCampaigns = [...liveCreatorCampaigns, ...MOCK_CREATOR_CAMPAIGNS];

  const handleWithdraw = async (id: string, model: string, goal: number, raised: number) => {
    if (!isConnected) {
       toast.error("Connect Wallet", { description: "You need to connect your wallet." });
       return;
    }
    
    if (id.startsWith("mock-")) {
       toast.info("Mock Campaign", { description: "This is a mock campaign and cannot be withdrawn on-chain." });
       return;
    }

    if (model === "All-or-Nothing" && raised < goal) {
       toast.error("Cannot Withdraw", { description: "Goal must be met for All-or-Nothing campaigns." });
       return;
    }

    try {
      toast.loading("Withdrawing funds...", { id: "withdraw" });
      await writeContractAsync({
        address: FUNDX_CONTRACT as `0x${string}`,
        abi: FUNDX_ABI,
        functionName: "withdraw",
        args: [BigInt(id)],
      });
      toast.success("Funds withdrawn successfully!", { id: "withdraw" });
      
      // Usually you'd invalidate the query here, but a page reload works for now or the user checks wallet
    } catch (e) {
      console.error(e);
      toast.error("Withdrawal Failed", { id: "withdraw", description: "Could not withdraw funds." });
    }
  };

  const formatMoney = (amount: number, currency: string) => {
    return `$${amount.toLocaleString()} ${currency}`;
  };

  if (isLoading && count > 0) {
    return <TabsContent value="campaigns"><div className="p-8 text-center text-slate-500">Loading your campaigns...</div></TabsContent>
  }

  return (
    <TabsContent value="campaigns" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {allCampaigns.map((campaign) => {
          
          const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);

          if (campaign.status === "successful") {
             return (
                <div key={campaign.id} className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                   <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-green-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">SUCCESS</div>
                   <CheckCircle2 strokeWidth={1} className="absolute right-10 -bottom-12 w-72 h-72 text-green-500 opacity-5 z-0 pointer-events-none" />
                   <div className="absolute top-0 left-0 w-2 h-full bg-green-500 z-10" />
                   
                   <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
                      <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                         <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-3 w-full">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-green-50 border border-green-100/50 text-green-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                               <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Successful
                            </span>
                            <span className="text-slate-400 text-sm font-semibold">{campaign.model}</span>
                         </div>
                         <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.title}</h3>
                         <div className="flex items-center gap-4 text-sm mt-4">
                            <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                               Raised: <span className="text-green-600 font-extrabold">{formatMoney(campaign.raised, campaign.currency)}</span>
                            </div>
                            <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} {campaign.currency}</div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="w-full md:w-auto shrink-0 relative z-10">
                      <Button onClick={() => handleWithdraw(campaign.id, campaign.model, campaign.goal, campaign.raised)} disabled={campaign.model === "All-or-Nothing" && campaign.raised < campaign.goal} className="w-full md:w-auto h-16 px-10 rounded-xl bg-gradient-to-b from-green-300 to-green-400 border border-green-500 text-green-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_15px_rgba(134,239,172,0.5)] font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 active:shadow-inner disabled:opacity-50 disabled:grayscale">
                         Withdraw Funds
                      </Button>
                   </div>
                </div>
             )
          }

          if (campaign.status === "active") {
             return (
                <div key={campaign.id} className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                   <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-orange-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">ACTIVE</div>
                   <Rocket strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-orange-500 opacity-[0.04] z-0 pointer-events-none transform -rotate-12" />
                   <div className="absolute top-0 left-0 w-2 h-full bg-gradient-tush z-10" />
                   
                   <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
                      <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                         <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-3 w-full">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100/50 text-orange-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                               <Clock className="w-3.5 h-3.5" /> Active
                            </span>
                            <span className="text-slate-400 text-sm font-semibold">{campaign.model}</span>
                         </div>
                         <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.title}</h3>
                         <div className="flex items-center gap-4 text-sm mt-4">
                            <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                               Raised: <span className="text-orange-600 font-extrabold">{formatMoney(campaign.raised, campaign.currency)}</span>
                            </div>
                            <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} {campaign.currency}</div>
                         </div>
                         <div className="w-full max-w-md bg-slate-100 rounded-full h-6 mt-6 overflow-hidden shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] border border-slate-200/50 p-1 relative z-10">
                            <div className="bg-gradient-to-r from-[#FF6B4A] to-[#FF3D71] h-full rounded-full shadow-[0_0_15px_rgba(255,107,74,0.6)] relative flex items-center px-4" style={{ width: `${progress}%` }}>
                               <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-auto shrink-0 text-left md:text-right px-4 relative z-10 mt-6 md:mt-0">
                      <div className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">{campaign.daysRemaining} Days</div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Remaining</div>
                   </div>
                </div>
             )
          }

          if (campaign.status === "failed") {
             return (
                <div key={campaign.id} className="bg-slate-50 p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
                   <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-slate-200 opacity-50 z-0 select-none pointer-events-none tracking-tighter leading-none">FAILED</div>
                   <XCircle strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-slate-500 opacity-5 z-0 pointer-events-none" />
                   <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 z-10" />
                   
                   <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
                      <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-300 shadow-sm group-hover:shadow-md transition-shadow">
                         <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-3 w-full">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-white border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                               <XCircle className="w-3.5 h-3.5 text-red-500" /> Failed
                            </span>
                            <span className="text-slate-400 text-sm font-semibold">{campaign.model}</span>
                         </div>
                         <h3 className="text-3xl font-bold text-slate-500 line-through decoration-slate-300 decoration-2 tracking-tight">{campaign.title}</h3>
                         <div className="flex items-center gap-4 text-sm mt-4">
                            <div className="font-semibold text-slate-500 bg-white/50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                               Raised: {formatMoney(campaign.raised, campaign.currency)}
                            </div>
                            <div className="text-slate-500 font-medium text-base">Goal: {campaign.goal.toLocaleString()} {campaign.currency}</div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
                      <Button variant="outline" disabled className="w-full md:w-auto h-16 px-10 rounded-xl bg-slate-100 border-slate-200 text-slate-400 font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] cursor-not-allowed text-lg">
                         Goal Not Met
                      </Button>
                   </div>
                </div>
             )
          }

       })}

    </TabsContent>
  )
}