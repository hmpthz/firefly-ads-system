import { useNavigate, type RouteObject } from 'react-router-dom';
import { SignInLayout } from './layout';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useStoreActions, useStoreSlice } from '@/store';
import { useForm } from 'react-hook-form';
import {
  type UserProfile,
  type UpdateUserFormData,
  type TokenRefresh_Response,
} from '@shared/user';
import { RHFSelect, RHFTextField } from '@/components/RHFInputs';
import { useRequestStates, type RequestStates } from '@/hooks/useRequestStates';
import { privateApi } from '@/utils/axios';
import { type CreateOrgFormData } from '@shared/org';

export const createOrgRoute: RouteObject = {
  path: '/signin/create-org',
  element: <SignInLayout />,
  children: [{ index: true, element: <CreateOrg /> }],
};

function CreateOrg() {
  const { profile } = useStoreSlice('user');
  const [orgMode, setOrgMode] = useState('false');
  const req = useRequestStates({ loading: false });

  return (
    <>
      <Typography>
        欢迎，
        <Typography component="span" fontWeight="bold">
          {`${profile!.username} (${profile!.email})`}
        </Typography>
      </Typography>
      <FormControl>
        <RadioGroup
          row
          name="hasOrg"
          value={orgMode}
          onChange={(_, val) => setOrgMode(val)}
          sx={{ gap: 1 }}
        >
          <FormControlLabel value="true" label="选择机构" control={<Radio />} />
          <FormControlLabel
            value="false"
            label="新机构入驻"
            control={<Radio />}
          />
        </RadioGroup>
      </FormControl>
      {orgMode == 'true' ? (
        <InputOrgForm {...req} />
      ) : (
        <CreateOrgForm {...req} />
      )}
    </>
  );
}

function InputOrgForm({ loading, success, error }: RequestStates) {
  const navigate = useNavigate();
  const { profile } = useStoreSlice('user');
  const { dispatch, userActions } = useStoreActions();
  const { control, handleSubmit } = useForm<UpdateUserFormData>({
    defaultValues: {
      role: 'org.operator',
      orgName: '',
    },
  });
  const onSubmit = handleSubmit((data) => {
    loading.start(true);
    privateApi
      .patch<UserProfile>(`/api/user/action/${profile!.id}`, data)
      .then((res) => {
        dispatch(userActions.setProfile(res.data));
        success.receive();
        navigate('/');
      })
      .catch((msg) => error.receive(msg));
  });
  return (
    <Stack component="form" onSubmit={onSubmit} spacing={3} sx={{ mt: 2 }}>
      <RHFTextField
        control={control}
        name="orgName"
        variant="outlined"
        type="text"
        label="机构名称"
        required
        autoComplete="off"
      />
      <RHFSelect
        control={control}
        name="role"
        labelId="role-select-label"
        labelText="选择角色权限（调试）"
        items={{ 管理员: 'org.admin', 运营: 'org.operator' }}
      />
      <Button variant="contained" type="submit" disabled={loading.b}>
        确认
      </Button>
      <Typography align="center">
        {loading.b ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}

function CreateOrgForm({ loading, success, error }: RequestStates) {
  const navigate = useNavigate();
  const { dispatch, userActions } = useStoreActions();
  const { control, handleSubmit } = useForm<CreateOrgFormData>({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      contactPerson: '',
      contactEmail: '',
      role: 'org.admin',
    },
  });
  const onSubmit = handleSubmit((data) => {
    loading.start(true);
    privateApi
      .post<TokenRefresh_Response>(`/api/org/create`, data)
      .then((res) => {
        dispatch(userActions.setTokenRefresh(res.data));
        success.receive();
        navigate('/');
      })
      .catch((msg) => error.receive(msg));
  });

  return (
    <Stack
      component="form"
      onSubmit={onSubmit}
      autoComplete="off"
      spacing={3}
      sx={{ mt: 2 }}
    >
      <RHFTextField
        control={control}
        name="name"
        variant="outlined"
        type="text"
        label="机构名称"
        required
      />
      <RHFTextField
        control={control}
        name="description"
        variant="outlined"
        type="text"
        label="机构介绍"
        required
      />
      <RHFTextField
        control={control}
        name="address"
        variant="outlined"
        type="text"
        label="机构地址"
        required
      />
      <RHFTextField
        control={control}
        name="contactPerson"
        variant="outlined"
        type="text"
        label="联系人名称"
        required
      />
      <RHFTextField
        control={control}
        name="contactEmail"
        variant="outlined"
        type="text"
        label="联系人邮箱"
        required
      />
      <Alert severity="info">入驻新机构的用户默认为管理员</Alert>
      <Button variant="contained" type="submit" disabled={loading.b}>
        确认
      </Button>
      <Typography align="center">
        {loading.b ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
