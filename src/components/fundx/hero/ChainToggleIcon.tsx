"use client"
import Image from "next/image"

export function ChainToggleIcon({
  displayStacks,
  glitching,
  glitchOffset,
  glitchOpacity,
  glitchSkew_,
  isStacksMode,
}: {
  displayStacks: boolean
  glitching: boolean
  glitchOffset: { x: number; y: number }
  glitchOpacity: number
  glitchSkew_: number
  isStacksMode: boolean
}) {
  const glitchStyle = {
    backgroundColor: displayStacks ? "#f8fafc" : "#ffffff",
    color: displayStacks ? "#0f172a" : "#0f172a",
    boxShadow: displayStacks ? "0 4px 24px 0 rgba(250,204,21,0.25)" : "0 4px 24px 0 rgba(0,0,0,0.07)",
    opacity: glitchOpacity,
    ...(glitching
      ? { transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px) skewX(${glitchSkew_}deg) rotate_(${displayStacks ? "6deg" : "-6deg"})`, transition: "none" }
      : { transform: `translate(0px, 0px) skewX(0deg) rotate_(${isStacksMode ? "6deg" : "-6deg"})`, transition: "transform 700ms cubic-bezier(0.4,0,0.2,1), background-color 600ms ease, box-shadow 600ms ease, opacity 300ms ease" }),
    willChange: "transform, opacity",
  }

  return (
    <span className="inline-flex align-middle">
      <div style={glitchStyle} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-slate-100 relative overflow-hidden">
        <span style={{ position: "absolute", opacity: !displayStacks ? 1 : 0, transition: glitching ? "none" : "opacity 300ms ease" }}>
          <Image src="/globe.svg" alt="App" width={50} height={50} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        </span>
        <span style={{ position: "absolute", opacity: displayStacks ? 1 : 0, transition: glitching ? "none" : "opacity 300ms ease" }}>
          <Image src="/celo-celo-logo.svg" alt="Celo" width={50} height={50} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        </span>
      </div>
    </span>
  )
}
