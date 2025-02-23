import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { type Attachment } from '@shared/asset';
import { useState } from 'react';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { GoBack } from '@/components/UI';
import { templatesData, templatesName } from '@/components/Templates';
import type { NewCreationFormData } from '@shared/creation';
import { useForm } from 'react-hook-form';
import { RHFSelect, RHFTextField } from '@/components/RHFInputs';
import { setPopupError } from '@/utils/error';
import { CreationAssetEdit } from '@/components/CreationAsset';
import { pricingModelNames } from '@/utils/translate';

export const createCampaignRoute: RouteObject = {
  path: 'create-campaign',
  element: <Page />,
};

function Page() {
  return (
    <>
      <GoBack />
      <Typography variant="h4">创建新的广告投放计划</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <Form />
      </Box>
    </>
  );
}

function Form() {
  const navigate = useNavigate();

  const { control, handleSubmit, setValue, getValues, watch } =
    useForm<NewCreationFormData>({
      defaultValues: { name: '', template: '', assets: {} },
    });
  const templateData = templatesData[watch('template')];
  const Preview = templateData?.component;
  const [previewData, setPreviewData] = useState<
    Partial<Record<string, Attachment>>
  >({});

  const { mutate, isPending } = useCustomMutation((data: NewCreationFormData) =>
    privateApi.post('/api/ads/creation/create', data).then(() => void 0)
  );
  const onSubmit = handleSubmit((data) => {});

  return (
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
        label="创意名称"
        required
        autoComplete="off"
      />
      <RHFSelect
        control={control}
        name="template"
        labelId="pricing-select-label"
        labelText="选择计费方式"
        items={pricingModelNames}
        required
        onChange={() => {
          setValue('assets', {});
          setPreviewData({});
        }}
      />
      <Divider />
      {templateData &&
        Object.entries(templateData.assets).map(([key, data]) => (
          <CreationAssetEdit
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
      <Button variant="contained" type="submit" disabled={isPending}>
        提交
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
