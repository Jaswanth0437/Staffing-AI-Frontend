export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface CampaignLead {
  lead_id: string;
  name: string;
  company: string;
  email?: string;
  status: "pending" | "sent" | "opened" | "replied" | "failed";
  last_activity?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  leads_count: number;
  created_at: string;
  last_activity_at?: string;
  subject?: string;
  body?: string;
  stats?: {
    total: number;
    sent: number;
    opened: number;
    replied: number;
    failed: number;
  };
  leads?: CampaignLead[];
}
