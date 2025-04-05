import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import GridV2 from '@mui/material/Unstable_Grid2';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useStoreSlice } from '@/store';
import { privateApi } from '@/utils/axios';
import { useCustomQuery } from '@/hooks/useCustomQuery';
import type {
  AdCampaign_Client,
  AdUnit_Client,
  NewCampaignFormData,
} from '@shared/campaign';
import { pricingModelNames, tPricingModel } from '@/utils/translate';
import { RadioGroupControl, DateRangePicker, RHFSelect } from './Inputs';
import { GoBack } from './UI';
import { RHFTextField } from './Inputs';
import { SelectableTimeTable } from './TimeTable';
import {
  useCampaignUnitsTimeSeries,
  campaignUnitsTimeDataToXML,
  downloadXML,
} from '@/hooks/useTimeSeries';
import {
  ChartsControl,
  getColorByIndex,
  LineChart,
  PieChart,
} from './ChartComponents';
import type { TimeScale } from '@/store/timeSeriesSlice';

export function AdCampaignsList() {
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['campaigns', orgId], () =>
    privateApi
      .get<AdCampaign_Client[]>(`/api/ads/campaign/list?orgId=${orgId}`)
      .then((res) => res.data)
  );

  if (isLoading)
    return (
      <Typography align="center">
        {isLoading ? <CircularProgress /> : null}
      </Typography>
    );

  return (
    <Stack spacing={3}>
      {data?.map((item) => (
        <ItemCard key={item._id} {...item} />
      ))}
    </Stack>
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
  active,
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
              <ListItemText
                primary="创建时间"
                secondary={createdAt.split('T')[0]}
              />
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
                secondary={
                  timeRange ? '进入详情页查看分时投放' : '未设置分时投放'
                }
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
              <ListItemText
                primary="投放状态"
                secondary={active ? '已开始投放' : '未开始投放'}
              />
            </ListItem>
          </List>
        </GridV2>
      </GridV2>
    </Box>
  );
}

const Paragraph = styled(Typography)(() => ({ fontSize: 18 }));

