import { useNavigate, type RouteObject } from 'react-router-dom';
import { SignInLayout } from './layout';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  ToggleButton as MUIToggleButton,
  Radio,
  RadioGroup,
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
import { RHFSelect, RHFTextField } from '@/components/RHFInputs';
import { publicApi } from '@/utils/axios';
import { useStoreActions } from '@/store';
import { useRequestStates, type RequestStates } from '@/hooks/useRequestStates';

export const signInRoute: RouteObject = {
  path: '/signin',
  element: <SignInLayout />,
  children: [{ index: true, element: <SignIn /> }],
};

const ToggleButton = styled(MUIToggleButton)(() => ({ flex: 1 }));

function SignIn() {
  const [mode, setMode] = useState('signup');
  const handleModeChange = (_: unknown, val: string) => {
    if (val) {
      setMode(val);
    }
  };
  const req = useRequestStates({ loading: false });

  return (
    <>
      <ToggleButtonGroup
        color="primary"
        value={mode}
        exclusive
        onChange={handleModeChange}
        sx={{ width: 1 }}
        disabled={req.loading.b}
      >
        <ToggleButton value="signin">登录</ToggleButton>
        <ToggleButton value="signup">注册</ToggleButton>
      </ToggleButtonGroup>
      {mode == 'signin' ? <SignInForm {...req} /> : <SignUpForm {...req} />}
    </>
  );
}

function SignInForm({ loading, success, error }: RequestStates) {
  const navigate = useNavigate();
  const { dispatch, userActions } = useStoreActions();
  const { control, handleSubmit } = useForm<SignInFormData>({
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = handleSubmit((data) => {
    loading.start(true);
    publicApi
      .post<TokenRefresh_Response>('/api/auth/signin', data)
      .then((res) => {
        dispatch(userActions.setTokenRefresh(res.data));
        success.receive();
        navigate('/');
      })
      .catch((msg) => error.receive(msg));
  });

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
      <Button variant="contained" type="submit" disabled={loading.b}>
        登录
      </Button>
      <Typography align="center">
        {loading.b ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}

function SignUpForm({ loading, success, error }: RequestStates) {
  const navigate = useNavigate();
  const { dispatch, userActions } = useStoreActions();
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
  const onSubmit = handleSubmit((data) => {
    loading.start(true);
    publicApi
      .post<TokenRefresh_Response>('/api/auth/signup', data)
      .then((res) => {
        dispatch(userActions.setTokenRefresh(res.data));
        success.receive();
        navigate('/');
      })
      .catch((msg) => error.receive(msg));
  });

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
      <FormControl>
        <RadioGroup
          row
          name="hasOrg"
          value={orgMode}
          onChange={handleOrgMode}
          sx={{ gap: 1 }}
        >
          <FormControlLabel value="true" label="选择机构" control={<Radio />} />
          <FormControlLabel
            value="false"
            label="暂不选择"
            control={<Radio />}
          />
          <FormControlLabel
            value="xiaoer"
            label="小二（调试）"
            control={<Radio />}
          />
        </RadioGroup>
      </FormControl>
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
      <Button variant="contained" type="submit" disabled={loading.b}>
        注册
      </Button>
      <Typography align="center">
        {loading.b ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
