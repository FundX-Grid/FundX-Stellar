"use client"

import { useRef, useEffect, useState } from "react"
import { useScroll, useTransform, motion, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Campaign, getHeroCampaign, getSideCampaigns } from "@/lib/data"

interface CampaignFanProps {
  deckSlotRef: React.RefObject<HTMLDivElement | null>
}

interface SideCardProps {
  campaign: Campaign
  progress: number
  tilt: "left" | "right"
}

export function CampaignFan({ deckSlotRef }: CampaignFanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const [deckOffset, setDeckOffset] = useState(0)
  const [measured, setMeasured] = useState(false)

function getPageOffsetTop(el: HTMLElement): number {
  let top = 0
  let current: HTMLElement | null = el
  while (current) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return top
}

  return (
    <div className={`w-full xl:w-[300px] bg-white rounded-[2rem] shadow-soft-md border border-slate-100 overflow-hidden group hover:border-orange-200 transition-all duration-500 ease-out flex flex-col hover:z-30 hover:scale-105 hover:rotate-0 ${tiltClass}`}>

      <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="p-6 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">{campaign.description}</p>
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
              <Button size="sm" className="h-10 rounded-xl bg-slate-900 text-white shadow-md hover:bg-[#fbe72b] hover:text-slate-900 hover:shadow-glow transition-all px-6">
                Donate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SideCard({ campaign, progress, tilt }: SideCardProps) {
  const tiltClass = tilt === "left"
    ? "xl:transform xl:-rotate-6 xl:origin-bottom-right xl:translate-x-6 hover:translate-x-0"
    : "xl:transform xl:rotate-6 xl:origin-bottom-left xl:-translate-x-6 hover:translate-x-0"

  const hero = getHeroCampaign()
  const sideCampaigns = getSideCampaigns()
  const leftCard = sideCampaigns[0]
  const rightCard = sideCampaigns[1]
  const getProgress = (raised: number, goal: number) =>
    Math.min((raised / goal) * 100, 100)

  useEffect(() => {
    function measure() {
      if (!deckSlotRef.current || !deckRef.current) return
      const slotPageTop = getPageOffsetTop(deckSlotRef.current)
      const deckPageTop = getPageOffsetTop(deckRef.current)
      const CARD_HEIGHT = 420
      const INITIAL_SCALE = 0.20
      const scalingCompensation = (CARD_HEIGHT - CARD_HEIGHT * INITIAL_SCALE) / 2
      const offset = slotPageTop - deckPageTop - scalingCompensation
      setDeckOffset(offset)
      setMeasured(true)
    }
    const t = setTimeout(measure, 200)
    window.addEventListener("resize", measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", measure)
    }
  }, [deckSlotRef])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  })

  // Smooth spring applied to raw scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  // Deck travels from hero slot to campaign center
  const deckY = useTransform(smoothProgress, [0, 1], [deckOffset, 0])
  const deckScale = useTransform(smoothProgress, [0, 1], [0.20, 1])

  // Left card — peeks out slightly at start, fans to final flex position
  // At scale 1 the flex layout naturally places left card ~310px left of center
  const leftX = useTransform(smoothProgress, [0, 1], [-8, 0])
  const leftRotate = useTransform(smoothProgress, [0, 1], [-6, 0])
  const leftZ = useTransform(smoothProgress, [0, 1], [15, 0])

  const rightX = useTransform(smoothProgress, [0, 1], [8, 0])
  const rightRotate = useTransform(smoothProgress, [0, 1], [6, 0])
  const rightZ = useTransform(smoothProgress, [0, 1], [15, 0])

  // Animate gap — at scroll 0 cards have no gap (stacked), at scroll 1 gap is 24px
  const cardGap = useTransform(smoothProgress, [0, 1], [0, 24])
  // Pull side cards behind center card at scroll 0 using negative margin
  // At scale 0.15, center card is ~96px wide, side cards are ~45px wide
  // Negative margin of -320px pulls side cards almost completely behind center
  const sideCardMargin = useTransform(smoothProgress, [0, 1], [-200, 0])

  // Center card sits on top at start (highest z), normalizes at end
  const centerZ = useTransform(smoothProgress, [0, 1], [20, 10])

  // Heading fades in during second half
  const headingOpacity = useTransform(smoothProgress, [0.4, 0.8], [0, 1])
  const headingY = useTransform(smoothProgress, [0.4, 0.8], [40, 0])

  return (
    <div ref={containerRef} className="relative min-h-[600px]">

      {/* Heading */}
      <motion.div
        style={{ opacity: headingOpacity, y: headingY }}
        className="mb-20 text-center max-w-2xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Trending Campaigns
        </h2>
        <p className="text-lg text-slate-500">
          Support verified builders on Celo. Trustless & Transparent.
        </p>
      </motion.div>

      {/* 
      */}
      <motion.div
        ref={deckRef}
        style={{
          y: measured ? deckY : 0,
          scale: deckScale,
          transformOrigin: "center center",
          gap: cardGap,
        }}
        className="flex flex-col xl:flex-row justify-center items-center xl:items-stretch h-auto xl:h-[420px]"
      >

        {/* Left card */}
        <motion.div
          style={{
            x: leftX,
            rotate: leftRotate,
            zIndex: leftZ,
            position: "relative",
            marginRight: sideCardMargin,
          }}
          className="w-full xl:w-[300px] flex-shrink-0"
        >
          <SideCard
            campaign={leftCard}
            tilt="left"
            progress={getProgress(leftCard.raised, leftCard.goal)}
          />
        </motion.div>

        {/* Center card */}
        <motion.div
          style={{ zIndex: centerZ, position: "relative" }}
          className="w-full max-w-3xl xl:flex-1"
        >
          <div className="relative z-20 shadow-2xl rounded-[2rem] border border-slate-100 bg-white hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row overflow-hidden group h-full">
            <div className="absolute top-4 left-4 z-30 bg-gradient-tush text-slate-900 px-4 py-1 rounded-full text-xs font-bold shadow-soft-xl animate-pulse">
              🔥 Top Trending
            </div>
            <div className="relative h-64 md:h-full md:w-5/12 bg-slate-100 overflow-hidden">
              <Image
                src={hero.image}
                alt={hero.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex flex-col justify-between p-8 md:w-7/12 h-full bg-white">
              <div className="pt-4">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {hero.title}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-6 text-sm md:text-base">
                  {hero.description}
                </p>
              </div>
              <div className="space-y-6">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-tush h-full rounded-full shadow-[0_0_15px_rgba(255,107,74,0.4)]"
                    style={{ width: `${getProgress(hero.raised, hero.goal)}%` }}
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Raised</p>
                    <p className="text-3xl font-bold text-primary">
                      ${hero.raised.toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/campaigns/${hero.id}`}>
                    <Button className="h-12 rounded-xl px-8 bg-slate-900 text-white shadow-lg hover:bg-[#fbe72b] hover:text-slate-900 hover:shadow-glow transition-all duration-300">
                      Donate Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right card */}
        <motion.div
          style={{
            x: rightX,
            rotate: rightRotate,
            zIndex: rightZ,
            position: "relative",
            marginLeft: sideCardMargin,
          }}
          className="w-full xl:w-[300px] flex-shrink-0"
        >
          <SideCard
            campaign={rightCard}
            tilt="right"
            progress={getProgress(rightCard.raised, rightCard.goal)}
          />
        </motion.div>

      </motion.div>
    </div>
  )
}