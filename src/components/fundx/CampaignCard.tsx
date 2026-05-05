import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface CampaignCardProps {
  id: string
  title: string
  description: string
  raised: number
  goal: number
  image: string
  currency?: "cUSD" | "USDC"

}

export function CampaignCard({ id, title, description, raised, goal, image, currency = "cUSD" }: CampaignCardProps) {
  const percentage = Math.min((raised / goal) * 100, 100)

  const formattedRaised = `$${raised.toLocaleString()} ${currency}`
  const formattedGoal = `$${goal.toLocaleString()} ${currency}`

  return (
    <Link href={`/campaigns/${id}`} className="block h-full group">
      <Card className="relative h-full overflow-hidden rounded-3xl border-none bg-white p-6 shadow-soft-md transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-xl">
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-2">{description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">

              <span className="text-slate-900 font-bold">{formattedRaised}</span>
              <span className="text-slate-400">of {formattedGoal}</span>
            </div>
            <Progress value={percentage} className="h-3 rounded-full bg-slate-100" />
          </div>

          <Button className="w-full rounded-xl bg-slate-900 text-white shadow-lg transition-all duration-500 hover:bg-[#fbe72b] hover:text-slate-900 hover:scale-[1.02] py-6 text-base font-bold">
            Donate Now
          </Button>
        </div>
      </Card>
    </Link>
  )
}