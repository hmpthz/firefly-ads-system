import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import { useNavigate, type RouteObject } from 'react-router-dom';
import type { AdCampaign_Client, NewCampaignFormData } from '@shared/campaign';
import { AdCampaignForm } from '@/components/AdCampaign';

export const campaignCreateRoute: RouteObject = {
  path: 'create-campaign',
  element: <CreateCampaignPage />,
};

function CreateCampaignPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCustomMutation((data: NewCampaignFormData) =>
    privateApi
      .post<AdCampaign_Client>('/api/ads/campaign/create', data)
      .then((res) => res.data)
  );

  return (
    <AdCampaignForm
      title="创建新的广告投放计划"
      onBack={() => navigate('/org/resources?tab=campaign')}
      isSubmitting={isPending}
      onSubmitData={(data) =>
        mutate(data, {
          onSuccess: () => navigate(-1),
        })
      }
    />
  );
}
