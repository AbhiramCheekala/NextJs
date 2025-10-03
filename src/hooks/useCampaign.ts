import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Campaign } from '@/types/campaign';

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/campaigns/${id}`);
        setCampaign(response.data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  return { campaign, loading, error };
}
