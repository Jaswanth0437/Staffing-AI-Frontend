"use client";

import { getJob, getJobs } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";

export function useJobs() {
  return useAsyncData(() => getJobs(), []);
}

export function useJob(jobId: string) {
  return useAsyncData(() => getJob(jobId), [jobId]);
}
