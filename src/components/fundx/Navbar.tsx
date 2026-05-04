"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import { ConnectWallet } from "@/components/fundx/ConnectWallet"
import { useAccount } from "wagmi"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const { isConnected } = useAccount()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow_ = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow_ = "" }
  }, [mobileOpen])

  const navLinks = [
    { href: "/explore", label: "Campaigns" },
    { href: "/create", label: "Create Campaign" },
    { href: "https://app.uniswap.org", label: "Bridge", external: true },
    ...(isConnected ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ]

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex w-full max-w-6xl items-center justify-between rounded-full bg-white/80 px-6 py-3 shadow-soft-md backdrop-blur-md border border-white/20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Logo className="h-10 w-24" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Wallet + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ConnectWallet />
            </div>

            {/* Hamburger Button (mobile only) */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-down Panel */}
      <div
        className={`fixed top-0 left-0 right-0 z-[70] md:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl border-b border-slate-200/60 px-6 pt-8 pb-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <Logo className="h-10 w-24" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-1 mb-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="pt-4 border-t border-slate-100">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </>
  )
}
