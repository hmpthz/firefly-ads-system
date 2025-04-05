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
import { orgDetailRoute } from './credentials';
import { credentialCreateRoute } from './credential-create';
import { assetCreateRoute } from './asset-create';
import { creationCreateRoute } from './creation-create';
import { creationDetailRoute } from './creation-detail';
import { unitCreateRoute } from './unit-create';
import { unitDetailRoute } from './unit-detail';
import { campaignCreateRoute } from './campaign-create';
import { campaignDetailRoute } from './campaign-detail';
import { resourcesRoute } from './resources';
import { useMemo, useState } from 'react';
import type { AdCampaign_Client, AdUnit_Client } from '@shared/campaign';
import type { TimeScale } from '@/store/timeSeriesSlice';
import {
  useCampaignTimeSeries,
  useUnitTimeSeries,
} from '@/hooks/useTimeSeries';
import { LineChart } from '@/components/ChartComponents';

export const orgRoute: RouteObject = {
  path: '/org',
  id: 'org-index',
  element: <OrgDashboardLayout />,
  children: [
    { index: true, element: <Page /> },
    orgDetailRoute,
    credentialCreateRoute,
    resourcesRoute,
    campaignDetailRoute,
    campaignCreateRoute,
    unitDetailRoute,
    unitCreateRoute,
    creationDetailRoute,
    creationCreateRoute,
    assetCreateRoute,
  ],
};

function Page() {
  const orgId = useStoreSlice('user').profile!.orgId!;
  const orgQuery = useCustomQuery(['org', orgId], () =>
    privateApi
      .get<Organization_Client>(`/api/org/${orgId}`)
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
        <GridV2 xs={6}>
          <BudgetsBlock />
        </GridV2>
        <GridV2 xs={6}>
          <ImpressionsBlock />
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

function BudgetsBlock() {
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data: campaigns } = useCustomQuery(['campaigns', orgId], () =>
    privateApi
      .get<AdCampaign_Client[]>(`/api/ads/campaign/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  const campaignAll = useMemo(() => {
    if (!campaigns) return undefined;
    const all = { _id: orgId, budget: 0 } as AdCampaign_Client;
    for (const campaign of campaigns) {
      all.budget += campaign.budget;
    }
    return all;
  }, [campaigns]);

  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  const timeSeries = useCampaignTimeSeries(campaignAll, timeScale);

  const getBudgetConsumptionSeries = () => {
    if (!timeSeries) {
      return [];
    }

    return [
      {
        name: '预算消耗',
        data: timeSeries.map((item) => ({
          time: item.time,
          value: item.budget,
        })),
        color: '#1976d2',
      },
    ];
  };

  return (
    <Paper elevation={2} sx={{}}>
      <LineChart
        title="投放计划总预算消耗"
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        series={getBudgetConsumptionSeries()}
        yAxisName="消耗(RMB)"
        loading={!timeSeries}
        // width="800px"
        height="400px"
        layout="top"
      />
    </Paper>
  );
}

function ImpressionsBlock() {
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data: units } = useCustomQuery(['units', orgId], () =>
    privateApi
      .get<AdUnit_Client[]>(`/api/ads/unit/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  const unitAll = useMemo(() => {
    if (!units) return undefined;
    const all = { _id: orgId, expectedImpressions: 0 } as AdUnit_Client;
    for (const unit of units) {
      all.expectedImpressions += unit.expectedImpressions;
    }
    return all;
  }, [units]);

  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  const timeSeries = useUnitTimeSeries(unitAll, timeScale);

  const getImpressionsSeries = () => {
    if (!timeSeries) {
      return [];
    }

    return [
      {
        name: '曝光量',
        data: timeSeries.map((item) => ({
          time: item.time,
          value: item.impressions,
        })),
        color: '#4caf50',
      },
    ];
  };

  return (
    <Paper elevation={2} sx={{}}>
      <LineChart
        title="投放单元总曝光量"
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        series={getImpressionsSeries()}
        yAxisName="曝光量"
        loading={!timeSeries}
        layout="top"
        height="400px"
      />
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
