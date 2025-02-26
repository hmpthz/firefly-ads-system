import { useNavigate, type RouteObject } from 'react-router-dom';
import { SignInLayout } from './layout';
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useStoreActions, useStoreSlice } from '@/store';
import { useForm } from 'react-hook-form';
import { type User_Client, type UpdateUserFormData } from '@shared/user';
import {
  RadioGroupControl,
  RHFSelect,
  RHFTextField,
} from '@/components/Inputs';
import { privateApi } from '@/utils/axios';
import { type NewOrgFormData } from '@shared/org';
import { useCustomMutation, type CustomMutation } from '@/hooks/useCustomQuery';

export const createOrgRoute: RouteObject = {
  path: '/signin/create-org',
  element: <SignInLayout />,
  children: [{ index: true, element: <CreateOrg /> }],
};

function CreateOrg() {
  const navigate = useNavigate();
  const { dispatch, userActions } = useStoreActions();
  const { profile } = useStoreSlice('user');
  const [orgMode, setOrgMode] = useState('false');

  const updateUserMutation = useCustomMutation((data: UpdateUserFormData) =>
    privateApi
      .patch<User_Client>(`/api/user/action/${profile!.id}`, data)
      .then((res) => {
        dispatch(userActions.setProfile(res.data));
        navigate('/');
      })
  );
  const createOrgMutation = useCustomMutation((data: NewOrgFormData) =>
    privateApi.post<User_Client>(`/api/org/create`, data).then((res) => {
      dispatch(userActions.setProfile(res.data));
      navigate('/');
    })
  );

  return (
    <>
      <Typography>
        欢迎，
        <Typography component="span" fontWeight="bold">
          {`${profile!.username} (${profile!.email})`}
        </Typography>
      </Typography>
      <RadioGroupControl
        disabled={updateUserMutation.isPending || createOrgMutation.isPending}
        row
        name="hasOrg"
        value={orgMode}
        onChange={(_, val) => setOrgMode(val)}
        sx={{ gap: 1 }}
        labels={{ true: '选择机构', false: '新机构入驻' }}
      />
      {orgMode == 'true' ? (
        <InputOrgForm {...updateUserMutation} />
      ) : (
        <CreateOrgForm {...createOrgMutation} />
      )}
    </>
  );
}

function InputOrgForm({
  mutate,
  isPending,
}: CustomMutation<UpdateUserFormData>) {
  const { control, handleSubmit } = useForm<UpdateUserFormData>({
    defaultValues: {
      role: 'org.operator',
      orgName: '',
    },
  });
  const onSubmit = handleSubmit((data) => mutate(data));

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
      <Button variant="contained" type="submit" disabled={isPending}>
        确认
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}

function CreateOrgForm({ mutate, isPending }: CustomMutation<NewOrgFormData>) {
  const { control, handleSubmit } = useForm<NewOrgFormData>({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      contactPerson: '',
      contactEmail: '',
      role: 'org.admin',
    },
  });
  const onSubmit = handleSubmit((data) => mutate(data));

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
      <Button variant="contained" type="submit" disabled={isPending}>
        确认
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
