import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import GridV2 from '@mui/material/Unstable_Grid2';
import { useNavigate, type RouteObject } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { privateApi } from '@/utils/axios';
import { useCustomQuery } from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';
import type { AdCampaign_Client } from '@shared/campaign';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { tPricingModel } from '@/utils/translate';

export const campaignsRoute: RouteObject = {
  path: 'campaigns',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['campaigns', orgId], () =>
    privateApi
      .get<AdCampaign_Client[]>(`/api/ads/campaign/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">广告计划列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org/create-campaign')}
        >
          创建
        </Button>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ mt: 1, mb: 3 }} />
      <Stack spacing={3}>
        {data?.map((item) => (
          <ItemCard key={item._id} {...item} />
        ))}
      </Stack>
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
    </Paper>
  );
}

function ItemCard({
  _id,
  createdAt,
  name,
  dateRange,
  timeRange,
  pricingModel,
  budget,
  units,
}: AdCampaign_Client) {
  const navigate = useNavigate();

  return (
    <Box>
      <Stack
        direction="row"
        sx={({ palette }) => ({
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `8px solid ${palette.primary.main}`,
          pl: 2,
          pr: 4,
        })}
      >
        <Typography fontWeight="bold">{name}</Typography>
        <Button
          endIcon={<ArrowForwardIosIcon />}
          onClick={() => navigate(`/org/campaign/${_id}`)}
        >
          详情
        </Button>
      </Stack>
      <Divider />
      <GridV2 container>
        <GridV2 xs={6}>
          <List dense>
            <ListItem>
              <ListItemText primary="创建时间" secondary={createdAt} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="投放日期范围"
                secondary={`${dateRange.from} ~ ${dateRange.to}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="投放时间范围"
                secondary={'进入详情页查看'}
              />
            </ListItem>
          </List>
        </GridV2>
        <GridV2 xs={6}>
          <List dense>
            <ListItem>
              <ListItemText
                primary="计费方式"
                secondary={tPricingModel(pricingModel)}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="投放预算"
                secondary={`${budget.toLocaleString()} (RMB)`}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="投放单元数量" secondary={units.length} />
            </ListItem>
          </List>
        </GridV2>
      </GridV2>
    </Box>
  );
}
