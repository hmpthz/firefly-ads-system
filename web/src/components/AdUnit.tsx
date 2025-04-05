import { useCustomQuery } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
  styled,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { GoBack } from '@/components/UI';
import { templatesData } from '@/components/Templates';
import type { AdCreationTicket_Client } from '@shared/creation';
import { RadioGroupControl, RHFTextField } from '@/components/Inputs';
import type { AdUnit_Client, NewUnitFormData } from '@shared/campaign';
import {
  cities as citiesData,
  features as featureOptions,
} from '@/assets/demoData';
import { useStoreSlice } from '@/store';
import {
  useUnitCreationsTimeSeries,
  unitCreationsTimeDataToXML,
  downloadXML,
} from '@/hooks/useTimeSeries';
import {
  ChartsControl,
  getColorByIndex,
  LineChart,
  PieChart,
} from './ChartComponents';
import type { TimeScale } from '@/store/timeSeriesSlice';

export function AdUnitsList() {
  const navigate = useNavigate();
  const orgId = useStoreSlice('user').profile!.orgId!;
  const { data, isLoading } = useCustomQuery(['units', orgId], () =>
    privateApi
      .get<AdUnit_Client[]>(`/api/ads/unit/list?orgId=${orgId}`)
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
            <TableCell>人群特征</TableCell>
            <TableCell>预期曝光量</TableCell>
            <TableCell>投放状态</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item) => (
            <ItemRow
              key={item._id}
              {...item}
              handleClick={() => navigate(`/org/unit/${item._id}`)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ItemRow({
  createdAt,
  name,
  features,
  expectedImpressions,
  active,
  handleClick,
}: AdUnit_Client & { handleClick: () => void }) {
  return (
    <TableRow>
      <TableCell>{createdAt.split('T')[0]}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>
        {features.slice(0, 3).join(', ')}
        {features.length > 3 ? '...' : null}
      </TableCell>
      <TableCell>{expectedImpressions?.toLocaleString()}</TableCell>
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

export function AdUnitDetail(data: AdUnit_Client) {
  const {
    name,
    createdAt,
    active,
    gender,
    locations,
    ages,
    features,
    expectedImpressions,
    creations,
  } = data;
  const navigate = useNavigate();

  // 添加时间尺度选择状态
  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  // 添加图表显示控制
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // 获取时间序列数据
  const timeSeries = useUnitCreationsTimeSeries(data, timeScale);

  // 准备完成率折线图数据
  const getCompletionRateSeries = () => {
    if (!timeSeries || !timeSeries.unit) {
      return [];
    }

    return [
      {
        name: '曝光完成率',
        data: timeSeries.unit.map((item) => ({
          time: item.time,
          value: item.completionRate,
        })),
        color: '#4caf50',
      },
    ];
  };

  // 准备创意曝光量饼图数据
  const getCreationImpressionsPieData = () => {
    if (!timeSeries || !timeSeries.creations) {
      return [];
    }

    return timeSeries.creations.map((creationData, index) => {
      if (!creationData || creationData.length === 0) {
        return {
          name: creations[index]?.name || `创意 ${index + 1}`,
          value: 0,
        };
      }

      // 使用第一个时间点的数据
      return {
        name: creations[index]?.name || `创意 ${index + 1}`,
        value: creationData[0]?.impressions || 0,
        color: getColorByIndex(index),
      };
    });
  };

  // 处理XML数据下载
  const handleDownloadXML = () => {
    if (!timeSeries) return;

    const creationNames = creations.map((creation) => creation.name);
    const xmlContent = unitCreationsTimeDataToXML(
      name,
      timeSeries.unit,
      timeSeries.creations,
      creationNames
    );

    const fileName = `unit_${name}_${timeScale}_${new Date()
      .toISOString()
      .slice(0, 10)}.xml`;
    downloadXML(xmlContent, fileName);
  };

  return (
    <Stack spacing={3} sx={{ width: 1, maxWidth: 520, mb: 4 }}>
      <ChartsControl
        show={showCharts}
        setShow={setShowCharts}
        onDownload={handleDownloadXML}
        loading={!timeSeries}
      />

      <Paragraph>单元名称：{name}</Paragraph>
      <Paragraph>创建时间：{createdAt}</Paragraph>
      <Paragraph>投放状态：{active ? '已开始投放' : '未开始投放'}</Paragraph>
      <Paragraph>目标性别：{gender == 'male' ? '男' : '女'}</Paragraph>
      <Paragraph>
        年龄范围：{ages.from} - {ages.to}
      </Paragraph>
      <Paragraph>预期曝光量：{expectedImpressions?.toLocaleString()}</Paragraph>

      <Paragraph>地域范围：</Paragraph>
      <Box
        sx={{
          p: '0px 0px 0px 8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 1,
        }}
      >
        {locations.map(({ province, city }, i) => (
          <Typography
            key={i}
            sx={({ palette }) => ({
              position: 'relative',
              borderLeft: `4px solid ${palette.primary.main}`,
              pl: 1,
              pr: 4,
              bgcolor: 'rgba(0,0,255,0.05)',
            })}
          >
            {`${province} ${city}`}
          </Typography>
        ))}
      </Box>

      <Paragraph>人群特征：</Paragraph>
      <Box
        sx={{
          p: '0px 0px 0px 8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 1,
        }}
      >
        {features.map((feature) => (
          <Typography
            key={feature}
            sx={({ palette }) => ({
              position: 'relative',
              borderLeft: `4px solid ${palette.primary.main}`,
              pl: 1,
              pr: 4,
              bgcolor: 'rgba(0,0,255,0.05)',
            })}
          >
            {feature}
          </Typography>
        ))}
      </Box>

      {showCharts ? (
        <Box sx={{ py: 3 }}>
          <LineChart
            title="曝光完成率走势"
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            series={getCompletionRateSeries()}
            yAxisName="完成率(%)"
            loading={!timeSeries}
            width="800px"
            height="350px"
          />
        </Box>
      ) : null}

      <Divider />

      <Paragraph>广告创意：</Paragraph>
      <Stack spacing={2}>
        {creations.map((creation) => (
          <CreationPreview
            key={creation._id}
            {...creation}
            goToDetail={() => navigate(`/org/creation/${creation._id}?back=1`)}
          />
        ))}
      </Stack>

      {showCharts ? (
        <Box sx={{ pt: 3 }}>
          <PieChart
            title="广告创意曝光量分布"
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            data={getCreationImpressionsPieData()}
            loading={!timeSeries}
            width="800px"
            height="320px"
          />
        </Box>
      ) : null}
    </Stack>
  );
}

export function AdUnitForm({
  title,
  onBack,
  initData,
  isSubmitting,
  onSubmitData,
}: {
  title: string;
  onBack?: () => void;
  initData?: AdUnit_Client;
  isSubmitting?: boolean;
  onSubmitData?: (data: NewUnitFormData) => void;
}) {
  const defaultValues = useMemo<NewUnitFormData>(() => {
    if (initData) {
      return {
        name: initData.name,
        gender: initData.gender,
        ages: initData.ages,
        locations: initData.locations,
        features: initData.features,
        expectedImpressions: initData.expectedImpressions,
        creations: initData.creations.map(({ _id }) => _id),
      };
    }
    return {
      campaignName: '',
      name: '',
      gender: 'male',
      ages: { from: 1, to: 100 },
      locations: [],
      features: [],
      expectedImpressions: 0,
      creations: [],
    };
  }, [initData]);

  const { control, handleSubmit, setValue, getValues } =
    useForm<NewUnitFormData>({ defaultValues });
  const [previewData, setPreviewData] = useState<AdCreationTicket_Client[]>(
    initData?.creations || []
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
        sx={{ width: 1, maxWidth: 520 }}
        onSubmit={onSubmit}
      >
        {!initData && (
          <RHFTextField
            control={control}
            name="campaignName"
            variant="outlined"
            type="text"
            label="绑定广告投放计划的名称"
            required
            autoComplete="off"
          />
        )}
        <RHFTextField
          control={control}
          name="name"
          variant="outlined"
          type="text"
          label="单元名称"
          required
          autoComplete="off"
        />
        <RHFTextField
          control={control}
          name="expectedImpressions"
          variant="outlined"
          type="number"
          label="预期曝光量"
          required
          autoComplete="off"
        />
        <Box>
          <Typography sx={{}}>目标性别</Typography>
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <RadioGroupControl
                row
                name="gender"
                value={value}
                labels={{ male: '男', female: '女' }}
                onChange={(_, val) => onChange(val)}
              />
            )}
          />{' '}
        </Box>
        <Box>
          <Typography sx={{}}>年龄范围</Typography>
          <Controller
            control={control}
            name="ages"
            render={({ field: { value, onChange } }) => (
              <Slider
                value={[value.from, value.to]}
                onChange={(_, val) =>
                  onChange(
                    Array.isArray(val)
                      ? { from: val[0], to: val[1] }
                      : { from: val, to: val }
                  )
                }
                valueLabelDisplay="auto"
              />
            )}
          />{' '}
        </Box>
        <Divider />
        <Box>
          <Typography sx={{ mb: 1 }}>地域范围</Typography>
          <Controller
            control={control}
            name="locations"
            render={({ field: { value, onChange } }) => (
              <>
                <ProvinceCitySelect
                  onAdd={(data) => onChange([...value, data])}
                />
                <Stack
                  spacing={1}
                  sx={{ p: '8px 8px 0 8px', alignItems: 'flex-start' }}
                >
                  {value.map(({ province, city }, i) => (
                    <Typography
                      key={i}
                      sx={({ palette }) => ({
                        position: 'relative',
                        borderLeft: `4px solid ${palette.primary.main}`,
                        pl: 1,
                        pr: 4,
                        minWidth: 200,
                      })}
                    >
                      {`${province} ${city}`}
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ position: 'absolute', right: 0, top: -5 }}
                        onClick={() => {
                          value.splice(i, 1);
                          onChange([...value]);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Typography>
                  ))}
                </Stack>
              </>
            )}
          />
        </Box>
        <Divider />
        <Box>
          <Controller
            control={control}
            name="features"
            render={({ field: { value, onChange } }) => (
              <FeatureMultiSelect features={value} setFeatures={onChange} />
            )}
          />
        </Box>
        <Divider />
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{}}>广告创意</Typography>
            <Typography variant="subtitle2" color="gray">
              （需要到资源列表单独创建）
            </Typography>
          </Stack>
          <Stack spacing={2} sx={{ pt: 2, pl: 2 }}>
            {previewData.map((item, i) => (
              <CreationPreview
                key={item._id}
                {...item}
                onDelete={() => {
                  const creationsId = getValues('creations');
                  creationsId.splice(i, 1);
                  setValue('creations', [...creationsId]);
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

function CreationPreview({
  name,
  template,
  goToDetail,
  onDelete,
}: AdCreationTicket_Client & {
  goToDetail?: () => void;
  onDelete?: () => void;
}) {
  const { name: templateName, exampleImage } = templatesData[template];

  return (
    <Stack
      direction="row"
      sx={({ palette }) => ({
        position: 'relative',
        justifyContent: 'space-between',
        borderLeft: `4px solid ${palette.primary.main}`,
        pl: 1,
      })}
    >
      <Box>
        <Typography fontWeight="bold">{name}</Typography>
        <Typography>{templateName}</Typography>
      </Box>
      <Box
        component="img"
        src={exampleImage}
        alt="example-template"
        height={80}
      />
      {goToDetail ? (
        <IconButton
          size="medium"
          color="primary"
          sx={{ position: 'absolute', right: -40, top: 20 }}
          onClick={goToDetail}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      ) : onDelete ? (
        <IconButton
          size="medium"
          color="error"
          sx={{ position: 'absolute', right: -40, top: 20 }}
          onClick={onDelete}
        >
          <DeleteIcon />
        </IconButton>
      ) : null}
    </Stack>
  );
}

function ProvinceCitySelect({
  onAdd,
}: {
  onAdd: (location: AdUnit_Client['locations'][number]) => void;
}) {
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  // 从 cities.ts 导入省份列表
  const provinces = useMemo(() => Object.keys(citiesData), []);
  const cities = useMemo(() => citiesData[province] ?? [], [province]);

  // 处理添加按钮点击
  const handleAdd = () => {
    if (province) {
      onAdd({ province, city });
      // 添加后重置表单
      setProvince('');
      setCity('');
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="province-select-label">省份</InputLabel>
        <Select
          labelId="province-select-label"
          id="province-select"
          value={province}
          label="省份"
          onChange={(e) => {
            setProvince(e.target.value);
            setCity('');
          }}
        >
          {provinces.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="city-select-label">城市</InputLabel>
        <Select
          labelId="city-select-label"
          id="city-select"
          value={city}
          label="城市"
          onChange={(e) => {
            setCity(e.target.value);
          }}
          disabled={!province}
        >
          {cities.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        onClick={handleAdd}
        disabled={!province}
        startIcon={<AddIcon />}
      >
        添加
      </Button>
    </Stack>
  );
}

function FeatureMultiSelect({
  features,
  setFeatures,
}: {
  features: string[];
  setFeatures: (features: string[]) => void;
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id="features-select-label">人群特征</InputLabel>
      <Select
        labelId="features-select-label"
        id="features-select"
        multiple
        value={features}
        onChange={(e) => setFeatures(e.target.value as string[])}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((feature) => (
              <Box
                key={feature}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                }}
              >
                {feature}
              </Box>
            ))}
          </Box>
        )}
      >
        {Object.entries(featureOptions)
          .map(([category, options]) => [
            <MenuItem
              key={category}
              disabled
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                bgcolor: 'action.hover',
              }}
            >
              {category}
            </MenuItem>,
            ...options.map((option) => (
              <MenuItem key={option} value={option} sx={{ pl: 4 }}>
                {option}
              </MenuItem>
            )),
          ])
          .flat()}
      </Select>
    </FormControl>
  );
}
