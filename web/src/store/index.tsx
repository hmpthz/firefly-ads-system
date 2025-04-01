import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { userActions, userReducer } from './userSlice';
import { PersistGate } from 'redux-persist/integration/react';
import { popupActions, popupReducer } from './popupSlice';
import { timeSeriesActions, timeSeriesReducer } from './timeSeriesSlice';

const _store = configureStore({
  reducer: {
    user: userReducer,
    popup: popupReducer,
    timeSeries: timeSeriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
type RootState = ReturnType<typeof _store.getState>;
const persistor = persistStore(_store);

export const StoreProvider = ({ children }: ChildrenProps) => (
  <Provider store={_store}>
    <PersistGate persistor={persistor}>{children}</PersistGate>
  </Provider>
);

const useRootSelector =
  useSelector.withTypes<ReturnType<typeof _store.getState>>();
export function useStoreSlice<K extends keyof RootState>(prop: K) {
  return useRootSelector((state) => state[prop]);
}
export function useStoreActions() {
  const dispatch = useDispatch();
  return {
    dispatch,
    userActions,
    popupActions,
    timeSeriesActions,
  };
}

export const store = {
  getState: _store.getState,
  dispatch: _store.dispatch,
  userActions,
  popupActions,
  timeSeriesActions,
};
