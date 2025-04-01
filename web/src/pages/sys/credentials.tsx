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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { type TicketState } from '@shared/asset';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import { tCredentialState } from '@/utils/translate';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FakeAttachment } from '@/components/Attachment';
import { useState } from 'react';
import type { CredentialTicket_Client } from '@shared/org';
import { TickeStateRadioGroup, type DialogData } from '@/components/Asset';

export const sysCredentialsRoute: RouteObject = {
  path: 'credentials',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useCustomQuery(['credentials'], () =>
    privateApi
      .get<CredentialTicket_Client[]>(`/api/org/credential/list`)
      .then((res) => res.data)
  );
  const [dialogData, setDialogData] = useState<
    DialogData<CredentialTicket_Client>
  >({ open: false });
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
        <Typography variant="h5">资质工单列表</Typography>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ my: 1 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>上传时间</TableCell>
              <TableCell>机构</TableCell>
              <TableCell>附件数量</TableCell>
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
      <CredentialDialog data={dialogData} handleClose={closeDialog} />
    </Paper>
  );
}

const ItemRow = ({
  createdAt,
  state,
  org,
  attachments,
  handleClick,
}: CredentialTicket_Client & { handleClick: () => void }) => (
  <TableRow>
    <TableCell>{createdAt}</TableCell>
    <TableCell>{org.name}</TableCell>
    <TableCell>{attachments.length}</TableCell>
    <TableCell>{tCredentialState(state)}</TableCell>
    <TableCell>
      <IconButton size="small" onClick={handleClick}>
        <ArrowForwardIosIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

function CredentialDialog({
  data: { open, item },
  handleClose,
}: {
  data: DialogData<CredentialTicket_Client>;
  handleClose: () => void;
}) {
  const [state, setState] = useState<TicketState>('in-progress');
  const { mutate, isPending } = useCustomMutation(
    (item: CredentialTicket_Client) =>
      privateApi
        .patch(`/api/org/credential/${item._id}`, { state })
        .then(() => void 0)
  );
  const handleSubmit = () => {
    mutate(item!, { onSuccess: handleClose });
  };

  if (!item) return;

  return (
    <Dialog open={open} onClose={handleClose} scroll="paper">
      <DialogTitle>{item.org.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {item.attachments.map((a, i) => (
            <FakeAttachment key={a.name} {...a} />
          ))}
        </Stack>
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
