import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import type { AssetTicket_Client } from '@shared/asset';
import { privateApi } from '@/utils/axios';
import {
  useCustomMutation,
  useCustomQuery,
  type CustomMutateFn,
} from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  tContentType,
  tCredentialState,
  tTicketState,
} from '@/utils/translate';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FakeAttachment } from '@/components/Attachment';
import { useState } from 'react';

export const orgAssetsRoute: RouteObject = {
  path: 'assets',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, refetch, isLoading } = useCustomQuery(['assets', orgId], () =>
    privateApi
      .get<AssetTicket_Client[]>(`/api/ads/asset/list?orgId=${orgId}`)
      .then((res) => res.data)
  );
  const { mutate: handleDelete, isPending: isDeleting } = useCustomMutation(
    (id: string) =>
      privateApi.delete(`/api/ads/asset/${id}`).then(() => void refetch())
  );
  const [dialogData, setDialogData] = useState<DialogData>({ open: false });
  const closeDialog = () => {
    if (isDeleting) return;
    setDialogData((prev) => ({ ...prev, open: false }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">物料工单列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org/create-asset')}
        >
          上传
        </Button>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ my: 1 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>上传时间</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>审核状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((item) => (
              <ItemRow
                key={item._id}
                {...item}
                handleClick={() => setDialogData({ open: true, item })}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
      <AssetDialog
        data={dialogData}
        isDeleting={isDeleting}
        handleDelete={handleDelete}
        handleClose={closeDialog}
      />
    </Paper>
  );
}

const ItemRow = ({
  createdAt,
  name,
  contentType,
  state,
  handleClick,
}: AssetTicket_Client & { handleClick: () => void }) => (
  <TableRow>
    <TableCell>{createdAt}</TableCell>
    <TableCell>{name}</TableCell>
    <TableCell>{tContentType(contentType)}</TableCell>
    <TableCell>{tCredentialState(state)}</TableCell>
    <TableCell>
      <IconButton size="small" onClick={handleClick}>
        <ArrowForwardIosIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

type DialogData = {
  open: boolean;
  item?: AssetTicket_Client;
};
function AssetDialog({
  data: { open, item },
  isDeleting,
  handleDelete,
  handleClose,
}: {
  data: DialogData;
  isDeleting: boolean;
  handleDelete: CustomMutateFn<string>;
  handleClose: () => void;
}) {
  if (!item) return;

  return (
    <Dialog open={open} onClose={handleClose} scroll="paper">
      <DialogTitle>{tTicketState(item.state)}</DialogTitle>
      <DialogContent>
        <FakeAttachment {...item} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          endIcon={<DeleteIcon />}
          disabled={isDeleting}
          onClick={() =>
            handleDelete(item?._id, { onSuccess: () => handleClose() })
          }
        >
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}
