import { useState, useEffect, useRef } from "react"

const SCRAMBLE_CHARS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ∑∆∇Ωλ∞"

export function useScramble() {
  const [display, setDisplay] = useState("Bitcoin")
  const frameRef_ = useRef<NodeJS.Timeout | null>(null)

  const scrambleTo = (word: string) => {
    if (frameRef_.current) clearTimeout(frameRef_.current)
    let lockedCount = 0
    const totalSteps = word.length

    const tick = () => {
      if (lockedCount >= totalSteps) { setDisplay(word); return }
      setDisplay(word.split("").map((char, i) => i < lockedCount ? char : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]).join(""))
      if (lockedCount < totalSteps) lockedCount++
      frameRef_.current = setTimeout(tick, 80)
    }
    tick()
  }

  useEffect(() => {
    return () => { if (frameRef_.current) clearTimeout(frameRef_.current) }
  }, [])

  return { display, scrambleTo }
}
