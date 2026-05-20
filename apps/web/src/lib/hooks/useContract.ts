"use client"

import { useEffect, useState, useCallback } from "react"
import {
  fetchAllCampaigns,
  getCampaignRaw,
  getDonation,
  getLatestLedgerTimestamp,
  mapCampaign,
  OnChainCampaign,
} from "@/lib/stellar-contract"
import { TOKEN_DECIMALS, isContractDeployed } from "@/lib/stellar-config"

export function useAllCampaigns() {
  const [campaigns, setCampaigns] = useState<OnChainCampaign[]>([])
  const [count, setCount] = useState(0)
  const [deployed, setDeployed] = useState(isContractDeployed())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchToken, setRefetchToken] = useState(0)

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchAllCampaigns()
      .then(({ campaigns, count, deployed }) => {
        if (cancelled) return
        setCampaigns(campaigns)
        setCount(count)
        setDeployed(deployed)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refetchToken])

  return { campaigns, count, deployed, isLoading, error, refetch }
}

export function useCampaign(id: number) {
  const [campaign, setCampaign] = useState<OnChainCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchToken, setRefetchToken] = useState(0)

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), [])

  useEffect(() => {
    if (id === undefined || isNaN(id) || id < 0) {
      setIsLoading(false)
      setCampaign(null)
      return
    }
    if (!isContractDeployed()) {
      setIsLoading(false)
      setCampaign(null)
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    Promise.all([getCampaignRaw(id), getLatestLedgerTimestamp()])
      .then(([raw, ts]) => {
        if (cancelled) return
        setCampaign(raw ? mapCampaign(raw, id, ts) : null)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, refetchToken])

  return { campaign, isLoading, error, refetch }
}

export function useDonation(campaignId: number, donor: string | undefined) {
  const [donation, setDonation] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!donor || campaignId === undefined || isNaN(campaignId) || !isContractDeployed()) {
      setDonation(0)
      return
    }
    let cancelled = false
    setIsLoading(true)
    getDonation(campaignId, donor)
      .then((raw) => {
        if (cancelled) return
        const divisor = BigInt(10) ** BigInt(TOKEN_DECIMALS.USDC)
        const whole = raw / divisor
        const fraction = raw % divisor
        setDonation(Number(whole) + Number(fraction) / Number(divisor))
      })
      .catch(() => {
        if (!cancelled) setDonation(0)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [campaignId, donor])

  return { donation, isLoading }
}

export function useUserDonations(donor: string | undefined, campaignIds: number[]) {
  const [donations, setDonations] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const idKey = campaignIds.join(",")
  useEffect(() => {
    if (!donor || campaignIds.length === 0 || !isContractDeployed()) {
      setDonations({})
      return
    }
    let cancelled = false
    setIsLoading(true)
    Promise.all(
      campaignIds.map(async (id) => {
        try {
          const raw = await getDonation(id, donor)
          const divisor = BigInt(10) ** BigInt(TOKEN_DECIMALS.USDC)
          const whole = raw / divisor
          const fraction = raw % divisor
          return [id, Number(whole) + Number(fraction) / Number(divisor)] as const
        } catch {
          return [id, 0] as const
        }
      })
    )
      .then((entries) => {
        if (cancelled) return
        const map: Record<number, number> = {}
        for (const [id, amt] of entries) if (amt > 0) map[id] = amt
        setDonations(map)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [donor, idKey])

  return { donations, isLoading }
}
