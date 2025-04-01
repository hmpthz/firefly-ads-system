import { GoBack } from '@/components/UI';
import { Box, Divider, Typography } from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { CreateAssetForm } from '@/components/Asset';

export const assetCreateRoute: RouteObject = {
  path: 'create-asset',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();

  return (
    <>
      <GoBack onClick={() => navigate('/org/resources?tab=asset')} />
      <Typography variant="h4">上传物料资源</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <CreateAssetForm />
      </Box>
    </>
  );
}
