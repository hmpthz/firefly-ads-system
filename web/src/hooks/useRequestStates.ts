import { useStoreActions, useStoreSlice } from '@/store';
import { useState } from 'react';

export function useRequestStates(initial: {
  loading: string | boolean;
  success?: string;
}) {
  const [loading, setLoading] = useState(initial.loading);
  const [success, setSuccess] = useState(initial.success);
  const { error } = useStoreSlice('popup');
  const { dispatch, popupActions } = useStoreActions();

  function setError(val?: string) {
    dispatch(popupActions.setError(val));
  }
  function startLoading(val: string | true) {
    setLoading(val);
    setSuccess(undefined);
    setError(undefined);
  }
  function setSuccessOnly(val?: string) {
    setLoading(false);
    setSuccess(val);
    setError(undefined);
  }
  function setErrorOnly(val: string) {
    setLoading(false);
    setSuccess(undefined);
    setError(val);
  }

  return {
    loading: {
      b: loading !== false,
      val: loading,
      set: setLoading,
      start: startLoading,
    },
    success: {
      val: success,
      set: setSuccess,
      receive: setSuccessOnly,
    },
    error: {
      val: error,
      set: setError,
      receive: setErrorOnly,
    },
  };
}
export type RequestStates = ReturnType<typeof useRequestStates>;
