import { useCustomMutation } from '@/hooks/useCustomQuery';
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
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { GoBack } from '@/components/UI';
import { templatesData } from '@/components/Templates';
import type {
  AdCreationTicket_Client,
} from '@shared/creation';
import { Controller, useForm } from 'react-hook-form';
import {
  DateRangePicker,
  RadioGroupControl,
  RHFSelect,
  RHFTextField,
} from '@/components/Inputs';
import { pricingModelNames } from '@/utils/translate';
import type {
  AdUnit_Client,
  NewCampaignFormData,
  NewUnitFormData,
} from '@shared/campaign';
import { CreateCreationPage } from './creation-create';
import {
  cities as citiesData,
  features as featureOptions,
} from '@/assets/demoData';
import { SelectableTimeTable } from '@/components/TimeTable';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const createCampaignRoute: RouteObject = {
  path: 'create-campaign',
  element: <CreateCampaignForm />,
};

function CreateCampaignForm() {
  const navigate = useNavigate();

  const [isSubForm, setIsSubForm] = useState(false);
  const { control, handleSubmit, setValue, getValues } =
    useForm<NewCampaignFormData>({
      defaultValues: {
        name: '',
        dateRange: { from: '', to: '' },
        timeRange: [],
        pricingModel: 'cpm',
        budget: 0,
        units: [],
      },
    });

  const { mutate, isPending } = useCustomMutation((data: NewCampaignFormData) =>
    privateApi.post('/api/ads/campaign/create', data).then(() => navigate(-1))
  );
  const onSubmit = handleSubmit((data) => mutate(data));

  const FormPage = () => (
    <>
      <GoBack />
      <Typography variant="h4">创建新的广告投放计划</Typography>
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
            <Typography sx={{}}>创建投放单元</Typography>
            <Button
              variant="outlined"
              type="button"
              startIcon={<AddIcon />}
              onClick={() => setIsSubForm(true)}
            >
              创建
            </Button>
          </Stack>
          <Controller
            control={control}
            name="units"
            render={({ field: { value, onChange } }) => (
              <Stack>
                {value.map((unit, i) => (
                  <UnitPreview
                    key={unit.name}
                    {...unit}
                    onDelete={() => {
                      value.splice(i, 1);
                      onChange([...value]);
                    }}
                  />
                ))}
              </Stack>
            )}
          />
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
        <Box>
          <Typography sx={{ mb: 2 }}>选择投放时间范围</Typography>
          <Controller
            control={control}
            name="timeRange"
            render={({ field: { value, onChange } }) => (
              <SelectableTimeTable
                timeRange={value}
                setTimeRange={(cb) => onChange(cb(value))}
              />
            )}
          />
        </Box>
        <Divider />
        <Button variant="contained" type="submit" disabled={isPending}>
          提交
        </Button>
        <Typography align="center">
          {isPending ? <CircularProgress /> : null}
        </Typography>
      </Stack>
    </>
  );

  return isSubForm ? (
    <CreateUnitForm
      onBack={() => setIsSubForm(false)}
      onAdd={(data) => {
        const prev = getValues('units');
        setValue('units', [...prev, data]);
        setIsSubForm(false);
      }}
    />
  ) : (
    <FormPage />
  );
}

function CreateUnitForm({
  onBack,
  onAdd,
}: {
  onBack: () => void;
  onAdd: (data: NewUnitFormData) => void;
}) {
  const [isSubForm, setIsSubForm] = useState(false);
  const { control, handleSubmit, setValue, getValues } =
    useForm<NewUnitFormData>({
      defaultValues: {
        name: '',
        gender: 'male',
        ages: { from: 1, to: 100 },
        locations: [],
        features: [],
        creations: ['67bb41ef465fe9ee4b986cb9', '67bb41ef465fe9ee4b986cb9'],
      },
    });
  const [previewData, setPreviewData] = useState<AdCreationTicket_Client[]>([]);
  const onSubmit = handleSubmit(onAdd);

  const FormPage = () => (
    <>
      <GoBack onClick={onBack} />
      <Typography variant="h4">创建新的广告投放单元</Typography>
      <Divider sx={{ my: 3 }} />
      <Stack
        component="form"
        spacing={2}
        sx={{ width: 1, maxWidth: 520 }}
        onSubmit={onSubmit}
      >
        <RHFTextField
          control={control}
          name="name"
          variant="outlined"
          type="text"
          label="单元名称"
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
          <FindOrCreateCreation
            onAdd={(data) => {
              const prev = getValues('creations');
              setValue('creations', [...prev, data._id]);
              setPreviewData((prev) => [...prev, data]);
            }}
            goToSubForm={() => setIsSubForm(true)}
          />
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
        <Button variant="contained" type="submit">
          创建
        </Button>
      </Stack>
    </>
  );

  return isSubForm ? (
    <CreateCreationPage
      onBack={() => setIsSubForm(false)}
      onCreated={(data) => {
        const prev = getValues('creations');
        setValue('creations', [...prev, data._id]);
        setPreviewData((prev) => [...prev, data]);
        setIsSubForm(false);
      }}
    />
  ) : (
    <FormPage />
  );
}

function UnitPreview({
  name,
  ages,
  gender,
  locations,
  features,
  creations,
  onDelete,
}: NewUnitFormData & {
  onDelete: () => void;
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
        <Typography>{`广告创意：${creations.length}种`}</Typography>
      </Box>
      <IconButton
        size="medium"
        color="error"
        sx={{ position: 'absolute', right: -50, top: 16 }}
        onClick={onDelete}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}

function FindOrCreateCreation({
  onAdd,
  goToSubForm,
}: {
  onAdd: (data: AdCreationTicket_Client) => void;
  goToSubForm: () => void;
}) {
  const { mutate: findCreation, isPending: isFinding } = useCustomMutation(
    (name: string) => {
      if (!name) return Promise.resolve();
      return privateApi
        .get<AdCreationTicket_Client>(
          `/api/ads/creation/find?name=${encodeURIComponent(name)}`
        )
        .then(({ data }) => {
          onAdd(data);
          setName('');
        });
    }
  );
  const [mode, setMode] = useState('find');
  const [name, setName] = useState('');

  return (
    <Stack>
      <RadioGroupControl
        row
        name="find-or-create"
        value={mode}
        labels={{ find: '搜索已有创意名称', create: '添加新创意' }}
        onChange={(_, val) => setMode(val)}
      />
      {mode == 'find' ? (
        <Stack direction="row" spacing={1}>
          <TextField
            variant="outlined"
            type="text"
            label="广告创意名称"
            autoComplete="off"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isFinding}
          />
          <Button
            variant="outlined"
            disabled={isFinding}
            onClick={() => findCreation(name)}
          >
            查找
          </Button>
        </Stack>
      ) : (
        <Button variant="outlined" onClick={goToSubForm}>
          添加
        </Button>
      )}
    </Stack>
  );
}

function CreationPreview({
  name,
  template,
  onDelete,
}: AdCreationTicket_Client & {
  onDelete: () => void;
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
      <IconButton
        size="medium"
        color="error"
        sx={{ position: 'absolute', right: -40, top: 20 }}
        onClick={onDelete}
      >
        <DeleteIcon />
      </IconButton>
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
