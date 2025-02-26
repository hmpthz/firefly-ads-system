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
import { tTicketState } from '@/utils/translate';
import type { AdCreationTicket_Client } from '@shared/creation';
import { GoBack } from '@/components/UI';
import { templatesData } from '@/components/Templates';
import { CreationAssetEdit } from '@/components/CreationAsset';

export const creationDetailRoute: RouteObject = {
  path: 'creation/:id',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCustomQuery(['creation', id], () =>
    privateApi
      .get<AdCreationTicket_Client>(`/api/ads/creation/${id}`)
      .then((res) => res.data)
  );
  const { mutate: handleDelete, isPending: isDeleting } = useCustomMutation(
    (id: string) =>
      privateApi.delete(`/api/ads/creation/${id}`).then(() => navigate(-1))
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
        <Typography variant="h4">广告创意工单详情</Typography>
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
      <CreationDetail {...data} />
    </>
  );
}

const Paragraph = styled(Typography)(() => ({ fontSize: 18 }));

function CreationDetail({
  name,
  state,
  template,
  assets,
  createdAt,
}: AdCreationTicket_Client) {
  const templateData = templatesData[template];
  const Preview = templateData.component;

  return (
    <Stack spacing={2} sx={{ width: 1, maxWidth: 520, mb: 4 }}>
      <Paragraph>创意名称：{name}</Paragraph>
      <Paragraph>创建时间：{createdAt}</Paragraph>
      <Paragraph>审核状态：{tTicketState(state)}</Paragraph>
      <Paragraph>创意模板：{templateData.name}</Paragraph>
      <Divider />
      {Object.entries(templateData.assets).map(([key, data]) => (
        <CreationAssetEdit key={key} {...data} preview={assets[key]} />
      ))}
      <Divider />
      <Preview {...assets} />
      <Divider />
    </Stack>
  );
}
