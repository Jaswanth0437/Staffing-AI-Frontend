"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_NAME } from "@/lib/constants";
import { setCurrentUser } from "@/lib/currentUser";
const PLATFORM_MODULES = [{
  title: "Campaigns & Job Discovery",
  description: "Pull qualified roles from Apify and triage them automatically.",
  live: true
}, {
  title: "Lead Resolution",
  description: "Job poster → HR contact → company-level fallback, every time.",
  live: true
}, {
  title: "Employee Matching",
  description: "AI-ranked bench matches against every qualified role.",
  live: true
}, {
  title: "Email Outreach",
  description: "Generate, edit, and send outreach copy with zero PII leakage.",
  live: true
}, {
  title: "Analytics Dashboard",
  description: "Pipeline health and conversion tracking across campaigns.",
  live: false
}, {
  title: "CRM Integrations",
  description: "Sync resolved leads and contacts to your existing CRM.",
  live: false
}];
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleMicrosoftLogin(e) {
    e.preventDefault();
    setLoading(true);
    // TODO: replace with a real Microsoft OAuth redirect — this captures
    // the same name/email a real sign-in would return via SSO claims, used
    // for the sidebar profile and as the "From" identity on outreach emails.
    setCurrentUser({ name: name.trim(), email: email.trim() });
    setTimeout(() => router.push("/dashboard"), 900);
  }
  return <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-10 px-6 py-16">
        <form onSubmit={handleMicrosoftLogin} className="animate-page-in flex w-full max-w-sm flex-col items-center text-center">
          <div className="relative mb-6 h-16 w-16">
            <Image src="/Winlogo.png" alt={APP_NAME} fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome to {APP_NAME}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Continue with Microsoft to access your workspace.</p>

          <div className="mt-8 flex w-full flex-col gap-3 text-left">
            <Input name="fullName" label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" required />
            <Input name="workEmail" label="Work Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. priya.s@winfomi.com" required />
          </div>

          <Button type="submit" variant="secondary" className="mt-4 h-11 w-full justify-center gap-3 text-base" loading={loading}>
            {!loading && <MicrosoftIcon />}
            Continue with Microsoft
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">© 2026 Winfomi. All rights reserved.</p>
      </div>

      <div className="relative hidden flex-col justify-center gap-8 overflow-hidden bg-gradient-to-br from-brand-soft via-white to-brand-soft px-12 py-16 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-violet/10 blur-3xl" aria-hidden="true" />

        <span className="animate-page-in relative inline-flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-brand">
          # The {APP_NAME} Platform
        </span>
        <h2 className="animate-page-in relative max-w-md text-4xl font-semibold leading-tight text-foreground" style={{ animationDelay: "40ms" }}>
          Turn job postings into pipeline, automatically.
        </h2>
        <p className="animate-page-in relative max-w-md text-sm text-muted-foreground" style={{ animationDelay: "80ms" }}>
          Discover roles, resolve the right contact, match your bench, and send outreach — one platform, powered by AI at every stage.
        </p>

        <div className="relative grid grid-cols-2 gap-4">
          {PLATFORM_MODULES.map((module, i) => <div key={module.title} className="animate-page-in relative rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md" style={{ animationDelay: `${120 + i * 40}ms` }}>
              {!module.live && <span className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>}
              <p className="text-sm font-semibold text-foreground">{module.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
            </div>)}
        </div>

        <p className="relative text-xs text-muted-foreground">
          Campaigns, Leads, Employees, and Emails are live today — more modules on the way.
        </p>
      </div>
    </div>;
}
function MicrosoftIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>;
}
