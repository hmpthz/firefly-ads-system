import { useStoreActions, useStoreSlice } from '@/store';
import { Alert, Snackbar } from '@mui/material';

export function ErrorsSnackbar() {
  const { error } = useStoreSlice('popup');
  const { dispatch, popupActions } = useStoreActions();

  return (
    <Snackbar
      open={error.open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={() => dispatch(popupActions.setError())}
        elevation={4}
      >
        {error.msg}
      </Alert>
    </Snackbar>
  );
}
