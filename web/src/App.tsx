import { Outlet, type RouteObject } from 'react-router-dom';
import { StoreProvider } from './store/store';
import { useTokenFirstRefresh } from './utils/axios';

export const appRoute: RouteObject[] = [
  {
    element: <App />,
    children: [],
  },
];

function App() {
  const firstRefreshContext = useTokenFirstRefresh();

  return (
    <StoreProvider>
      <Outlet context={firstRefreshContext} />
    </StoreProvider>
  );
}
