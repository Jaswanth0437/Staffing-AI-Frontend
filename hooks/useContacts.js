"use client";

import { getContact, getContacts } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";
export function useContacts() {
  return useAsyncData(() => getContacts(), []);
}
export function useContact(contactId) {
  return useAsyncData(() => getContact(contactId), [contactId]);
}
