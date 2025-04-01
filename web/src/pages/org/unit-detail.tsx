import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import PauseIcon from '@mui/icons-material/Pause';
import { useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
  type RouteObject,
} from 'react-router-dom';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import { ConfirmDialog, GoBack } from '@/components/UI';
import type { AdUnit_Client, NewUnitFormData } from '@shared/campaign';
import { AdUnitDetail, AdUnitForm } from '@/components/AdUnit';

export const unitDetailRoute: RouteObject = {
  path: 'unit/:id',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const back = searchParams.get('back');
  const [openEdit, setOpenEdit] = useState(false);

  const { data, isLoading, refetch } = useCustomQuery(['unit', id], () =>
    privateApi.get<AdUnit_Client>(`/api/ads/unit/${id}`).then((res) => res.data)
  );

  const onBack = () =>
    back ? navigate(-1) : navigate('/org/resources?tab=unit');
  const { mutate: updateItem, isPending: isUpdating } = useCustomMutation(
    (data: Partial<NewUnitFormData>) =>
      privateApi.patch(`/api/ads/unit/${id}`, data).then(() => refetch())
  );

  const [openDelete, setOpenDelete] = useState(false);
  const { mutate: deleteItem, isPending: isDeleting } = useCustomMutation(
    (id: string) =>
      privateApi.delete(`/api/ads/unit/${id}`).then(() => navigate(-1))
  );
  const waiting = isLoading || isUpdating || isDeleting;

  if (openEdit && data) {
    return (
      <AdUnitForm
        title="修改广告投放单元"
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
        <Typography variant="h4">广告投放单元详情</Typography>
        {data && (
          <Stack direction="row" spacing={2}>
            {!data.active ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  disabled={waiting}
                  onClick={() => updateItem({ active: true })}
                >
                  开始投放
                </Button>
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
        <AdUnitDetail {...data} />
      ) : (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      <ConfirmDialog
        open={openDelete}
        title="确认删除广告投放单元"
        disabled={waiting}
        handleConfirm={() => deleteItem(id!, { onSuccess: onBack })}
        handleClose={() => setOpenDelete(false)}
      />
    </>
  );
}
