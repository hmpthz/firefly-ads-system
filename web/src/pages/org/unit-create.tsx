import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import { useNavigate, type RouteObject } from 'react-router-dom';
import type { AdUnit_Client, NewUnitFormData } from '@shared/campaign';
import { AdUnitForm } from '@/components/AdUnit';

export const unitCreateRoute: RouteObject = {
  path: 'create-unit',
  element: <CreateUnitPage />,
};

function CreateUnitPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCustomMutation((data: NewUnitFormData) =>
    privateApi
      .post<AdUnit_Client>('/api/ads/unit/create', data)
      .then((res) => res.data)
  );

  return (
    <AdUnitForm
      title="创建新的广告投放单元"
      onBack={() => navigate('/org/resources?tab=unit')}
      isSubmitting={isPending}
      onSubmitData={(data) =>
        mutate(data, {
          onSuccess: () => navigate(-1),
        })
      }
    />
  );
}
