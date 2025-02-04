import type { RouteObject } from 'react-router-dom';
import { SysDashboardLayout } from './layout';

export const sysRoute: RouteObject = {
  path: '/sys',
  element: <SysDashboardLayout />,
  children: [{ index: true, element: <Dashboard /> }],
};

function Dashboard() {
  return <></>;
}
