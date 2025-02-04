import { useStoreSlice } from '@/store';
import { Alert, CircularProgress, Typography } from '@mui/material';
import { Navigate, useNavigation, type RouteObject } from 'react-router-dom';

/** 鉴权路由，根据用户角色重定向至相应页 */
export const indexRoute: RouteObject = {
  index: true,
  element: <IndexRedirect />,
};

function IndexRedirect() {
  const { state } = useNavigation();
  const { auth, profile } = useStoreSlice('user');

  if (state == 'loading') {
    return (
      <Typography align="center">
        <CircularProgress />
      </Typography>
    );
  } else if (!auth || !profile) {
    return <Navigate to="/signin" />;
  } else if (auth.role.startsWith('org')) {
    if (profile.orgId) {
      return <Navigate to="/org" />;
    } else {
      return <Navigate to="/signin/create-org" />;
    }
  } else if (auth.role.startsWith('sys')) {
    return <Navigate to="/sys" />;
  } else {
    return <Alert severity="error">鉴权失败，非法角色（role）</Alert>;
  }
}
