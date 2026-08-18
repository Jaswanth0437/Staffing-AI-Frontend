"use client";

import { getCampaign, getCampaigns } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";

export function useCampaigns() {
  return useAsyncData(() => getCampaigns(), []);
}

export function useCampaign(campaignId: string) {
  return useAsyncData(() => getCampaign(campaignId), [campaignId]);
}
