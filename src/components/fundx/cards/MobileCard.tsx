import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Campaign } from "@/lib/data"
import { ArrowRight } from "lucide-react"

interface MobileCardProps {
  campaign: Campaign
  progress: number
}

export function MobileCard({ campaign, progress }: MobileCardProps) {
  return (
    <div className="w-full bg-white rounded-[2rem] shadow-soft-md border border-slate-100 overflow-hidden flex flex-col">
      <div className="relative h-48 bg-slate-100">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-bold">
          [Image]
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-900">{campaign.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">
          {campaign.description}
        </p>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-tush h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-primary">
            ${campaign.raised.toLocaleString()}
          </span>
          <Link href={`/campaigns/${campaign.id}`}>
            <Button
              size="sm"
              className="h-10 rounded-xl bg-slate-900 text-white px-5 flex items-center gap-1.5"
            >
              Donate
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}