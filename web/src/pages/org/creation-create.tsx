import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import { useNavigate, type RouteObject } from 'react-router-dom';
import type {
  AdCreationTicket_Client,
  NewCreationFormData,
} from '@shared/creation';
import { AdCreationForm } from '@/components/AdCreation';

export const creationCreateRoute: RouteObject = {
  path: 'create-creation',
  element: <CreateCreationPage />,
};

function CreateCreationPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCustomMutation((data: NewCreationFormData) =>
    privateApi
      .post<AdCreationTicket_Client>('/api/ads/creation/create', data)
      .then((res) => res.data)
  );

  return (
    <AdCreationForm
      title="创建新的广告创意"
      onBack={() => navigate('/org/resources?tab=creation')}
      isSubmitting={isPending}
      onSubmitData={(data) =>
        mutate(data, {
          onSuccess: () => navigate(-1),
        })
      }
    />
  );
}
