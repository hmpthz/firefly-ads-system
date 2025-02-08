import { useCustomQuery } from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';
import { privateApi } from '@/utils/axios';
import { tCredentialState, tTicketState } from '@/utils/translate';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { CredentialTicket_Client, Organization_Client } from '@shared/org';
import { useNavigate, type RouteObject } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState } from 'react';
import { FakeAttachment } from '@/components/Attachment';

export const orgDetailRoute: RouteObject = {
  path: 'detail',
  element: <Page />,
};

function Page() {
  const orgId = useStoreSlice('user').profile!.orgId!;
  const orgQuery = useCustomQuery(['org', orgId], () =>
    privateApi
      .get<Organization_Client>(`/api/org/${orgId}/item`)
      .then((res) => res.data)
  );
  const isLoading = orgQuery.isLoading;
  const isError = orgQuery.isError;

  return isLoading || isError ? (
    <LoadingScreen />
  ) : (
    <>
      <Typography variant="h4">机构详情</Typography>
      <Divider sx={{ my: 3 }} />
      <InfoBlock {...orgQuery.data!} />
      <CredentialList />
    </>
  );
}

function InfoBlock({
  name,
  description,
  address,
  contactPerson,
  contactEmail,
  credential,
  createdAt,
}: Organization_Client) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">{name}</Typography>
        <Button variant="contained" startIcon={<EditIcon />}>
          修改
        </Button>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Grid container>
        <Grid xs={6}>
          <List dense>
            <ListItem>
              <ListItemText primary="描述" secondary={description} />
            </ListItem>
            <ListItem>
              <ListItemText primary="地址" secondary={address} />
            </ListItem>
          </List>
        </Grid>
        <Grid xs={6}>
          <List dense>
            <ListItem>
              <ListItemText
                primary="联系人"
                secondary={`${contactPerson} (${contactEmail})`}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="创建时间" secondary={createdAt} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="资质"
                secondary={tCredentialState(credential?.state)}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
}

function CredentialList() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['credentials', orgId], () =>
    privateApi
      .get<CredentialTicket_Client[]>(`/api/org/credential/list?orgId=${orgId}`)
      .then((res) => res.data)
  );
  const [dialogData, setDialogData] = useState<DialogData>({ open: false });
  const closeDialog = () => setDialogData((prev) => ({ ...prev, open: false }));

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">资质工单列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org/create-credential')}
        >
          上传
        </Button>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ my: 1 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableCell>上传时间</TableCell>
            <TableCell>审核状态</TableCell>
            <TableCell>附件数量</TableCell>
            <TableCell>操作</TableCell>
          </TableHead>
          {data?.map((item) => (
            <ItemRow
              key={item.id}
              {...item}
              handleClick={() => setDialogData({ open: true, item })}
            />
          ))}
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
  attachments,
  handleClick,
}: CredentialTicket_Client & { handleClick: () => void }) => (
  <TableRow>
    <TableCell>{createdAt}</TableCell>
    <TableCell>{tTicketState(state)}</TableCell>
    <TableCell>{attachments.length}</TableCell>
    <TableCell>
      <IconButton size="small" onClick={handleClick}>
        <ArrowForwardIosIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

type DialogData = {
  open: boolean;
  item?: CredentialTicket_Client;
};
function CredentialDialog({
  data: { open, item },
  handleClose,
}: {
  data: DialogData;
  handleClose: () => void;
}) {
  if (!item) return;

  return (
    <Dialog open={open} onClose={handleClose} scroll="paper">
      <DialogTitle>{tTicketState(item.state)}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {item.attachments.map((a, i) => (
            <FakeAttachment key={a.name} {...a} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" endIcon={<DeleteIcon />}>
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LoadingScreen() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={40} />
    </Stack>
  );
}
