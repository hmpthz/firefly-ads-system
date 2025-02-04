import { useStoreSlice } from '@/store';
import type { UserRole } from '@shared/user';
import {
  Navigate,
  Outlet,
  useNavigation,
  type RouteObject,
} from 'react-router-dom';

interface RouteGuardProps {
  /** 如果是undefined，说明必须是未登录状态才能访问 */
  roles?: UserRole[];
  redirect: string;
}
interface RouteGuardOptions extends RouteGuardProps {
  children: RouteObject[];
}

/** 鉴权路由 */
export const routeGuard: (opts: RouteGuardOptions) => RouteObject = ({
  children,
  ...props
}) => ({ element: <RouteGuard {...props} />, children });

function RouteGuard({ roles, redirect }: RouteGuardProps) {
  const { state } = useNavigation();
  const { auth, profile } = useStoreSlice('user');

  if (
    state == 'loading' ||
    (!roles && !auth) ||
    (roles && auth && profile && roles.includes(auth.role))
  ) {
    return <Outlet />;
  } else {
    return <Navigate to={redirect} />;
  }
}
