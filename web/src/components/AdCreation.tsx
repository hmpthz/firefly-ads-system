import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  IconButton,
  Divider,
  styled,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useStoreSlice } from '@/store';
import type { AssetTicket_Client, Attachment, Ticket } from '@shared/asset';
import type { TemplateAsset } from './Templates';
import { useCustomMutation, useCustomQuery } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import { FakeAttachment, FakeFileInput } from './Attachment';
import { RadioGroupControl, RHFSelect, RHFTextField } from './Inputs';
import type {
  AdCreationTicket_Client,
  NewCreationFormData,
} from '@shared/creation';
import { tCredentialState, tTicketState } from '@/utils/translate';
import { templatesData, templatesName } from '@/components/Templates';
import { GoBack } from './UI';
import { setPopupError } from '@/utils/error';
import {
  useCreationTimeSeries,
  creationTimeDataToXML,
  downloadXML,
} from '@/hooks/useTimeSeries';
import { ChartsControl, LineChart } from './ChartComponents';
import type { TimeScale } from '@/store/timeSeriesSlice';

export function AdCreationsList() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['creations', orgId], () =>
    privateApi
      .get<AdCreationTicket_Client[]>(`/api/ads/creation/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  if (isLoading)
    return (
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
    );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>创建时间</TableCell>
            <TableCell>名称</TableCell>
            <TableCell>模板</TableCell>
            <TableCell>刊例价(元)</TableCell>
            <TableCell>审核状态</TableCell>
            <TableCell>投放状态</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item) => (
            <AdCreationRow
              key={item._id}
              {...item}
              handleClick={() => navigate(`/org/creation/${item._id}`)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function AdCreationRow({
  createdAt,
  name,
  template,
  state,
  active,
  handleClick,
}: AdCreationTicket_Client & { handleClick: () => void }) {
  const price = templatesData[template]?.price || 0;

  return (
    <TableRow>
      <TableCell>{createdAt.split('T')[0]}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{template}</TableCell>
      <TableCell>{price}</TableCell>
      <TableCell>{tCredentialState(state)}</TableCell>
      <TableCell>{active ? '已开始投放' : '未开始投放'}</TableCell>
      <TableCell>
        <IconButton size="small" onClick={handleClick}>
          <ArrowForwardIosIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

const Paragraph = styled(Typography)(() => ({ fontSize: 18 }));

export function AdCreationDetail(data: AdCreationTicket_Client) {
  const { name, state, template, assets, createdAt, active } = data;
  const templateData = templatesData[template];
  const Preview = templateData.component;

  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  const [showCharts, setShowCharts] = useState<boolean>(true);

  const timeSeries = useCreationTimeSeries(data, timeScale);

  const getImpressionsSeries = () => {
    if (!timeSeries) {
      return [];
    }

    return [
      {
        name: '曝光次数',
        data: timeSeries.map((item) => ({
          time: item.time,
          value: item.impressions,
        })),
        color: '#1976d2',
      },
    ];
  };

  const getClicksSeries = () => {
    if (!timeSeries) {
      return [];
    }

    return [
      {
        name: '点击次数',
        data: timeSeries.map((item) => ({
          time: item.time,
          value: item.clicks,
        })),
        color: '#ff9800',
      },
    ];
  };

  const getCTRSeries = () => {
    if (!timeSeries) {
      return [];
    }

    return [
      {
        name: '点击率',
        data: timeSeries.map((item) => ({
          time: item.time,
          value: item.ctr,
        })),
        color: '#4caf50',
      },
    ];
  };

  // 处理XML数据下载
  const handleDownloadXML = () => {
    if (!timeSeries) return;

    const xmlContent = creationTimeDataToXML(name, timeSeries);
    const fileName = `creation_${name}_${timeScale}_${new Date()
      .toISOString()
      .slice(0, 10)}.xml`;
    downloadXML(xmlContent, fileName);
  };

  return (
    <Stack spacing={2} sx={{ width: 1, maxWidth: 520, mb: 4 }}>
      <ChartsControl
        show={showCharts}
        setShow={setShowCharts}
        onDownload={handleDownloadXML}
        loading={!timeSeries}
      />

      <Paragraph>创意名称：{name}</Paragraph>
      <Paragraph>创建时间：{createdAt}</Paragraph>
      <Paragraph>审核状态：{tTicketState(state)}</Paragraph>
      <Paragraph>投放状态：{active ? '已开始投放' : '未开始投放'}</Paragraph>
      <Paragraph>创意模板：{templateData.name}</Paragraph>
      <Paragraph>刊例价：{templateData.price} 元</Paragraph>

      {showCharts ? (
        <>
          <Box sx={{ py: 3 }}>
            <LineChart
              title="曝光次数走势"
              timeScale={timeScale}
              setTimeScale={setTimeScale}
              series={getImpressionsSeries()}
              yAxisName="曝光次数"
              loading={!timeSeries}
              width="800px"
              height="350px"
            />
          </Box>

          <Box sx={{ py: 3 }}>
            <LineChart
              title="点击次数走势"
              timeScale={timeScale}
              setTimeScale={setTimeScale}
              series={getClicksSeries()}
              yAxisName="点击次数"
              loading={!timeSeries}
              width="800px"
              height="350px"
            />
          </Box>

          <Box sx={{ py: 3 }}>
            <LineChart
              title="点击率走势"
              timeScale={timeScale}
              setTimeScale={setTimeScale}
              series={getCTRSeries()}
              yAxisName="点击率(%)"
              loading={!timeSeries}
              width="800px"
              height="350px"
            />
          </Box>
        </>
      ) : null}

      <Divider />
      {Object.entries(templateData.assets).map(([key, data]) => (
        <PreviewEdit key={key} {...data} preview={assets[key]} />
      ))}
      <Divider />
      <Preview {...assets} />
    </Stack>
  );
}

export function AdCreationForm({
  title,
  onBack,
  initData,
  isSubmitting,
  onSubmitData,
}: {
  title: string;
  onBack?: () => void;
  initData?: AdCreationTicket_Client;
  isSubmitting?: boolean;
  onSubmitData?: (data: NewCreationFormData) => void;
}) {
  const defaultValues = useMemo<NewCreationFormData>(() => {
    if (initData) {
      return {
        name: initData.name,
        template: initData.template,
        assets: Object.fromEntries(
          Object.entries(initData.assets).map(([key, value]) => [
            key,
            value._id,
          ])
        ),
      };
    }
    return { unitName: '', name: '', template: '', assets: {} };
  }, [initData]);

  const { control, handleSubmit, setValue, getValues, watch } =
    useForm<NewCreationFormData>({ defaultValues });
  const templateData = templatesData[watch('template')];
  const Preview = templateData?.component;
  const [previewData, setPreviewData] = useState<
    Partial<Record<string, Attachment>>
  >(initData?.assets || {});

  const onSubmit = handleSubmit((data) => {
    if (!templateData) {
      return;
    }
    const assetsId = getValues('assets');
    if (!Object.keys(templateData.assets).every((key) => assetsId[key])) {
      setPopupError('没有完成物料的填写！');
    }
    onSubmitData?.(data);
  });

  return (
    <>
      <GoBack onClick={onBack} />
      <Typography variant="h4">{title}</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <Stack
          component="form"
          spacing={2}
          sx={{ width: 1, maxWidth: 520 }}
          onSubmit={onSubmit}
        >
          {!initData && (
            <RHFTextField
              control={control}
              name="unitName"
              variant="outlined"
              type="text"
              label="绑定广告投放单元的名称"
              required
              autoComplete="off"
            />
          )}
          <RHFTextField
            control={control}
            name="name"
            variant="outlined"
            type="text"
            label="创意名称"
            required
            autoComplete="off"
          />
          <RHFSelect
            control={control}
            name="template"
            labelId="template-select-label"
            labelText="选择创意模板"
            items={templatesName}
            required
            onChange={() => {
              setValue('assets', {});
              setPreviewData({});
            }}
          />
          <Divider />
          {templateData &&
            Object.entries(templateData.assets).map(([key, data]) => (
              <PreviewEdit
                key={key}
                {...data}
                preview={previewData[key]}
                onAdd={(val, preview) => {
                  setValue(`assets.${key}`, val);
                  setPreviewData((prev) => ({ ...prev, [key]: preview }));
                }}
                onDelete={() => {
                  const assetsId = getValues('assets');
                  delete assetsId[key];
                  setValue(`assets`, assetsId);
                  setPreviewData((prev) => ({ ...prev, [key]: undefined }));
                }}
              />
            ))}
          {Preview && (
            <>
              <Divider />
              <Preview {...previewData} />
              <Divider />
            </>
          )}
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            提交
          </Button>
          <Typography align="center">
            {isSubmitting ? <CircularProgress /> : null}
          </Typography>
        </Stack>
      </Box>
    </>
  );
}

function PreviewEdit({
  name,
  type,
  preview,
  onAdd,
  onDelete,
}: TemplateAsset & {
  preview?: Attachment & Partial<Ticket>;
  onAdd?: (formValue: string | Attachment, preview: Attachment) => void;
  onDelete?: () => void;
}) {
  const [inputMode, setInputMode] = useState('name');
  const [assetName, setAssetName] = useState('');
  const { mutate: findAsset, isPending: isFinding } = useCustomMutation(
    (name: string) => {
      if (!onAdd || !name) return Promise.resolve();
      return privateApi
        .get<AssetTicket_Client>(
          `/api/ads/asset/find?name=${encodeURIComponent(name)}`
        )
        .then(({ data }) => {
          if (data.contentType != type) {
            throw new Error("ContentType don't match!");
          }
          onAdd(data._id, data);
        });
    }
  );

  return (
    <Box sx={{ pl: '10px' }}>
      <Box
        sx={({ palette }) => ({
          pl: '10px',
          borderLeft: `2px solid ${palette.primary.main}`,
          borderTop: `2px solid ${palette.primary.main}`,
        })}
      >
        <Typography variant="h6">{name}</Typography>
        {preview ? (
          <>
            <FakeAttachment {...preview} onDelete={onDelete} />
            {preview.state && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                物料审核状态：{tTicketState(preview.state)}
              </Typography>
            )}
          </>
        ) : (
          <Box>
            <RadioGroupControl
              disabled={isFinding}
              row
              name="inputMode"
              value={inputMode}
              onChange={(_, val) => {
                setInputMode(val);
                setAssetName('');
              }}
              labels={{ name: '输入已有物料名称', new: '创建新物料' }}
            />
            {inputMode == 'name' ? (
              <Stack direction="row" spacing={1}>
                <TextField
                  variant="outlined"
                  type="text"
                  label="物料名称"
                  autoComplete="off"
                  fullWidth
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  disabled={isFinding}
                  onClick={() => findAsset(assetName)}
                >
                  查找
                </Button>
              </Stack>
            ) : (
              <FakeFileInput filter={[type]} onAdd={(a) => onAdd?.(a, a)} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
