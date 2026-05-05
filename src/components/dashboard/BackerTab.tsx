import { Clock, CheckCircle2, Rocket, RefreshCcw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { useWriteContract, useAccount, useReadContracts } from "wagmi"
import { FUNDX_CONTRACT, TOKEN_ADDRESSES } from "@/lib/celo-config"
import { FUNDX_ABI } from "@/lib/fundx-abi"
import { toast } from "sonner"
import { useCampaignCount } from "@/lib/hooks/useContract"
import { formatUnits } from "viem"
import { useMemo } from "react"

type ContributionStatus = "active" | "successful" | "refund_available";

export interface BackerContribution {
  id: string;
  title: string;
  image: string;
  myContribution: number;
  totalRaised: number;
  goal: number;
  currency: "cUSD" | "USDC";
  model: "Flexible Model" | "All-or-Nothing";
  status: ContributionStatus;
  daysRemaining?: number;
}

const MOCK_CONTRIBUTIONS: BackerContribution[] = [
  { id: "mock-1", title: "Green Mining Farm", image: "/campaign-3.jpg", myContribution: 500, totalRaised: 12000, goal: 50000, currency: "USDC", model: "All-or-Nothing", status: "refund_available" },
  { id: "mock-2", title: "Celo Dev Bootcamp", image: "/campaign-1.jpg", myContribution: 1200, totalRaised: 4500, goal: 10000, currency: "USDC", model: "All-or-Nothing", status: "active", daysRemaining: 12 },
  { id: "mock-3", title: "DeFi Yield Aggregator", image: "/campaign-2.jpg", myContribution: 250, totalRaised: 55000, goal: 50000, currency: "cUSD", model: "Flexible Model", status: "successful" }
];

const formatMoney = (amount: number, currency: string) => {
  return `$${amount.toLocaleString()} ${currency}`;
};

function RefundCard({ contribution }: { contribution: BackerContribution }) {
  const { writeContractAsync } = useWriteContract();
  const { isConnected } = useAccount();

  const handleRefund = async (id: string) => {
    if (!isConnected) {
       toast.error("Connect Wallet", { description: "You need to connect your wallet." });
       return;
    }

    if (id.startsWith("mock-")) {
       toast.info("Mock Campaign", { description: "Cannot claim refund for a mock campaign." });
       return;
    }
    
    try {
      toast.loading("Claiming refund...", { id: "refund" });
      await writeContractAsync({
        address: FUNDX_CONTRACT as `0x${string}`,
        abi: FUNDX_ABI,
        functionName: "claimRefund",
        args: [BigInt(id)],
      });
      toast.success("Refund claimed successfully!", { id: "refund" });
    } catch (e) {
      console.error(e);
      toast.error("Refund Failed", { id: "refund", description: "Could not claim refund." });
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-blue-200 shadow-[0_12px_28px_-6px_rgba(59,130,246,0.12)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform_ duration-300">
       <div className="absolute -right-4 -bottom-10 text-[120px] font-black text-blue-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">REFUND</div>
       <RefreshCcw strokeWidth={1} className="absolute right-10 -bottom-12 w-72 h-72 text-blue-500 opacity-5 z-0 pointer-events-none" />
       <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 z-10" />
       
       <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
          <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow grayscale-[0.2]">
             <Image src={contribution.image} alt={contribution.title} fill className="object-cover" />
          </div>
          <div className="space-y-3 w-full">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-100/50 text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                   <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> Goal Missed
                </span>
                <span className="text-slate-400 text-sm font-semibold">{contribution.model}</span>
             </div>
             <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{contribution.title}</h3>
             <div className="flex items-center gap-4 text-sm mt-4">
                <div className="font-semibold text-blue-900 bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                   My Contribution: <span className="text-blue-600 font-extrabold">{formatMoney(contribution.myContribution, contribution.currency)}</span>
                </div>
                <div className="text-slate-500 font-medium text-base">Project raised {formatMoney(contribution.totalRaised, contribution.currency)}</div>
             </div>
          </div>
       </div>
       
       <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
          <Button onClick={() => handleRefund(contribution.id)} className="w-full md:w-auto h-16 px-10 rounded-xl bg-gradient-to-b from-blue-400 to-blue-500 border border-blue-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(59,130,246,0.4)] font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 active:shadow-inner flex items-center gap-2">
             <RefreshCcw className="w-5 h-5" /> Claim Refund
          </Button>
       </div>
    </div>
  )
}

function ActiveContributionCard({ contribution }: { contribution: BackerContribution }) {
  const progress = Math.min((contribution.totalRaised / contribution.goal) * 100, 100);

  return (
    <div className="bg-white p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden hover:-translate-y-1 transition-transform_ duration-300">
       <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-orange-50 opacity-80 z-0 select-none pointer-events-none tracking-tighter leading-none">ACTIVE</div>
       <Rocket strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-orange-500 opacity-[0.04] z-0 pointer-events-none transform_ -rotate-12" />
       <div className="absolute top-0 left-0 w-2 h-full bg-gradient-tush z-10" />
       
       <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
          <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
             <Image src={contribution.image} alt={contribution.title} fill className="object-cover" />
          </div>
          <div className="space-y-3 w-full">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100/50 text-orange-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                   <Clock className="w-3.5 h-3.5" /> Funding
                </span>
                <span className="text-slate-400 text-sm font-semibold">{contribution.model}</span>
             </div>
             <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{contribution.title}</h3>
             <div className="flex items-center gap-4 text-sm mt-4">
                <div className="font-semibold text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                   My Contribution: <span className="text-orange-600 font-extrabold">{formatMoney(contribution.myContribution, contribution.currency)}</span>
                </div>
                <div className="text-slate-500 font-medium text-base">Goal: {contribution.goal.toLocaleString()} {contribution.currency}</div>
             </div>
             <div className="w-full max-w-md bg-slate-100 rounded-full h-8 mt-6 overflow-hidden shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] border border-slate-200/50 p-1 relative z-10">
                <div className="bg-gradient-to-r from-[#FF6B4A] to-[#FF3D71] h-full rounded-full shadow-[0_0_15px_rgba(255,107,74,0.6)] relative flex items-center px-4" style={{ width: `${progress}%` }}>
                   <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
                </div>
             </div>
          </div>
       </div>

       <div className="w-full md:w-auto shrink-0 text-left md:text-right px-4 relative z-10 mt-6 md:mt-0">
          <div className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">{contribution.daysRemaining} Days</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Remaining</div>
       </div>
    </div>
  )
}

function SuccessfulContributionCard({ contribution }: { contribution: BackerContribution }) {
  return (
    <div className="bg-slate-50 p-8 md:p-10 min-h-[240px] rounded-[2rem] border border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500">
       <div className="absolute -right-4 -bottom-10 text-[130px] font-black text-slate-200 opacity-50 z-0 select-none pointer-events-none tracking-tighter leading-none">SUCCESS</div>
       <CheckCircle2 strokeWidth={1} className="absolute right-10 -bottom-10 w-72 h-72 text-slate-300 opacity-20 z-0 pointer-events-none" />
       <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 z-10" />
       
       <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full pl-2 relative z-10">
          <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-300 shadow-sm group-hover:shadow-md transition-shadow">
             <Image src={contribution.image} alt={contribution.title} fill className="object-cover" />
          </div>
          <div className="space-y-3 w-full">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                   <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Funded
                </span>
                <span className="text-slate-400 text-sm font-semibold">{contribution.model}</span>
             </div>
             <h3 className="text-3xl font-bold text-slate-700 tracking-tight">{contribution.title}</h3>
             <div className="flex items-center gap-4 text-sm mt-4">
                <div className="font-semibold text-slate-600 bg-white/80 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] text-base">
                   My Contribution: {formatMoney(contribution.myContribution, contribution.currency)}
                </div>
             </div>
          </div>
       </div>
       
       <div className="w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
          <Button variant="outline" disabled className="w-full md:w-auto h-16 px-10 rounded-xl bg-white border-slate-200 text-slate-600 font-bold shadow-sm cursor-not-allowed text-lg">
             View Project
          </Button>
       </div>
    </div>
  )
}

export function BackerTab() {
  const { address } = useAccount();

  const { data: countData } = useCampaignCount();
  const count = Number(countData || 0);

  const campaignContracts = useMemo(() => {
     const c = [];
     for (let i = 1; i <= count; i++) {
        c.push({
           address: FUNDX_CONTRACT as `0x${string}`,
           abi: FUNDX_ABI,
           functionName: 'getCampaign',
           args: [BigInt(i)]
        });
     }
     return c;
  }, [count])

  const donationContracts = useMemo(() => {
     const c = [];
     for (let i = 1; i <= count; i++) {
        c.push({
           address: FUNDX_CONTRACT as `0x${string}`,
           abi: FUNDX_ABI,
           functionName: 'getDonation',
           args: [BigInt(i), address as `0x${string}`]
        });
     }
     return c;
  }, [count, address])

  const { data: campaignsData, isLoading: isLoading1 } = useReadContracts({
    contracts: campaignContracts,
    query: {
       enabled: count > 0 && !!address
    }
  });

  const { data: donationsData, isLoading: isLoading2 } = useReadContracts({
    contracts: donationContracts,
    query: {
       enabled: count > 0 && !!address
    }
  });
  
  const isLoading = isLoading1 || isLoading2;

  const liveContributions: BackerContribution[] = [];

  if (campaignsData && donationsData && address) {
     campaignsData.forEach((result, index) => {
        const donationResult = donationsData[index];
        if (result.status === 'success' && result.result && donationResult?.status === 'success') {
           const camp = result.result as any;
           const rawDonation = donationResult.result as bigint;

           if (rawDonation > BigInt(0)) {
              const isCUSD = camp.token.toLowerCase() === TOKEN_ADDRESSES.cUSD.toLowerCase();
              const decimals = isCUSD ? 18 : 6;
              const myContribution = Number(formatUnits(rawDonation, decimals));
              const goal = Number(formatUnits(camp.goal, decimals));
              const totalRaised = Number(formatUnits(camp.totalRaised, decimals));
              const id = String(index + 1);
              const deadline = Number(camp.deadline);
              const fundingModelUint = Number(camp.fundingModel);
              
              let status: ContributionStatus = "active";
              const now = Date.now() / 1000;
              const isPastDeadline = deadline <= now;
              const isAllOrNothing = fundingModelUint === 1;

              if (!isPastDeadline) {
                 status = "active";
              } else if (!isAllOrNothing) {
                 status = "successful";
              } else if (isAllOrNothing && totalRaised >= goal) {
                 status = "successful";
              } else if (isAllOrNothing && totalRaised < goal && isPastDeadline) {
                 status = "refund_available";
              }
              
              const daysRemaining = Math.max(0, Math.floor((deadline - now) / 86400));
              
              liveContributions.push({
                 id,
                 title: `Project #${id}`,
                 image: "/campaign-2.jpg",
                 myContribution,
                 totalRaised,
                 goal,
                 currency: isCUSD ? "cUSD" : "USDC",
                 model: isAllOrNothing ? "All-or-Nothing" : "Flexible Model",
                 status,
                 daysRemaining
              });
           }
        }
     });
  }

  const allContributions = [...liveContributions, ...MOCK_CONTRIBUTIONS];

  if (isLoading && count > 0) {
    return <TabsContent value="contributions"><div className="p-8 text-center text-slate-500">Loading your contributions...</div></TabsContent>
  }

  return (
    <TabsContent value="contributions" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {allContributions.map((contribution) => {
          if (contribution.status === "refund_available") return <RefundCard key={contribution.id} contribution={contribution} />
          if (contribution.status === "active") return <ActiveContributionCard key={contribution.id} contribution={contribution} />
          if (contribution.status === "successful") return <SuccessfulContributionCard key={contribution.id} contribution={contribution} />
          
          return null;
       })}

    </TabsContent>
  )
}