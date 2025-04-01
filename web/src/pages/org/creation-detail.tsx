import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  useNavigate,
  useParams,
  useSearchParams,
  type RouteObject,
} from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import type {
  AdCreationTicket_Client,
  NewCreationFormData,
} from '@shared/creation';
import { ConfirmDialog, GoBack } from '@/components/UI';
import { AdCreationDetail, AdCreationForm } from '@/components/AdCreation';
import UploadIcon from '@mui/icons-material/Upload';
import PauseIcon from '@mui/icons-material/Pause';

export const creationDetailRoute: RouteObject = {
  path: 'creation/:id',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const back = searchParams.get('back');
  const [openEdit, setOpenEdit] = useState(false);

  const { data, isLoading, refetch } = useCustomQuery(['creation', id], () =>
    privateApi
      .get<AdCreationTicket_Client>(`/api/ads/creation/${id}`)
      .then((res) => res.data)
  );

  const onBack = () =>
    back ? navigate(-1) : navigate('/org/resources?tab=creation');
  const { mutate: updateItem, isPending: isUpdating } = useCustomMutation(
    (data: Partial<NewCreationFormData>) =>
      privateApi.patch(`/api/ads/creation/${id}`, data).then(() => refetch())
  );

  const [openDelete, setOpenDelete] = useState(false);
  const { mutate: deleteItem, isPending: isDeleting } = useCustomMutation(
    (id: string) =>
      privateApi.delete(`/api/ads/creation/${id}`).then(() => navigate(-1))
  );
  const waiting = isLoading || isUpdating || isDeleting;

  if (openEdit && data) {
    return (
      <AdCreationForm
        title="修改广告创意工单"
        onBack={() => setOpenEdit(false)}
        initData={data}
        isSubmitting={waiting}
        onSubmitData={(data) =>
          updateItem(data, { onSuccess: () => setOpenEdit(false) })
        }
      />
    );
  }

  return (
    <>
      <GoBack onClick={onBack} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">广告创意工单详情</Typography>
        {data && (
          <Stack direction="row" spacing={2}>
            {!data.active ? (
              <>
                {
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    disabled={waiting}
                    onClick={() => updateItem({ active: true })}
                  >
                    开始投放
                  </Button>
                }
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  disabled={waiting}
                  onClick={() => setOpenEdit(true)}
                >
                  修改
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<PauseIcon />}
                disabled={waiting}
                onClick={() => updateItem({ active: false })}
              >
                暂停投放
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              type="button"
              endIcon={<DeleteIcon />}
              disabled={waiting}
              onClick={() => setOpenDelete(true)}
            >
              删除
            </Button>
          </Stack>
        )}
      </Box>
      <Divider sx={{ my: 3 }} />
      {data ? (
        <AdCreationDetail {...data} />
      ) : (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      <ConfirmDialog
        open={openDelete}
        title="确认删除广告创意工单"
        disabled={waiting}
        handleConfirm={() => deleteItem(id!, { onSuccess: onBack })}
        handleClose={() => setOpenDelete(false)}
      />
    </>
  );
}
