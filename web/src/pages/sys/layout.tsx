import { AppBarOffset, FakeLink, TitleLabel } from '@/components/UI';
import {
  AppBar,
  Box,
  Divider,
  List,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { DashboardDrawer, DrawerButton, ProfileBox } from '../org/layout';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder';

export function SysDashboardLayout() {
  return (
    <>
      <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{}}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            <TitleLabel />
          </Typography>
          <Stack direction="row" spacing={2}>
            <FakeLink variant="h6">帮助</FakeLink>
            <FakeLink variant="h6">反馈</FakeLink>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack direction="row">
        <DashboardDrawer>
          <AppBarOffset />
          <List>
            <Divider sx={{ my: 1 }} />
            <DrawerButton to="/org" text="首页" icon={<HomeIcon />} />
            <Divider sx={{ my: 2 }} />
            <DrawerButton
              to="/sys/credentials"
              text="资质列表"
              icon={<BusinessIcon />}
            />
            <DrawerButton
              to="/sys/assets"
              text="物料列表"
              icon={<SnippetFolderIcon />}
            />
            <Divider sx={{ my: 2 }} />
          </List>
          <ProfileBox />
        </DashboardDrawer>
        <Box sx={{ flexGrow: 1 }}>
          <AppBarOffset />
          <Box sx={{ px: 4, py: 2 }}>
            <Outlet />
          </Box>
        </Box>
      </Stack>
    </>
  );
}
