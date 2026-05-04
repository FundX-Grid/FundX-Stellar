"use client"

import { useState, useMemo, useEffect } from "react"
import { Navbar } from "@/components/fundx/Navbar"
import { Footer } from "@/components/fundx/Footer"
import { CampaignCard } from "@/components/fundx/CampaignCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowUp, Sparkles, Filter } from "lucide-react" // 🚨 ADDED: Filter icon
import { CAMPAIGNS } from "@/lib/data"

const CATEGORIES = ["All", "DeFi", "Mining", "Gaming", "Social Impact", "Infrastructure"]
const STATUSES = ["All", "active", "successful", "failed"] // 🚨 ADDED: Status options

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All") // 🚨 ADDED: Status state
  const [visibleCount, setVisibleCount] = useState(3) // Start low to show "Load More"
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 1. Scroll Detection for "Back to Top"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

// 2. Filter & Sort Logic (Bulletproofed)
  const filteredCampaigns = useMemo(() => {
    // Step 1: Safely Filter
    const filtered = CAMPAIGNS.filter((c) => {
      const searchTarget = searchQuery.toLowerCase();
      
      // Fallbacks added: (c.title || "") prevents crashes if a field is accidentally left blank
      const matchesSearch = 
        (c.title || "").toLowerCase().includes(searchTarget) || 
        (c.description || "").toLowerCase().includes(searchTarget);
      
      const matchesCategory = 
        selectedCategory === "All" || 
        c.category === selectedCategory || 
        (selectedCategory === "DeFi" && (c.category || "").includes("DeFi"));

      // Fallback: If a campaign is missing a status, treat it as "active"
      const campaignStatus = c.status || "active";
      const matchesStatus = statusFilter === "All" || campaignStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Step 2: Safely Sort (Active -> Successful -> Failed)
    return filtered.sort((a, b) => {
      const statusWeight: Record<string, number> = {
        active: 1,
        successful: 2,
        failed: 3
      };
      
      // Assign weight, defaulting to 1 (active) if something is wrong
      const weightA = statusWeight[a.status || "active"] || 1;
      const weightB = statusWeight[b.status || "active"] || 1;
      
      return weightA - weightB;
    });
    
  }, [searchQuery, selectedCategory, statusFilter]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3)
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-orange-100 font-sans relative">
      <Navbar />

      {/* BACKGROUND MESH GRADIENT (Adds Life) */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="pt-32 pb-20 container mx-auto max-w-7xl px-4 relative z-10">
        
        {/* ANIMATED HEADER */}
        <div className="mb-12 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500 mb-6">
             <Sparkles className="w-3 h-3 text-orange-500" />
             <span>{CAMPAIGNS.length} Active Campaigns</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Explore the <span className="bg-gradient-tush bg-clip-text text-transparent">Economy</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Discover verified projects building on the Celo Ecosystem. 
            Fund the builders, own the future.
          </p>
        </div>

        {/* STICKY GLASS CONTROL BAR */}
        <div className="sticky top-24 z-30 bg-white/70 backdrop-blur-xl border border-white/40 shadow-soft-xl rounded-2xl p-2 mb-10 transition-all duration-300 ring-1 ring-slate-900/5">
          <div className="flex flex-col md:flex-row gap-2 justify-between items-center p-2">
             
             {/* Search Input */}
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  placeholder="Search campaigns..." 
                  className="pl-11 h-12 rounded-xl bg-white/50 border-transparent focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>

             {/* Category Pills */}
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar items-center">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300
                      ${selectedCategory === cat 
                        ? "bg-slate-900 text-white shadow-lg scale_-105" 
                        : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* 🚨 ADDED: The Status Filters Row (Sits safely below your original flex row) */}
          <div className="flex items-center gap-3 mt-2 pt-4 pb-2 px-2 border-t border-slate-200/50 overflow-x-auto no-scrollbar">
             <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 whitespace-nowrap">
               <Filter className="w-4 h-4" /> Status:
             </div>
             <div className="flex gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                      px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border whitespace-nowrap
                      ${statusFilter === status 
                        ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm" 
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      }
                    `}
                  >
                    {status === "successful" ? "Funded" : status}
                  </button>
                ))}
             </div>
          </div>

        </div>

        {/* RESULTS GRID (Staggered Animation) */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCampaigns.slice(0, visibleCount).map((campaign, index) => (
              <div 
                key={campaign.id} 
                className={`h-[480px] animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards ${campaign.status === 'failed' ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all' : ''}`} // 🚨 ADDED: Grayscale effect for failed campaigns
                style={{ animationDelay: `${index * 100}ms` }} // Stagger Effect
              >
                <CampaignCard 
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description}
                  raised={campaign.raised}
                  goal={campaign.goal}
                  image={campaign.image}
                  currency={campaign.currency} // 🚨 ADDED: Currency to support multi-asset mock data
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                🛸
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">No campaigns found</h3>
             <p className="text-slate-500 mb-6">We couldn't find anything matching your filters.</p>
             <Button 
                variant="outline"
                onClick={() => {setSearchQuery(""); setSelectedCategory("All"); setStatusFilter("All");}} // 🚨 ADDED: Reset status filter
                className="rounded-full border-slate-300 hover:bg-slate-50"
             >
                Clear Filters
             </Button>
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {filteredCampaigns.length > visibleCount && (
          <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              className="h-14 px-10 rounded-full border-2 border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-900 hover:text-slate-900 hover:scale_-105 transition-all shadow-sm"
            >
              Load More Campaigns
            </Button>
          </div>
        )}

      </div>

      {/* FLOATY BACK TO TOP BUTTON */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showScrollTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
      >
        <Button
          onClick={scrollToTop}
          size="icon"
          className="h-14 w-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-gradient-tush hover:scale_-110 transition-all duration-300"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      </div>

      <Footer />
    </main>
  )
}