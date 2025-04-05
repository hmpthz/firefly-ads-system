import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import {
  useNavigate,
  useSearchParams,
  type RouteObject,
} from 'react-router-dom';
import {
  adResources,
  tAdResource,
  type AdResourceType,
} from '@/utils/translate';
import { AdCampaignsList } from '@/components/AdCampaign';
import { AdUnitsList } from '@/components/AdUnit';
import { AdCreationsList } from '@/components/AdCreation';
import { AssetsList } from '@/components/Asset';

export const resourcesRoute: RouteObject = {
  path: 'resources',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AdResourceType;
  const [tab, setTab] = useState<AdResourceType>(
    adResources.includes(tabParam) ? tabParam : adResources[0]
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
        <Typography variant="h5">广告投放资源列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/org/create-${tab}`)}
        >
          创建{tAdResource(tab)}
        </Button>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, val) => {
          setTab(val);
          setSearchParams({ tab: val });
        }}
      >
        {adResources.map((resource) => (
          <Tab key={resource} label={tAdResource(resource)} value={resource} />
        ))}
      </Tabs>
      <Divider sx={{ my: 1 }} />
      {tab == 'campaign' ? (
        <AdCampaignsList />
      ) : tab == 'unit' ? (
        <AdUnitsList />
      ) : tab == 'creation' ? (
        <AdCreationsList />
      ) : tab == 'asset' ? (
        <AssetsList />
      ) : null}
    </Paper>
  );
}
