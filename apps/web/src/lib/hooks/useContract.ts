import { FUNDX_CONTRACT } from "@/lib/stellar-config"

// Temporary mocks for Stellar migration

export function useCampaignCount() {
  return { data: BigInt(3), isLoading: false, isError: false }
}

export function useCampaign(id: number) {
  // Mock campaign data
  return { 
    data: {
      creator: "GBX...",
      token: "USDC",
      goal: BigInt(1000000000000000000), // 1 ether
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
      totalRaised: BigInt(500000000000000000), // 0.5 ether
      withdrawn: false,
      active: true,
      fundingModel: 0
    }, 
    isLoading: false, 
    isError: false,
    error: null as Error | null
  }
}

export function useDonation(campaignId: number, donor: string | undefined) {
  return { data: donor ? BigInt(50) : BigInt(0), isLoading: false, isError: false }
}

export function useIsPastDeadline(id: number) {
  return { data: false, isLoading: false, isError: false }
}

export function useIsGoalReached(id: number) {
  return { data: false, isLoading: false, isError: false }
}
