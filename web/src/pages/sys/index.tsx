import type { RouteObject } from 'react-router-dom';
import { SysDashboardLayout } from './layout';
import { privateApi } from '@/utils/axios';
import type { Organization_Client } from '@shared/org';
import { useCustomQuery } from '@/hooks/useCustomQuery';
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
import GridV2 from '@mui/material/Unstable_Grid2';
import type { AssetTicket_Client } from '@shared/asset';
import { useMemo } from 'react';
import { sysAssetsRoute } from './assets';
import { sysCredentialsRoute } from './credentials';
import { sysCreationsRoute } from './creations';

export const sysRoute: RouteObject = {
  path: '/sys',
  element: <SysDashboardLayout />,
  children: [
    { index: true, element: <Page /> },
    sysAssetsRoute,
    sysCredentialsRoute,
    sysCreationsRoute,
  ],
};

function Page() {
  return (
    <>
      <Typography variant="h4">首页看板</Typography>
      <Divider sx={{ my: 3 }} />
      <GridV2 container spacing={3}>
        <GridV2 xs={6}>
          <OrgBlock />
        </GridV2>
        <GridV2 xs={6}>
          <AssetBlock />
        </GridV2>
      </GridV2>
    </>
  );
}

function OrgBlock() {
  const { data, isLoading, isError } = useCustomQuery(['orgs'], () =>
    privateApi
      .get<Organization_Client[]>(`/api/org/list`)
      .then((res) => res.data)
  );
  const stats = useMemo(() => {
    if (!data) return;
    const nOrg = data.length;
    let nPending = 0;
    let nInProgress = 0;
    let nApproved = 0;
    for (const { credential } of data) {
      if (!credential) continue;
      if (credential.state == 'pending') nPending++;
      else if (credential.state == 'in-progress') nInProgress++;
      else if (credential.state == 'approved') nApproved++;
    }
    return { nOrg, nPending, nInProgress, nApproved };
  }, [data]);

  return isLoading || isError ? (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={30} />
      <Skeleton variant="rounded" height={30} />
    </Stack>
  ) : (
    <>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h5">机构信息</Typography>
        <Divider sx={{ my: 1 }} />
        <List dense>
          <ListItem>
            <ListItemText primary={`机构总数：${stats?.nOrg}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`资质等待审核：${stats?.nPending}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`资质审核中：${stats?.nInProgress}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`验证通过：${stats?.nApproved}`} />
          </ListItem>
        </List>
      </Paper>
    </>
  );
}

function AssetBlock() {
  const { data, isLoading, isError } = useCustomQuery(['assets'], () =>
    privateApi
      .get<AssetTicket_Client[]>(`/api/ads/asset/list`)
      .then((res) => res.data)
  );
  const stats = useMemo(() => {
    if (!data) return;
    const nAsset = data.length;
    let nPending = 0;
    let nInProgress = 0;
    let nApproved = 0;
    for (const { state } of data) {
      if (state == 'pending') nPending++;
      else if (state == 'in-progress') nInProgress++;
      else if (state == 'approved') nApproved++;
    }
    return { nAsset, nPending, nInProgress, nApproved };
  }, [data]);

  return isLoading || isError ? (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={30} />
      <Skeleton variant="rounded" height={30} />
    </Stack>
  ) : (
    <>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h5">物料信息</Typography>
        <Divider sx={{ my: 1 }} />
        <List dense>
          <ListItem>
            <ListItemText primary={`物料总数：${stats?.nAsset}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`等待审核：${stats?.nPending}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`审核中：${stats?.nInProgress}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`审核通过：${stats?.nApproved}`} />
          </ListItem>
        </List>
      </Paper>
    </>
  );
}
