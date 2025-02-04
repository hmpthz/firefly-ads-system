import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { appRoute } from './App';
import { StoreProvider } from './store';
import { setPopupError } from './utils/error';

const router = createBrowserRouter([appRoute]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </React.StrictMode>
);

// 全局异常处理
window.addEventListener('error', (e) => {
  setPopupError(e.error.toString());
});
window.addEventListener('unhandledrejection', (e) => {
  setPopupError(e.reason.toString());
});
