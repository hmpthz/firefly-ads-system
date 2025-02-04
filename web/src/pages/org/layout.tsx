import { AppBarOffset, FakeLink, TitleLabel } from '@/components/UI';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type React from 'react';
import { Outlet } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder';
import { useStoreSlice } from '@/store';

const DRAWER_WIDTH = 240;

const DrawerButton = ({
  text,
  icon,
}: {
  text: string;
  icon: React.JSX.Element;
}) => (
  <ListItem>
    <ListItemButton>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  </ListItem>
);

export function OrgDashboardLayout() {
  const { profile } = useStoreSlice('user');

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
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
            },
          }}
        >
          <AppBarOffset />
          <List>
            <DrawerButton text="首页" icon={<HomeIcon />} />
            <Divider sx={{ my: 2 }} />
            <DrawerButton text="机构详情" icon={<BusinessIcon />} />
            <DrawerButton text="物料列表" icon={<SnippetFolderIcon />} />
            <Divider sx={{ my: 2 }} />
            <Stack>
              <Typography>{profile!.username}</Typography>
              <Typography>{profile!.email}</Typography>
            </Stack>
          </List>
        </Drawer>
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
