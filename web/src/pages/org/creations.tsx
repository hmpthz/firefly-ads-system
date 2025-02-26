import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { privateApi } from '@/utils/axios';
import { useCustomQuery } from '@/hooks/useCustomQuery';
import { useStoreSlice } from '@/store';
import { tCredentialState } from '@/utils/translate';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { AdCreationTicket_Client } from '@shared/creation';

export const creationsRoute: RouteObject = {
  path: 'creations',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['creations', orgId], () =>
    privateApi
      .get<AdCreationTicket_Client[]>(`/api/ads/creation/list?orgId=${orgId}`)
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
        <Typography variant="h5">广告创意工单列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org/create-creation')}
        >
          创建
        </Button>
      </Box>
      <Typography variant="h5"></Typography>
      <Divider sx={{ my: 1 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>上传时间</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>模板</TableCell>
              <TableCell>审核状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((item) => (
              <ItemRow
                key={item._id}
                {...item}
                handleClick={() => navigate(`/org/creation/${item._id}`)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
    </Paper>
  );
}

const ItemRow = ({
  createdAt,
  name,
  template,
  state,
  handleClick,
}: AdCreationTicket_Client & { handleClick: () => void }) => (
  <TableRow>
    <TableCell>{createdAt}</TableCell>
    <TableCell>{name}</TableCell>
    <TableCell>{template}</TableCell>
    <TableCell>{tCredentialState(state)}</TableCell>
    <TableCell>
      <IconButton size="small" onClick={handleClick}>
        <ArrowForwardIosIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);
