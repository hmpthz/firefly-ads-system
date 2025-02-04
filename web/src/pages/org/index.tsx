import type { RouteObject } from 'react-router-dom';
import { OrgDashboardLayout } from './layout';
import Grid from '@mui/material/Unstable_Grid2';

export const orgRoute: RouteObject = {
  path: '/org',
  id: 'org-index',
  element: <OrgDashboardLayout />,
  children: [{ index: true, element: <Dashboard /> }],
};

function Dashboard() {
  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={8}>机构信息</Grid>
        <Grid xs={4}>机构资质</Grid>
      </Grid>
    </>
  );
}
