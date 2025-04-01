import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, type FormEventHandler } from 'react';
import { useStoreSlice } from '@/store';
import {
  useCustomMutation,
  useCustomQuery,
  type CustomMutateFn,
} from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import type {
  AssetTicket_Client,
  Attachment,
  TicketState,
} from '@shared/asset';
import { FakeAttachment, FakeFileInput } from './Attachment';
import {
  tContentType,
  tCredentialState,
  tTicketState,
} from '@/utils/translate';
import { useNavigate } from 'react-router-dom';
import { RadioGroupControl } from './Inputs';

export function AssetsList() {
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
  const [dialogData, setDialogData] = useState<DialogData<AssetTicket_Client>>({
    open: false,
  });
  const closeDialog = () => {
    if (isDeleting) return;
    setDialogData((prev) => ({ ...prev, open: false }));
  };

  if (isLoading)
    return (
      <Typography align="center">
        <CircularProgress />
      </Typography>
    );

  return (
    <>
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
              <AssetRow
                key={item._id}
                {...item}
                handleClick={() => setDialogData({ open: true, item })}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AssetDialog
        data={dialogData}
        isDeleting={isDeleting}
        handleDelete={handleDelete}
        handleClose={closeDialog}
      />
    </>
  );
}

export function AssetRow({
  createdAt,
  name,
  contentType,
  state,
  handleClick,
}: AssetTicket_Client & { handleClick: () => void }) {
  return (
    <TableRow>
      <TableCell>{createdAt.split('T')[0]}</TableCell>
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
}

export type DialogData<T> = {
  open: boolean;
  item?: T;
};
function AssetDialog({
  data: { open, item },
  isDeleting,
  handleDelete,
  handleClose,
}: {
  data: DialogData<AssetTicket_Client>;
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
          onClick={() => handleDelete(item?._id, { onSuccess: handleClose })}
        >
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CreateAssetForm() {
  const navigate = useNavigate();
  const [attachment, setAttachment] = useState<Attachment>();
  const { mutate, isPending } = useCustomMutation((data: Attachment) =>
    privateApi.post('/api/ads/asset/create', data).then(() => void 0)
  );
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!attachment) return;
    mutate(attachment, { onSuccess: () => navigate(-1) });
  };

  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ width: 1, maxWidth: 500 }}
      onSubmit={handleSubmit}
    >
      <Alert severity="info">一件物料只能上传一个附件</Alert>
      {attachment ? (
        <FakeAttachment
          key={attachment.name}
          {...attachment}
          onDelete={isPending ? undefined : () => setAttachment(undefined)}
        />
      ) : (
        <FakeFileInput
          filter={['text', 'image', 'video']}
          onAdd={(a) => setAttachment(a)}
        />
      )}
      <Divider />
      <Button variant="contained" type="submit" disabled={isPending}>
        上传
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}

export function TickeStateRadioGroup({
  value,
  setState,
}: {
  value: TicketState;
  setState: (val: TicketState) => void;
}) {
  return (
    <RadioGroupControl
      row
      name="ticketState"
      sx={{ gap: 0 }}
      value={value}
      onChange={(_, val) => setState(val as TicketState)}
      labels={
        {
          'in-progress': '进行中',
          approved: '通过',
          declined: '拒绝',
        } as Record<TicketState, string>
      }
    />
  );
}
