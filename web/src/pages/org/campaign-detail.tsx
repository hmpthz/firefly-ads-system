import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useNavigate, useParams, type RouteObject } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import { GoBack } from '@/components/UI';
import type { AdCampaign_Client } from '@shared/campaign';

export const campaignDetailRoute: RouteObject = {
  path: 'campaign/:id',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCustomQuery(['campaign', id], () =>
    privateApi
      .get<AdCampaign_Client>(`/api/ads/campaign/${id}`)
      .then((res) => res.data)
  );
  const { mutate: handleDelete, isPending: isDeleting } = useCustomMutation(
    (id: string) =>
      privateApi.delete(`/api/ads/campaign/${id}`).then(() => navigate(-1))
  );

  return !data ? (
    <Typography align="center">
      <CircularProgress />
    </Typography>
  ) : (
    <>
      <GoBack />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">广告投放计划详情</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<EditIcon />}>
            修改
          </Button>
          <Button
            variant="contained"
            color="error"
            type="button"
            endIcon={<DeleteIcon />}
            disabled={isDeleting}
            onClick={() => handleDelete(id!)}
          >
            删除
          </Button>
        </Stack>
      </Box>
      <Divider sx={{ my: 3 }} />
      <CampaignDetail {...data} />
    </>
  );
}

const Paragraph = styled(Typography)(() => ({ fontSize: 18 }));

function CampaignDetail({ name, createdAt }: AdCampaign_Client) {
  return <Box>{name}</Box>;
}
