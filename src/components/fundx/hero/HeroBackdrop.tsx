"use client"

import { useEffect, useRef } from "react"

function HeroLogoParallax() {
  const logoRef = useRef<HTMLDivElement>(null)
  const mouseOffset = useRef({ x: 0, y: 0 })
  const currentMouse = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!logoRef.current) return

    // Bounce in on page load
    logoRef.current.style.transform = "translate(0px, -40px) scale(0.85)"
    logoRef.current.style.opacity = "0"
    logoRef.current.style.transition = "none"

    const bounceIn = setTimeout(() => {
      if (!logoRef.current) return
      logoRef.current.style.transition =
        "transform 900ms cubic-bezier(0.34, 1.8, 0.64, 1), opacity 400ms ease"
      logoRef.current.style.transform = "translate(0px, 0px) scale(1)"
      logoRef.current.style.opacity = "0.18"
    }, 200)

    // After bounce settles switch to RAF
    const startRaf = setTimeout(() => {
      if (!logoRef.current) return
      logoRef.current.style.transition = "none"
      startTimeRef.current = performance.now()
      startAnimation()
    }, 1200)

    function onMouseMove(e: MouseEvent) {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseOffset.current = {
        x: (e.clientX - cx) * 0.08,
        y: (e.clientY - cy) * 0.06,
      }
    }

    function startAnimation() {
      function animate(time: number) {
        if (!logoRef.current) return

        const elapsed = (time - startTimeRef.current) * 0.001

        // Subtle autonomous oscillation
        const oscillateX = Math.sin(elapsed * 0.4) * 8
        const oscillateY_ = Math.sin(elapsed * 0.3) * 5

        // Smooth lerp toward mouse
        currentMouse.current.x += (mouseOffset.current.x - currentMouse.current.x) * 0.12
        currentMouse.current.y += (mouseOffset.current.y - currentMouse.current.y) * 0.12

        const progress = Math.min(window.scrollY / (window.innerHeight * 0.7), 1)
        const scale = 1 + progress * 0.35
        const opacity = 0.20 * (1 - progress)

        const x = currentMouse.current.x + oscillateX
        const y = currentMouse.current.y + oscillateY_

        logoRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
        logoRef.current.style.opacity = String(opacity)

        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", onMouseMove)

    return () => {
      clearTimeout(bounceIn)
      clearTimeout(startRaf)
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center"
      aria-hidden="true"
      style={{ paddingLeft: "2rem" }}
    >
      <div
        ref={logoRef}
        style={{
          willChange: "transform, opacity",
          opacity: 0,
        }}
      >
        <img
          src="/LogoFrame.svg"
          alt=""
          className="w-[1100px] h-[1100px] object-contain"
        />
      </div>
    </div>
  )
}

export default HeroLogoParallax