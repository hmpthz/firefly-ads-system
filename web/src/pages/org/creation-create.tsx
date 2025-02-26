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
import type {
  AdCreationTicket_Client,
  NewCreationFormData,
} from '@shared/creation';
import { useForm } from 'react-hook-form';
import { RHFSelect, RHFTextField } from '@/components/Inputs';
import { setPopupError } from '@/utils/error';
import { CreationAssetEdit } from '@/components/CreationAsset';

export const createCreationRoute: RouteObject = {
  path: 'create-creation',
  element: <CreateCreationPage />,
};

export function CreateCreationPage({
  onBack,
  onCreated,
}: {
  onBack?: () => void;
  onCreated?: (data: AdCreationTicket_Client) => void;
}) {
  return (
    <>
      <GoBack onClick={onBack} />
      <Typography variant="h4">创建新的广告创意</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <Form onCreated={onCreated} />
      </Box>
    </>
  );
}

function Form({
  onCreated,
}: {
  onCreated?: (data: AdCreationTicket_Client) => void;
}) {
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
    privateApi
      .post<AdCreationTicket_Client>('/api/ads/creation/create', data)
      .then((res) => res.data)
  );
  const onSubmit = handleSubmit((data) => {
    if (!templateData) {
      return;
    }
    const assetsId = getValues('assets');
    if (!Object.keys(templateData.assets).every((key) => assetsId[key])) {
      setPopupError('没有完成物料的填写！');
    }
    mutate(data, {
      onSuccess: onCreated ? (data) => onCreated(data) : () => navigate(-1),
    });
  });

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
