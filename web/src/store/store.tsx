import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { userActions, userReducers } from './userSlice';
import { PersistGate } from 'redux-persist/integration/react';

const store = configureStore({
  reducer: {
    user: userReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
type RootState = ReturnType<typeof store.getState>;
const persistor = persistStore(store);

export const StoreProvider = ({ children }: ChildrenProps) => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>{children}</PersistGate>
  </Provider>
);

const useRootSelector =
  useSelector.withTypes<ReturnType<typeof store.getState>>();
export function useRootStore(prop: keyof RootState) {
  return useRootSelector((state) => state[prop]);
}
export function useActionDispatch() {
  const dispatch = useDispatch();
  return {
    dispatch,
    userActions,
  };
}

export const getRootStore = () => ({
  getState: store.getState,
  dispatch: store.dispatch,
  userActions,
});
