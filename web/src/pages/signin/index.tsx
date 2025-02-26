import { useNavigate, type RouteObject } from 'react-router-dom';
import { SignInLayout } from './layout';
import {
  Alert,
  Button,
  CircularProgress,
  ToggleButton as MUIToggleButton,
  Stack,
  styled,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  type TokenRefresh_Response,
  type SignInFormData,
  type SignUpFormData,
} from '@shared/user';
import {
  RadioGroupControl,
  RHFSelect,
  RHFTextField,
} from '@/components/Inputs';
import { publicApi } from '@/utils/axios';
import { useStoreActions } from '@/store';
import { useCustomMutation, type CustomMutation } from '@/hooks/useCustomQuery';

export const signInRoute: RouteObject = {
  path: '/signin',
  element: <SignInLayout />,
  children: [{ index: true, element: <Page /> }],
};

const ToggleButton = styled(MUIToggleButton)(() => ({ flex: 1 }));

function Page() {
  const navigate = useNavigate();
  const { dispatch, userActions } = useStoreActions();
  const [mode, setMode] = useState('signin');
  const handleModeChange = (_: unknown, val: string) => {
    if (val) {
      setMode(val);
    }
  };

  const signinMutation = useCustomMutation((data: SignInFormData) =>
    publicApi
      .post<TokenRefresh_Response>('/api/auth/signin', data)
      .then((res) => {
        dispatch(userActions.setTokenRefresh(res.data));
        navigate('/');
      })
  );
  const signupMutaton = useCustomMutation((data: SignUpFormData) =>
    publicApi
      .post<TokenRefresh_Response>('/api/auth/signup', data)
      .then((res) => {
        dispatch(userActions.setTokenRefresh(res.data));
        navigate('/');
      })
  );

  return (
    <>
      <ToggleButtonGroup
        color="primary"
        value={mode}
        exclusive
        onChange={handleModeChange}
        sx={{ width: 1 }}
        disabled={signinMutation.isPending || signupMutaton.isPending}
      >
        <ToggleButton value="signin">登录</ToggleButton>
        <ToggleButton value="signup">注册</ToggleButton>
      </ToggleButtonGroup>
      {mode == 'signin' ? (
        <SignInForm {...signinMutation} />
      ) : (
        <SignUpForm {...signupMutaton} />
      )}
    </>
  );
}

function SignInForm({ mutate, isPending }: CustomMutation<SignInFormData>) {
  const { control, handleSubmit } = useForm<SignInFormData>({
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={3} sx={{ mt: 3 }}>
      <Typography variant="h5">登录萤火账号</Typography>
      <RHFTextField
        control={control}
        name="email"
        variant="outlined"
        type="email"
        label="邮箱"
        placeholder="请输入邮箱"
        required
      />
      <RHFTextField
        control={control}
        name="password"
        variant="outlined"
        type="password"
        label="密码"
        required
      />
      <Button variant="contained" type="submit" disabled={isPending}>
        登录
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}

function SignUpForm({ mutate, isPending }: CustomMutation<SignUpFormData>) {
  const [orgMode, setOrgMode] = useState('true');
  const { control, handleSubmit, setValue } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      username: '',
      role: 'org.operator',
      orgName: '',
    },
  });

  const handleOrgMode = (_: unknown, val: string) => {
    setOrgMode(val);
    if (val != 'true') {
      setValue('orgName', '');
    }
    if (val == 'xiaoer') {
      setValue('role', 'sys.xiaoer');
    }
  };
  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={3} sx={{ mt: 3 }}>
      <Typography variant="h5">注册萤火新账号</Typography>
      <RHFTextField
        control={control}
        name="username"
        variant="outlined"
        type="text"
        label="用户名"
        required
      />
      <RHFTextField
        control={control}
        name="email"
        variant="outlined"
        type="email"
        label="邮箱"
        placeholder="请输入邮箱"
        required
      />
      <RHFTextField
        control={control}
        name="password"
        variant="outlined"
        type="password"
        label="密码"
        required
      />
      <RadioGroupControl
        row
        name="hasOrg"
        value={orgMode}
        onChange={handleOrgMode}
        sx={{ gap: 1 }}
        labels={{ true: '选择机构', false: '暂不选择', xiaoer: '小二（调试）' }}
      />
      {orgMode == 'true' ? (
        <>
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
        </>
      ) : orgMode == 'false' ? (
        <Alert severity="info">可以在注册完成后再选择，或入驻新机构</Alert>
      ) : (
        <Alert severity="warning">小二平台审核员，仅供调试</Alert>
      )}
      <Button variant="contained" type="submit" disabled={isPending}>
        注册
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
