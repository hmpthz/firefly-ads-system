import { AppBarOffset, FakeLink, TitleLabel } from '@/components/UI';
import { AppBar, Box, Paper, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const LAYOUT_MAXWIDTH = 1280;

export function SignInLayout() {
  return (
    <>
      <AppBar sx={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Toolbar sx={{ flexGrow: 1, maxWidth: LAYOUT_MAXWIDTH }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            <TitleLabel />
          </Typography>
          <Stack direction="row" spacing={2}>
            <FakeLink variant="h6">帮助</FakeLink>
            <FakeLink variant="h6">反馈</FakeLink>
          </Stack>
        </Toolbar>
      </AppBar>
      <AppBarOffset />
      <Box
        sx={{
          position: 'relative',
          minHeight: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ position: 'absolute', zIndex: '-1' }}>
          <Box
            component="img"
            alt="signin-bg"
            src="/signin-bg.png"
            sx={{
              width: 1,
              height: 600,
              objectFit: 'cover',
            }}
          />
        </Box>
        <Paper
          elevation={4}
          sx={{
            bgcolor: 'common.white',
            width: 1,
            maxWidth: 500,
            borderRadius: 2,
            mt: 6,
            mb: 4,
            p: 2,
          }}
        >
          <Outlet />
        </Paper>
      </Box>
      <Box sx={{ bgcolor: 'grey.800', color: 'common.white', py: 3 }}>
        <Stack
          direction="row"
          sx={(theme) => ({
            maxWidth: LAYOUT_MAXWIDTH,
            m: theme.spacing(0, 'auto'),
            p: theme.spacing(3, 2, 6, 2),
            justifyContent: 'space-between',
          })}
        >
          <Typography variant="h5">
            <TitleLabel />
          </Typography>
          <Box>
            <Typography variant="h6">产品链接</Typography>
            <Stack sx={{ color: 'grey.400', mt: 1 }}>
              <FakeLink>萤火广告</FakeLink>
              <FakeLink>萤火创意</FakeLink>
              <FakeLink>萤火API</FakeLink>
            </Stack>
          </Box>
          <Box>
            <Typography variant="h6">联系我们</Typography>
            <Stack sx={{ color: 'grey.400', mt: 1 }}>
              <Typography>support@fireflyads.com</Typography>
              <Typography>微信号：fireflyads</Typography>
            </Stack>
          </Box>
        </Stack>
        <Typography align="center" variant="subtitle2" color="grey.500">
          ©2025 萤火广告创意公司
        </Typography>
      </Box>
    </>
  );
}
