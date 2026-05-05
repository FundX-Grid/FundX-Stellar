import { Input } from "@/components/ui/input"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12 border-t border-slate-100">
      <div className="container mx-auto max-w-6xl px-4">
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24">
          
          {/* LEFT SIDE: Brand, Nav, Socials (Matching 'Karma' Image) */}
          <div className="flex flex-col items-start space-y-8 w-full lg:w-auto">
            
            {/* 1. Logo */}
            <div className="flex items-center gap-2">
              <Logo className="h-12 w-24" />
            </div>

            {/* 2. Horizontal Nav Links (Karma Style) */}
            <nav className="flex flex-wrap gap-6 md:gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-primary. transition-colors">For Builders</a>
              <a href="#" className="hover:text-primary. transition-colors">For Funders</a>
              <a href="#" className="hover:text-primary. transition-colors">Blog</a>
              <a href="#" className="hover:text-primary. transition-colors">Guide</a>
              <a href="#" className="hover:text-primary. transition-colors">SDK Docs</a>
              <a href="#" className="hover:text-primary. transition-colors">Governance</a>
            </nav>

            {/* 3. Social Icons (SVG Vectors) */}
            <div className="flex items-center gap-5 text-slate-900">
              
              {/* X (Twitter) */}
              <a href="#" className="hover:text-primary. transition-colors hover:scale-110">
                <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>

              {/* Telegram */}
              <a href="#" className="hover:text-primary. transition-colors hover:scale-110">
                <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                   <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>

              {/* Discord */}
              <a href="#" className="hover:text-primary. transition-colors hover:scale-110">
                 <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                 </svg>
              </a>

              {/* Docs/Mirror Icon */}
              <a href="#" className="hover:text-primary. transition-colors hover:scale-110">
                <svg role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <line x1="16" y1="13" x2="8" y2="13"></line>
                   <line x1="16" y1="17" x2="8" y2="17"></line>
                   <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </a>

            </div>
          </div>

          {/* RIGHT SIDE: Newsletter (Unchanged) */}
          <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[400px]">
            <h4 className="font-semibold text-slate-900">Stay updated</h4>
            <div className="flex w-full items-center space-x-2">
              <div className="relative w-full">
                <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="h-12 rounded-full border-slate-200 bg-slate-50 pl-5 pr-4 text-slate-900 focus-visible:ring-indigo-500 shadow-inner" 
                />
              </div>
              <Button className="h-12 rounded-full bg-slate-900 px-8 hover:bg-slate-800 shadow-soft-md">
                Subscribe
              </Button>
            </div>
          </div>

        </div>
        
        {/* Simple Copyright Footer */}
        <div className="mt-12 text-left text-xs text-slate-400">
          © 2026 FundX Decentralized Protocol.
        </div>

      </div>
    </footer>
  )
}