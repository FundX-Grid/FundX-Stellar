import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Campaign } from "@/lib/data"
import { ArrowRight } from "lucide-react"

interface SideCardProps {
  campaign: Campaign
  progress: number
}

export function LeftCard({ campaign, progress }: SideCardProps) {
  return (
    <div className="w-full h-full bg-white rounded-[2rem] shadow-soft-md border border-slate-100 overflow-hidden group hover:border-orange-200 transition-all duration-500 ease-out flex flex-col hover:scale-[1.03]">
      <div className="relative h-48 xl:h-1/2 bg-slate-100 overflow-hidden shrink-0">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-bold bg-slate-50 group-hover:scale-105 transition-transform duration-700">
          [Image]
        </div>
      </div>

      <div className="p-6 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-tush h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">RAISED</span>
              <span className="text-sm font-bold text-primary">
                ${campaign.raised.toLocaleString()}
              </span>
            </div>
            <Link href={`/campaigns/${campaign.id}`}>
              <Button
                size="sm"
                className="h-10 rounded-xl bg-slate-900 text-white shadow-md hover:bg-primary hover:shadow-glow transition-all px-5 flex items-center gap-1.5 group/btn"
              >
                Donate
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}