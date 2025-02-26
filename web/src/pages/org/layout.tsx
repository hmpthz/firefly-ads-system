import { AppBarOffset, FakeLink, TitleLabel } from '@/components/UI';
import {
  AppBar,
  Avatar,
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
import { Outlet, useNavigate } from 'react-router-dom';
import { useStoreActions, useStoreSlice } from '@/store';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';

const DRAWER_WIDTH = 240;

export const DrawerButton = ({
  text,
  icon,
  to,
  onClick,
  disabled,
}: {
  text: string;
  icon: React.JSX.Element;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) {
      navigate(to);
    }
    onClick?.();
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{ px: 3, py: 1.5 }}
        onClick={handleClick}
        disabled={disabled}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
};

export const DashboardDrawer = ({ children }: ChildrenProps) => (
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
    {children}
  </Drawer>
);

export function ProfileBox() {
  const profile = useStoreSlice('user').profile!;
  const { dispatch, userActions } = useStoreActions();
  const { mutate, isPending } = useCustomMutation(() =>
    privateApi
      .post('/api/auth/signout')
      .then(() => dispatch(userActions.clearAll()))
  );

  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Avatar
        alt="profile-photo"
        src="/blank-profile.png"
        sx={{ width: 60, height: 60 }}
      />
      <Typography fontWeight="bold">{profile.username}</Typography>
      <Typography variant="body2">({profile.email})</Typography>
      <List sx={{ width: 1 }}>
        <DrawerButton text="用户详情" icon={<ManageAccountsIcon />} />
        <DrawerButton
          text="退出"
          icon={<LogoutIcon />}
          disabled={isPending}
          onClick={() => mutate()}
        />
      </List>
    </Stack>
  );
}

export function OrgDashboardLayout() {
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
              to="/org/detail"
              text="机构详情"
              icon={<BusinessIcon />}
            />
            <DrawerButton
              to="/org/assets"
              text="物料列表"
              icon={<ViewListIcon />}
            />
            <DrawerButton
              to="/org/creations"
              text="广告创意列表"
              icon={<SnippetFolderIcon />}
            />
            <DrawerButton
              to="/org/campaigns"
              text="投放计划列表"
              icon={<EventNoteIcon />}
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
