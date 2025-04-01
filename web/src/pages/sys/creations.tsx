import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { type TicketState, type AssetTicket_Client } from '@shared/asset';
import type {
  AdCreationTicket_Client,
  UpdateCreationTicketFormData,
} from '@shared/creation';
import { privateApi } from '@/utils/axios';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import { tTicketState } from '@/utils/translate';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FakeAttachment } from '@/components/Attachment';
import { useState, useEffect } from 'react';
import { TickeStateRadioGroup, type DialogData } from '@/components/Asset';
import { templatesData } from '@/components/Templates';

export const sysCreationsRoute: RouteObject = {
  path: 'creations',
  element: <Page />,
};

function Page() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useCustomQuery(['creations'], () =>
    privateApi
      .get<AdCreationTicket_Client[]>(`/api/ads/creation/list`)
      .then((res) => res.data)
  );
  const [dialogData, setDialogData] = useState<
    DialogData<AdCreationTicket_Client>
  >({
    open: false,
  });
  const closeDialog = () => {
    refetch();
    setDialogData((prev) => ({ ...prev, open: false }));
  };

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
      </Box>
      <Divider sx={{ my: 1 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>创建时间</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>模板</TableCell>
              <TableCell>刊例价(元)</TableCell>
              <TableCell>机构</TableCell>
              <TableCell>审核状态</TableCell>
              <TableCell>投放状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((item) => (
              <ItemRow
                key={item._id}
                {...item}
                handleClick={() => setDialogData({ open: true, item })}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
      <CreationDialog data={dialogData} handleClose={closeDialog} />
    </Paper>
  );
}

const ItemRow = ({
  createdAt,
  name,
  template,
  state,
  active,
  org,
  handleClick,
}: AdCreationTicket_Client & { handleClick: () => void }) => {
  const price = templatesData[template]?.price || 0;

  return (
    <TableRow>
      <TableCell>{createdAt.split('T')[0]}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{template}</TableCell>
      <TableCell>{price}</TableCell>
      <TableCell>{org.name}</TableCell>
      <TableCell>{tTicketState(state)}</TableCell>
      <TableCell>{active ? '已开始投放' : '未开始投放'}</TableCell>
      <TableCell>
        <IconButton size="small" onClick={handleClick}>
          <ArrowForwardIosIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const Paragraph = styled(Typography)(() => ({ fontSize: 18 }));

function CreationDialog({
  data: { open, item },
  handleClose,
}: {
  data: DialogData<AdCreationTicket_Client>;
  handleClose: () => void;
}) {
  const [creationState, setCreationState] =
    useState<TicketState>('in-progress');
  const [assetStates, setAssetStates] = useState<Record<string, TicketState>>(
    {}
  );

  // Initialize asset states when dialog opens
  useEffect(() => {
    if (item) {
      const initialStates: Record<string, TicketState> = {};
      Object.entries(item.assets).forEach(([key]) => {
        initialStates[key] = 'in-progress';
      });
      setAssetStates(initialStates);
    }
  }, [item]);

  const { mutate, isPending } = useCustomMutation(
    (item: AdCreationTicket_Client) => {
      const data: UpdateCreationTicketFormData = {
        state: creationState,
        assets: assetStates,
      };
      return privateApi
        .patch(`/api/ads/creation/${item._id}/state`, data)
        .then(() => void 0);
    }
  );

  const handleSubmit = () => {
    if (!item) return;
    mutate(item, { onSuccess: handleClose });
  };

  if (!item) return null;

  const templateData = templatesData[item.template];
  const Preview = templateData?.component;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      onClose={handleClose}
      scroll="paper"
    >
      <DialogTitle>{item.org.name} - 广告创意审核</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ width: 1, maxWidth: 520, mb: 4 }}>
          <Paragraph>创意名称：{item.name}</Paragraph>
          <Paragraph>创建时间：{item.createdAt}</Paragraph>
          <Paragraph>创意模板：{templateData?.name}</Paragraph>
          <Paragraph>刊例价：{templateData?.price} 元</Paragraph>
          <Paragraph>
            投放状态：{item.active ? '已开始投放' : '未开始投放'}
          </Paragraph>

          <Divider />
          <Box>
            <Typography variant="h6">创意审核状态</Typography>
            <TickeStateRadioGroup
              value={creationState}
              setState={setCreationState}
            />
          </Box>

          <Divider />
          <Typography variant="h6">物料审核</Typography>
          {Object.entries(item.assets).map(([key, asset]) => (
            <Box key={key} sx={{ pl: '10px', mb: 2 }}>
              <Box
                sx={({ palette }) => ({
                  pl: '10px',
                  borderLeft: `2px solid ${palette.primary.main}`,
                  borderTop: `2px solid ${palette.primary.main}`,
                })}
              >
                <Typography variant="subtitle1">
                  {templateData?.assets[key]?.name || key}
                </Typography>
                <FakeAttachment {...asset} />
                <Typography variant="body2">物料审核状态：</Typography>
                <TickeStateRadioGroup
                  value={assetStates[key] || (asset.state as TicketState)}
                  setState={(newState) => {
                    setAssetStates((prev) => ({
                      ...prev,
                      [key]: newState,
                    }));
                  }}
                />
              </Box>
            </Box>
          ))}

          {Preview && (
            <>
              <Divider />
              <Typography variant="h6">创意预览</Typography>
              <Preview {...item.assets} />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          startIcon={<PublishIcon />}
          onClick={handleSubmit}
          disabled={isPending}
        >
          提交审核结果
        </Button>
        <Button variant="contained" color="error" endIcon={<DeleteIcon />}>
          删除
        </Button>
        <Typography sx={{ mx: 2 }}>
          {isPending ? <CircularProgress size={24} /> : null}
        </Typography>
      </DialogActions>
    </Dialog>
  );
}
