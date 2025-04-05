import type { RouteObject } from 'react-router-dom';
import { SysDashboardLayout } from './layout';
import {
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import GridV2 from '@mui/material/Unstable_Grid2';
import type { TicketState } from '@shared/asset';
import { sysAssetsRoute } from './assets';
import { sysCredentialsRoute } from './credentials';
import { sysCreationsRoute } from './creations';
import { useBooleanData, useTicketStateData } from '@/hooks/useTimeSeries';
import { ticketStateColors } from '@/components/ChartComponents';
import { tCredentialState, tTicketState } from '@/utils/translate';
import { PieChart } from '@/components/ChartComponents';

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
      <Typography variant="h4">小二管理看板</Typography>
      <Divider sx={{ my: 3 }} />
      <GridV2 container spacing={3}>
        <GridV2 xs={6}>
          <OrgBlock />
        </GridV2>
        <GridV2 xs={6}>
          <CreationsBlock />
        </GridV2>
        <GridV2 xs={6}>
          <CampaignsBlock />
        </GridV2>
        <GridV2 xs={6}>
          <UnitsBlock />
        </GridV2>
      </GridV2>
    </>
  );
}

function OrgBlock() {
  const data = useTicketStateData('org');

  const getCredentialsPieData = () => {
    if (!data) {
      return [];
    }

    return data.map(({ state, count }) => ({
      name: tCredentialState(state),
      value: count,
      color: ticketStateColors[state as TicketState],
    }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <PieChart
        title="机构资质审核情况"
        data={getCredentialsPieData()}
        loading={!data}
        height="320px"
        layout="top"
      />
    </Paper>
  );
}

function CreationsBlock() {
  const data = useTicketStateData('creations');

  const getTicketStatePieData = () => {
    if (!data) {
      return [];
    }

    return data
      .filter(({ state }) => state !== undefined)
      .map(({ state, count }) => ({
        name: tTicketState(state!),
        value: count,
        color: ticketStateColors[state as TicketState],
      }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <PieChart
        title="广告创意工单审核情况"
        data={getTicketStatePieData()}
        loading={!data}
        height="320px"
        layout="top"
      />
    </Paper>
  );
}

function CampaignsBlock() {
  const data = useBooleanData('campaigns');

  const getActivePieData = () => {
    if (!data) {
      return [];
    }

    return data.map(({ enabled, count }) => ({
      name: enabled ? '投放中' : '未投放',
      value: count,
      color: enabled
        ? ticketStateColors['approved']
        : ticketStateColors['pending'],
    }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <PieChart
        title="投放计划状态"
        data={getActivePieData()}
        loading={!data}
        height="320px"
        layout="top"
      />
    </Paper>
  );
}

function UnitsBlock() {
  const data = useBooleanData('units');

  const getActivePieData = () => {
    if (!data) {
      return [];
    }

    return data.map(({ enabled, count }) => ({
      name: enabled ? '投放中' : '未投放',
      value: count,
      color: enabled
        ? ticketStateColors['approved']
        : ticketStateColors['pending'],
    }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <PieChart
        title="投放单元状态"
        data={getActivePieData()}
        loading={!data}
        height="320px"
        layout="top"
      />
    </Paper>
  );
}
