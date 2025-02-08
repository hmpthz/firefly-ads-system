import { type RouteObject } from 'react-router-dom';
import { OrgDashboardLayout } from './layout';
import GridV2 from '@mui/material/Unstable_Grid2';
import { useCustomQuery, type CustomQuery } from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';
import { privateApi } from '@/utils/axios';
import { type Organization_Client } from '@shared/org';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { tCredentialState } from '@/utils/translate';
import { orgDetailRoute } from './detail';
import { orgAssetsRoute } from './assets';
import { createCredentialRoute } from './upload-credential';
import { createAssetRoute } from './upload-asset';

export const orgRoute: RouteObject = {
  path: '/org',
  id: 'org-index',
  element: <OrgDashboardLayout />,
  children: [
    { index: true, element: <Page /> },
    orgDetailRoute,
    orgAssetsRoute,
    createCredentialRoute,
    createAssetRoute,
  ],
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
    <Dashboard orgQuery={orgQuery} />
  );
}

function Dashboard({
  orgQuery,
}: {
  orgQuery: CustomQuery<Organization_Client>;
}) {
  const orgData = orgQuery.data!;

  return (
    <>
      <Typography variant="h4">首页看板</Typography>
      <Divider sx={{ my: 3 }} />
      <GridV2 container spacing={3}>
        <GridV2 xs={8}>
          <InfoBlock {...orgData} />
        </GridV2>
        <GridV2 xs={4}>
          <CredentialBlock {...orgData} />
        </GridV2>
      </GridV2>
    </>
  );
}

function InfoBlock({
  name,
  description,
  address,
  contactPerson,
  contactEmail,
}: Organization_Client) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h5">{name}</Typography>
      <Divider sx={{ my: 1 }} />
      <List dense>
        <ListItem>
          <ListItemText primary="描述" secondary={description} />
        </ListItem>
        <ListItem>
          <ListItemText primary="地址" secondary={address} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="联系人"
            secondary={`${contactPerson} (${contactEmail})`}
          />
        </ListItem>
      </List>
    </Paper>
  );
}

function CredentialBlock({ credential }: Organization_Client) {
  let Icon: SvgIconComponent;
  let iconColor: string;
  const text = tCredentialState(credential?.state);

  if (!credential) {
    Icon = CloudUploadOutlined;
    iconColor = 'grey.400';
  } else if (credential.state == 'pending') {
    Icon = AccessTimeOutlined;
    iconColor = 'grey.600';
  } else if (credential.state == 'in-progress') {
    Icon = SyncOutlined;
    iconColor = 'primary.main';
  } else if (credential.state == 'approved') {
    Icon = CheckCircleOutlined;
    iconColor = 'success.main';
  } else {
    Icon = CancelOutlined;
    iconColor = 'error.main';
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height: 1 }}>
      <Stack sx={{ alignItems: 'center' }}>
        <Typography variant="h5">机构资质</Typography>
        <Icon
          sx={{ display: 'block', fontSize: 60, color: iconColor, mt: 6 }}
        />
        <Typography>{text}</Typography>
      </Stack>
    </Paper>
  );
}

function LoadingScreen() {
  return (
    <>
      <Skeleton variant="rounded" height={30} sx={{ mb: 6 }} />
      <GridV2 container spacing={4}>
        <GridV2 xs={8}>
          <Skeleton variant="rounded" height={50} />
        </GridV2>
        <GridV2 xs={4}>
          <Skeleton variant="rounded" height={50} />
        </GridV2>
        <GridV2 xs={6}>
          <Skeleton variant="rounded" height={50} />
        </GridV2>
        <GridV2 xs={6}>
          <Skeleton variant="rounded" height={50} />
        </GridV2>
      </GridV2>
    </>
  );
}
