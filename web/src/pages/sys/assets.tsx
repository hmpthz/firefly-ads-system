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
import { type TicketState, type AssetTicket_Client } from '@shared/asset';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import { tContentType, tCredentialState } from '@/utils/translate';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FakeAttachment } from '@/components/Attachment';
import { useState } from 'react';
import { TickeStateRadioGroup, type DialogData } from '@/components/Asset';

export const sysAssetsRoute: RouteObject = {
  path: 'assets',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useCustomQuery(['assets'], () =>
    privateApi
      .get<AssetTicket_Client[]>(`/api/ads/asset/list`)
      .then((res) => res.data)
  );
  const [dialogData, setDialogData] = useState<DialogData<AssetTicket_Client>>({
    open: false,
  });
  const closeDialog = () => {
    refetch();
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
              <TableCell>机构</TableCell>
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
      <AssetDialog data={dialogData} handleClose={closeDialog} />
    </Paper>
  );
}

const ItemRow = ({
  createdAt,
  name,
  contentType,
  state,
  org,
  handleClick,
}: AssetTicket_Client & { handleClick: () => void }) => (
  <TableRow>
    <TableCell>{createdAt}</TableCell>
    <TableCell>{name}</TableCell>
    <TableCell>{tContentType(contentType)}</TableCell>
    <TableCell>{org.name}</TableCell>
    <TableCell>{tCredentialState(state)}</TableCell>
    <TableCell>
      <IconButton size="small" onClick={handleClick}>
        <ArrowForwardIosIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

function AssetDialog({
  data: { open, item },
  handleClose,
}: {
  data: DialogData<AssetTicket_Client>;
  handleClose: () => void;
}) {
  const [state, setState] = useState<TicketState>('in-progress');
  const { mutate, isPending } = useCustomMutation((item: AssetTicket_Client) =>
    privateApi.patch(`/api/ads/asset/${item._id}`, { state }).then(() => void 0)
  );
  const handleSubmit = () => {
    mutate(item!, { onSuccess: handleClose });
  };

  if (!item) return;

  return (
    <Dialog open={open} onClose={handleClose} scroll="paper">
      <DialogTitle>{item.org.name}</DialogTitle>
      <DialogContent>
        <FakeAttachment {...item} />
        <TickeStateRadioGroup value={state} setState={setState} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          startIcon={<PublishIcon />}
          onClick={handleSubmit}
        >
          提交
        </Button>
        <Button variant="contained" color="error" endIcon={<DeleteIcon />}>
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}
