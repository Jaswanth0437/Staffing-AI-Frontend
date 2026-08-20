"use client";

import { getEmployees } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";
export function useEmployees() {
  return useAsyncData(() => getEmployees(), []);
}
