export type CampaignStatus = "active" | "successful" | "failed";
export type FundingModel = "Flexible Model" | "All-or-Nothing";
export type TokenSymbol = "cUSD" | "USDC";

export interface Campaign {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  projectStage: string;
  location: string;
  raised: number;
  goal: number;
  currency: TokenSymbol;
  token_address: string;
  image: string;
  creator: string;
  creatorImage: string;
  creatorBio: string;
  twitter: string;
  github: string;
  portfolio: string;
  videoUrl: string;
  budgetBreakdown: string;
  roadmap: string;
  daysLeft: number;
  backers: number;
  isTrending?: boolean;
  status: CampaignStatus;
  fundingModel: FundingModel;
}

// Celo token addresses
export const TOKEN_ADDRESSES = {
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
};

export const CAMPAIGNS: Campaign[] = [
  // --- ACTIVE CAMPAIGNS ---
  {
    id: "celo-school",
    title: "Celo School",
    tagline: "Teaching Solidity and Celo development to 10,000 developers worldwide.",
    description: "We are building the next generation of Celo builders. The learning curve for Web3 development is too steep for most developers in Africa and beyond.",
    category: "Education",
    projectStage: "MVP",
    location: "Global",
    raised: 12000,
    goal: 100000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-2.jpg",
    creator: "DeFi Academy",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Ex-educators and early Celo adopters.",
    twitter: "@CeloSchool",
    github: "github.com/celoschool",
    portfolio: "celoschool.com",
    videoUrl: "",
    budgetBreakdown: "50% Content Creation, 30% Platform Engineering, 20% Marketing",
    roadmap: "Month 1: Launch Beta. Month 3: 50+ Lessons.",
    daysLeft: 45,
    backers: 340,
    isTrending: false,
    status: "active",
    fundingModel: "Flexible Model"
  },
  {
    id: "minipay-market",
    title: "MiniPay Market",
    tagline: "A peer-to-peer marketplace built natively inside MiniPay.",
    description: "Enabling millions of MiniPay users across West Africa to buy and sell goods using cUSD — no bank account required.",
    category: "Social Impact",
    projectStage: "Idea",
    location: "Lagos, Nigeria",
    raised: 12500,
    goal: 500000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-1.jpg",
    creator: "PayDAO",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Fintech builders focused on African markets.",
    twitter: "@MiniPayMarket",
    github: "github.com/minipaymarket",
    portfolio: "minipaymarket.com",
    videoUrl: "",
    budgetBreakdown: "80% Product Development, 20% Marketing",
    roadmap: "Month 1: Beta in Lagos. Month 6: Ghana expansion.",
    daysLeft: 120,
    backers: 450,
    isTrending: false,
    status: "active",
    fundingModel: "All-or-Nothing"
  },
  {
    id: "celo-gaming",
    title: "Savannaverse",
    tagline: "An MMORPG where every item is a Celo NFT.",
    description: "Play, earn, and own your assets on Celo. Built mobile-first for MiniPay users.",
    category: "Gaming",
    projectStage: "Idea",
    location: "Nairobi, Kenya",
    raised: 8000,
    goal: 60000,
    currency: "USDC",
    token_address: TOKEN_ADDRESSES.USDC,
    image: "/campaign-3.jpg",
    creator: "SavannaLabs",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Game devs making the jump to Web3 on Celo.",
    twitter: "@SavannaLabs",
    github: "",
    portfolio: "",
    videoUrl: "",
    budgetBreakdown: "100% Development",
    roadmap: "Q1 Alpha.",
    daysLeft: 29,
    backers: 120,
    isTrending: false,
    status: "active",
    fundingModel: "Flexible Model"
  },
  {
    id: "celo-dex",
    title: "Zero-Fee DEX on Celo",
    tagline: "Swap cUSD and USDC with zero protocol fees.",
    description: "A community-owned automated market maker on Celo prioritizing deep stablecoin liquidity and zero rent-seeking.",
    category: "DeFi",
    projectStage: "Prototype",
    location: "Remote",
    raised: 5500,
    goal: 25000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-1.jpg",
    creator: "DEX DAO",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "DeFi maximalists building on Celo.",
    twitter: "@ZeroFeeDex",
    github: "",
    portfolio: "",
    videoUrl: "",
    budgetBreakdown: "Audits and Liquidity",
    roadmap: "Launch Q3",
    daysLeft: 10,
    backers: 50,
    isTrending: true,
    status: "active",
    fundingModel: "All-or-Nothing"
  },

  // --- SUCCESSFUL CAMPAIGNS ---
  {
    id: "defi-for-everyone",
    title: "DeFi for Everyone",
    tagline: "The first mobile-first yield aggregator on Celo.",
    description: "Democratizing finance for the 99% with simple UX and trustless strategies built on Celo.",
    category: "DeFi",
    projectStage: "Prototype",
    location: "Lagos, Nigeria",
    raised: 55000,
    goal: 50000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-1.jpg",
    creator: "Alex Smith",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Senior protocol engineer.",
    twitter: "@AlexBuilds",
    github: "github.com/alexsmith",
    portfolio: "alexsmith.dev",
    videoUrl: "",
    budgetBreakdown: "70% Smart Contract Audits, 30% Frontend",
    roadmap: "Mainnet TGE.",
    daysLeft: 0,
    backers: 1240,
    isTrending: false,
    status: "successful",
    fundingModel: "Flexible Model"
  },
  {
    id: "celo-ops",
    title: "Celo Ops",
    tagline: "Decentralized dev-ops tooling for Celo smart contracts.",
    description: "Automate your Celo deployments with 100% uptime.",
    category: "Infrastructure",
    projectStage: "Idea",
    location: "Berlin, Germany",
    raised: 35000,
    goal: 30000,
    currency: "USDC",
    token_address: TOKEN_ADDRESSES.USDC,
    image: "/campaign-2.jpg",
    creator: "OpsTeam",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Infrastructure nerds.",
    twitter: "@OpsTeam",
    github: "github.com/opsteam",
    portfolio: "opsteam.com",
    videoUrl: "",
    budgetBreakdown: "Server costs and Dev time",
    roadmap: "Beta live now",
    daysLeft: 0,
    backers: 89,
    isTrending: false,
    status: "successful",
    fundingModel: "All-or-Nothing"
  },

  // --- FAILED CAMPAIGNS ---
  {
    id: "green-mining",
    title: "Green Mining",
    tagline: "Solar-powered Celo validator node initiative.",
    description: "Carbon neutral Celo validation ensuring the future of sustainable proof-of-stake.",
    category: "Infrastructure",
    projectStage: "Idea",
    location: "Austin, TX",
    raised: 5000,
    goal: 25000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-3.jpg",
    creator: "EcoBit",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Renewable energy experts.",
    twitter: "@EcoBit",
    github: "",
    portfolio: "ecobit.io",
    videoUrl: "",
    budgetBreakdown: "80% Hardware Procurement, 20% Land Lease",
    roadmap: "Project Suspended",
    daysLeft: 0,
    backers: 85,
    isTrending: false,
    status: "failed",
    fundingModel: "All-or-Nothing"
  },
  {
    id: "pixel-lords",
    title: "Pixel Lords NFT",
    tagline: "10,000 on-chain pixel warriors on Celo.",
    description: "A generative art project aiming to build a metaverse on Celo.",
    category: "Gaming",
    projectStage: "Idea",
    location: "Remote",
    raised: 1200,
    goal: 15000,
    currency: "cUSD",
    token_address: TOKEN_ADDRESSES.cUSD,
    image: "/campaign-3.jpg",
    creator: "Pixel Studio",
    creatorImage: "https://github.com/shadcn.png",
    creatorBio: "Digital artists.",
    twitter: "@PixelLords",
    github: "",
    portfolio: "",
    videoUrl: "",
    budgetBreakdown: "Art creation",
    roadmap: "Mint failed",
    daysLeft: 0,
    backers: 12,
    isTrending: false,
    status: "failed",
    fundingModel: "All-or-Nothing"
  }
];

export function getSideCampaigns() {
  return CAMPAIGNS.filter((c) => !c.isTrending).slice(0, 2);
}

export function getHeroCampaign() {
  return CAMPAIGNS.find((c) => c.isTrending) || CAMPAIGNS[0];
}

export function getCampaign(id: string) {
  return CAMPAIGNS.find((c) => c.id === id);
}


export function getAllCampaigns() {
  return CAMPAIGNS;
}