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

export function AdCreationDetail({
  name,
  state,
  template,
  assets,
  createdAt,
  active,
}: AdCreationTicket_Client) {
  const templateData = templatesData[template];
  const Preview = templateData.component;

  return (
    <Stack spacing={2} sx={{ width: 1, maxWidth: 520, mb: 4 }}>
      <Paragraph>创意名称：{name}</Paragraph>
      <Paragraph>创建时间：{createdAt}</Paragraph>
      <Paragraph>审核状态：{tTicketState(state)}</Paragraph>
      <Paragraph>投放状态：{active ? '已开始投放' : '未开始投放'}</Paragraph>
      <Paragraph>创意模板：{templateData.name}</Paragraph>
      <Paragraph>刊例价：{templateData.price} 元</Paragraph>
      <Divider />
      {Object.entries(templateData.assets).map(([key, data]) => (
        <PreviewEdit key={key} {...data} preview={assets[key]} />
      ))}
      <Divider />
      <Preview {...assets} />
      <Divider />
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