export function AdCampaignDetail(data: AdCampaign_Client) {
  const {
    name,
    createdAt,
    pricingModel,
    budget,
    active,
    dateRange,
    timeRange,
    units,
  } = data;
  const navigate = useNavigate();

  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  const [showCharts, setShowCharts] = useState<boolean>(true);

  const timeSeries = useCampaignUnitsTimeSeries(data, timeScale);

  const getBudgetConsumptionSeries = () => {
    if (!timeSeries || !timeSeries.campaign) {
      return [];
    }

    return [
      {
        name: '预算消耗率',
        data: timeSeries.campaign.map((item) => ({
          time: item.time,
          value: item.consumptionRate,
        })),
        color: '#1976d2',
      },
    ];
  };

  const getUnitImpressionsPieData = () => {
    if (!timeSeries || !timeSeries.units) {
      return [];
    }

    return timeSeries.units.map((unitData, index) => {
      if (!unitData || unitData.length === 0) {
        return {
          name: units[index]?.name || `单元 ${index + 1}`,
          value: 0,
        };
      }

      return {
        name: units[index]?.name || `单元 ${index + 1}`,
        value: unitData[0]?.impressions || 0,
        color: getColorByIndex(index),
      };
    });
  };

  // 处理XML数据下载
  const handleDownloadXML = () => {
    if (!timeSeries) return;

    const unitNames = units.map((unit) => unit.name);
    const xmlContent = campaignUnitsTimeDataToXML(
      name,
      timeSeries.campaign,
      timeSeries.units,
      unitNames
    );

    const fileName = `campaign_${name}_${timeScale}_${new Date()
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

      <Paragraph>计划名称：{name}</Paragraph>
      <Paragraph>创建时间：{createdAt}</Paragraph>
      <Paragraph>投放状态：{active ? '已开始投放' : '未开始投放'}</Paragraph>
      <Paragraph>计费方式：{tPricingModel(pricingModel)}</Paragraph>
      <Paragraph>投放预算：{budget.toLocaleString()} (RMB)</Paragraph>
      <Paragraph>
        投放日期范围：{`${dateRange.from} ~ ${dateRange.to}`}
      </Paragraph>
      {timeRange && (
        <>
          <Paragraph>投放时间范围：</Paragraph>
          <SelectableTimeTable timeRange={timeRange} />
        </>
      )}

      {showCharts ? (
        <Box sx={{ py: 3 }}>
          <LineChart
            title="预算消耗率走势"
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            series={getBudgetConsumptionSeries()}
            yAxisName="消耗率(%)"
            loading={!timeSeries}
            width="800px"
            height="350px"
          />
        </Box>
      ) : null}

      <Divider />

      <Paragraph>投放单元：</Paragraph>
      <Stack sx={{ minWidth: 320 }}>
        {units.map((unit, i) => (
          <UnitPreview
            key={unit.name}
            {...unit}
            goToDetail={() => navigate(`/org/unit/${unit._id}?back=1`)}
          />
        ))}
      </Stack>

      {showCharts ? (
        <Box sx={{ pt: 3 }}>
          <PieChart
            title="投放单元曝光量分布"
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            data={getUnitImpressionsPieData()}
            loading={!timeSeries}
            width="800px"
            height="320px"
          />
        </Box>
      ) : null}
    </Stack>
  );
}

export function AdCampaignForm({
  title,
  onBack,
  initData,
  isSubmitting,
  onSubmitData,
}: {
  title: string;
  onBack?: () => void;
  initData?: AdCampaign_Client;
  isSubmitting?: boolean;
  onSubmitData?: (data: NewCampaignFormData) => void;
}) {
  const defaultValues = useMemo<NewCampaignFormData>(() => {
    if (initData) {
      return {
        name: initData.name,
        dateRange: initData.dateRange,
        timeRange: initData.timeRange,
        pricingModel: initData.pricingModel,
        budget: initData.budget,
        units: initData.units.map(({ _id }) => _id),
      };
    }
    return {
      name: '',
      dateRange: { from: '', to: '' },
      timeRange: null,
      pricingModel: 'cpm',
      budget: 0,
      units: [],
    };
  }, [initData]);

  const { control, handleSubmit, setValue, getValues } =
    useForm<NewCampaignFormData>({ defaultValues });
  const [previewData, setPreviewData] = useState<AdUnit_Client[]>(
    initData?.units || []
  );

  const onSubmit = handleSubmit((data) => {
    onSubmitData?.(data);
  });

  return (
    <>
      <GoBack onClick={onBack} />
      <Typography variant="h4">{title}</Typography>
      <Divider sx={{ my: 3 }} />
      <Stack
        component="form"
        spacing={2}
        sx={{ width: 1, maxWidth: 540 }}
        onSubmit={onSubmit}
      >
        <RHFTextField
          control={control}
          name="name"
          variant="outlined"
          type="text"
          label="计划名称"
          required
          autoComplete="off"
        />
        <RHFSelect
          control={control}
          name="pricingModel"
          labelId="pricing-select-label"
          labelText="选择计费方式"
          items={pricingModelNames}
          required
        />
        <RHFTextField
          control={control}
          name="budget"
          variant="outlined"
          type="number"
          label="预算（RMB）"
          required
          autoComplete="off"
          inputProps={{ min: 0 }}
        />
        <Divider />
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{}}>投放单元</Typography>
            <Typography variant="subtitle2" color="gray">
              （需要到资源列表单独创建）
            </Typography>
          </Stack>
          <Stack>
            {previewData.map((unit, i) => (
              <UnitPreview
                key={unit.name}
                {...unit}
                onDelete={() => {
                  const unitsId = getValues('units');
                  unitsId.splice(i, 1);
                  setValue('units', [...unitsId]);
                  setPreviewData((prev) => {
                    prev.splice(i, 1);
                    return [...prev];
                  });
                }}
              />
            ))}
          </Stack>
        </Box>
        <Divider />
        <Box>
          <Typography sx={{ mb: 2 }}>选择投放日期范围</Typography>
          <Controller
            control={control}
            name="dateRange"
            render={({ field: { value, onChange } }) => (
              <DateRangePicker range={value} setRange={onChange} />
            )}
          />
        </Box>
        <Divider />
        <Controller
          control={control}
          name="timeRange"
          render={({ field: { value, onChange } }) => (
            <Box>
              <RadioGroupControl
                row
                name="selectTimeRange"
                value={!!value}
                labels={{ true: '是', false: '否' }}
                text="选择是否要分时投放"
                onChange={(_, val) => {
                  if (val === 'true') {
                    onChange([]);
                  } else {
                    onChange(null);
                  }
                }}
              />
              {!!value && (
                <SelectableTimeTable
                  timeRange={value}
                  setTimeRange={onChange}
                />
              )}
            </Box>
          )}
        />
        <Divider />
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          提交
        </Button>
        <Typography align="center">
          {isSubmitting ? <CircularProgress /> : null}
        </Typography>
      </Stack>
    </>
  );
}

function UnitPreview({
  name,
  ages,
  gender,
  locations,
  features,
  active,
  goToDetail,
  onDelete,
}: AdUnit_Client & {
  goToDetail?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Stack
      direction="row"
      sx={({ palette }) => ({
        position: 'relative',
        justifyContent: 'space-between',
        borderLeft: `4px solid ${palette.primary.main}`,
        pl: 1,
        maxWidth: 500,
      })}
    >
      <Box>
        <Typography fontWeight="bold">{name}</Typography>
        <Typography>{`目标性别：${gender == 'male' ? '男' : '女'}`}</Typography>
        <Typography>{`年龄范围：${ages.from}-${ages.to}`}</Typography>
      </Box>
      <Box>
        <Typography>{`地域范围：${
          locations.length
            ? locations
                .slice(0, 2)
                .map(({ province, city }) => `${province} ${city}`)
                .join('，')
            : '待填写'
        }${locations.length > 2 ? '...' : ''}`}</Typography>
        <Typography>{`人群特征：${
          features.length ? features.slice(0, 2).join('，') : '待填写'
        }${features.length > 2 ? '...' : ''}`}</Typography>
        <Typography>{`投放状态：${
          active ? '已开始投放' : '未开始投放'
        }`}</Typography>
      </Box>
      {goToDetail ? (
        <IconButton
          size="medium"
          color="primary"
          sx={{ position: 'absolute', right: -50, top: 16 }}
          onClick={goToDetail}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      ) : onDelete ? (
        <IconButton
          size="medium"
          color="error"
          sx={{ position: 'absolute', right: -50, top: 16 }}
          onClick={onDelete}
        >
          <DeleteIcon />
        </IconButton>
      ) : null}
    </Stack>
  );
}
