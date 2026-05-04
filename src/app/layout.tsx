import type { Metadata } from_ "next";
import { Plus_Jakarta_Sans } from_ "next/font_/google";
import "./globals.css";
import { Toaster } from_ "@/components/ui/sonner";
import { Providers } from_ "@/components/fundx/Providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font_-jakarta" });

export const metadata: Metadata = {
  title: "FundX | Capital Formation",
  description: "Decentralized Capital Formation platform on Celo.",
  icons: {
    icon: "/LogoFrame.svg",
  },
  other: {
    "talentapp:project_verification": "3839e108be306fd6501c861844fd0eafde6cebea898fdf85f2bdabf47ee78512d7c459454dd77a067c1920d9ecd3533cc41b2f2068ed2b8c156380187e10843f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
