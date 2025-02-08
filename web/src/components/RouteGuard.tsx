import { useStoreSlice } from '@/store';
import type { User_Client, UserRole } from '@shared/user';
import { Navigate, Outlet, type RouteObject } from 'react-router-dom';

interface RouteGuardProps {
  /** 如果是undefined，说明必须是未登录状态才能访问 */
  roles?: UserRole[];
  redirect: string;
  /** 额外的条件 */
  condition?: (profile?: User_Client) => boolean;
}
interface RouteGuardOptions extends RouteGuardProps {
  children: RouteObject[];
}

/** 鉴权路由 */
export const routeGuard: (opts: RouteGuardOptions) => RouteObject = ({
  children,
  ...props
}) => ({ element: <RouteGuard {...props} />, children });

function RouteGuard({ roles, redirect, condition }: RouteGuardProps) {
  const { auth, profile } = useStoreSlice('user');

  if (
    (!roles && !auth) ||
    (roles && auth && profile && roles.includes(auth.role)) ||
    (condition && condition(profile))
  ) {
    return <Outlet />;
  } else {
    return <Navigate to={redirect} />;
  }
}
