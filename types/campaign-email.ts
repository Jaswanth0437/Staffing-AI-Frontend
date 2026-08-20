export type CampaignEmailStatus = "draft" | "sent" | "failed";

export interface CampaignEmail {
  id: string;
  campaign_id: string;
  campaign_name: string;
  lead_id: string;
  lead_name: string;
  employee_ids: string[];
  from_email: string;
  to_email: string;
  subject: string;
  content: string;
  status: CampaignEmailStatus;
  created_at: string;
  sent_at?: string;
}
