import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { privateApi } from '@/utils/axios';
import { useCustomQuery } from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';


import type { AdCampaign_Client } from '@shared/campaign';

export const campaignsRoute: RouteObject = {
  path: 'campaigns',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['campaigns', orgId], () =>
    privateApi
      .get<AdCampaign_Client[]>(`/api/ads/campaign/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">广告计划列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org/create-campaign')}
        >
          创建
        </Button>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={3}>
        {data?.map((item) => (
          <ItemCard key={item._id} {...item} />
        ))}
      </Stack>
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
    </Paper>
  );
}

function ItemCard({
  createdAt,
  name,
  dateRange,
  timeRange,
  pricingModel,
  budget,
}: AdCampaign_Client) {
  return <Box>a</Box>;
}
