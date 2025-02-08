import { Outlet, type RouteObject } from 'react-router-dom';
import { tokenFirstRefresh } from './utils/axios';
import { theme } from './assets/theme';
import {
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { indexRoute } from './pages';
import { signInRoute } from './pages/signin';
import { ErrorsSnackbar } from './components/ErrorsSnackbar';
import { routeGuard } from './components/RouteGuard';
import { createOrgRoute } from './pages/signin/create-org';
import { orgRoute } from './pages/org';
import { sysRoute } from './pages/sys';
import { useCustomQuery } from './hooks/useCustomQuery';

export const appRoute: RouteObject = {
  id: 'app',
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
      redirect: '/',
      condition: (profile) => profile?.orgId != undefined,
      children: [orgRoute],
    }),
    routeGuard({
      roles: ['sys.xiaoer'],
      redirect: '/',
      children: [sysRoute],
    }),
  ],
};

function App() {
  // 启动时尝试获取access token
  const { isLoading } = useCustomQuery(['tokenFirstFetch'], tokenFirstRefresh);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoading ? (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      ) : (
        <Outlet />
      )}
      <ErrorsSnackbar />
    </ThemeProvider>
  );
}
