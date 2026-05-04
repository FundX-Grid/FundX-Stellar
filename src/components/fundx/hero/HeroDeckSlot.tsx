import React from "react"

export function HeroDeckSlot({ slotRef_ }: { slotRef_: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={slotRef_}
      className="w-full flex justify-center items-center my-6"
      style={{ height: "6rem", pointerEvents: "none" }}
      aria-hidden="true"
    />
  )
}
