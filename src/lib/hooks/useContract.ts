import { FUNDX_CONTRACT } from "@/lib/celo-config"
import { FUNDX_ABI } from "@/lib/fundx-abi"
import { useReadContract } from "wagmi"

export function useCampaignCount() {
  return useReadContract({
    address: FUNDX_CONTRACT as `0x${string}`,
    abi: FUNDX_ABI,
    functionName: "campaignCount_",
  })
}

export function useCampaign(id: number) {
  return useReadContract({
    address: FUNDX_CONTRACT as `0x${string}`,
    abi: FUNDX_ABI,
    functionName: "getCampaign",
    args: [BigInt(id)],
  })
}

export function useDonation(campaignId: number, donor: `0x${string}` | undefined) {
  return useReadContract({
    address: FUNDX_CONTRACT as `0x${string}`,
    abi: FUNDX_ABI,
    functionName: "getDonation",
    args: donor ? [BigInt(campaignId), donor] : undefined,
    query: { enabled: !!donor },
  })
}

export function useIsPastDeadline(id: number) {
  return useReadContract({
    address: FUNDX_CONTRACT as `0x${string}`,
    abi: FUNDX_ABI,
    functionName: "isPastDeadline",
    args: [BigInt(id)],
  })
}

export function useIsGoalReached(id: number) {
  return useReadContract({
    address: FUNDX_CONTRACT as `0x${string}`,
    abi: FUNDX_ABI,
    functionName: "isGoalReached",
    args: [BigInt(id)],
  })
}
