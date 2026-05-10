import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Campaign } from "@/lib/data"
import { Heart } from "lucide-react"

interface CenterCardProps {
  campaign: Campaign
  progress: number
}

export function CenterCard({ campaign, progress }: CenterCardProps) {
  return (
    <div className="w-full h-full relative z-20 shadow-2xl rounded-[2rem] border border-slate-100 bg-white hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row overflow-hidden group">
      
      {/* Trending Badge */}
      <div className="absolute top-4 left-4 z-30 bg-gradient-tush text-white px-4 py-1 rounded-full text-xs font-bold shadow-soft-xl animate-pulse">
        🔥 Top Trending
      </div>

      {/* Image Side */}
      <div className="relative h-64 md:h-full md:w-5/12 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold bg-slate-50 group-hover:bg-slate-100 transition-colors">
          [Image]
        </div>
      </div>

      {/* Content Side */}
      <div className="flex flex-col justify-between p-8 md:w-7/12 h-full bg-white">
        <div className="pt-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-slate-500 leading-relaxed mb-6 text-sm md:text-base">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-tush h-full rounded-full shadow-[0_0_15px_rgba(255,107,74,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Raised + Button */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                Raised
              </p>
              <p className="text-3xl font-bold text-primary">
                ${campaign.raised.toLocaleString()}
              </p>
            </div>
            <Link href={`/campaigns/${campaign.id}`}>
              <Button className="h-12 rounded-xl px-8 bg-slate-900 text-white shadow-lg hover:bg-primary hover:shadow-glow transition-all duration-300 flex items-center gap-2 group/btn">
                Donate Now
                <Heart className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:fill-white" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}