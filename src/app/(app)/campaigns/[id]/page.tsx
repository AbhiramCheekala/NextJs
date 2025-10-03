import { CampaignDetails } from "@/components/campaigns/campaign-details";

export default function CampaignPage({ params }: { params: { id: string } }) {
  return <CampaignDetails id={params.id} />;
}
