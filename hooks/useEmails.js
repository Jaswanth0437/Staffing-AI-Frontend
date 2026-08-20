"use client";

import { getEmails } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";
export function useEmails() {
  return useAsyncData(() => getEmails(), []);
}
