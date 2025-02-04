import { Outlet, type RouteObject } from 'react-router-dom';
import { tokenFirstRefresh } from './utils/axios';
import { theme } from './assets/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { indexRoute } from './pages';
import { signInRoute } from './pages/signin';
import { ErrorsSnackbar } from './components/ErrorsSnackbar';
import { routeGuard } from './components/RouteGuard';
import { createOrgRoute } from './pages/signin/create-org';
import { orgRoute } from './pages/org';
import { sysRoute } from './pages/sys';

export const appRoute: RouteObject = {
  id: 'app',
  // 启动时尝试获取access token
  loader: tokenFirstRefresh,
  element: <App />,
  children: [
    indexRoute,
    routeGuard({ redirect: '/', children: [signInRoute] }),
    routeGuard({
      roles: ['org.admin', 'org.operator', 'sys.xiaoer'],
      redirect: '/',
      children: [createOrgRoute],
    }),
    routeGuard({
      roles: ['org.admin', 'org.operator'],
      redirect: '/org',
      children: [orgRoute],
    }),
    routeGuard({
      roles: ['sys.xiaoer'],
      redirect: '/sys',
      children: [sysRoute],
    }),
  ],
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
      <ErrorsSnackbar />
    </ThemeProvider>
  );
}
