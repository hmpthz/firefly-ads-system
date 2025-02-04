import {
  createSlice,
  type CaseReducer,
  type PayloadAction,
} from '@reduxjs/toolkit';

interface PopupStore {
  error: {
    open: boolean;
    msg?: string;
  };
}
const initialState: PopupStore = { error: { open: false } };

const setError: CaseReducer<PopupStore, PayloadAction<string | undefined>> = (
  state,
  action
) => {
  if (action.payload) {
    state.error.open = true;
    state.error.msg = action.payload;
  } else {
    state.error.open = false;
  }
};

const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: { setError },
});

export const popupReducer = popupSlice.reducer;
export const popupActions = popupSlice.actions;
