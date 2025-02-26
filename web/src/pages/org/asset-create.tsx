import { FakeAttachment, FakeFileInput } from '@/components/Attachment';
import { GoBack } from '@/components/UI';
import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { type Attachment } from '@shared/asset';
import { useState, type FormEventHandler } from 'react';
import { useNavigate, type RouteObject } from 'react-router-dom';

export const createAssetRoute: RouteObject = {
  path: 'create-asset',
  element: <Page />,
};

function Page() {
  return (
    <>
      <GoBack />
      <Typography variant="h4">上传物料资源</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <Form />
      </Box>
    </>
  );
}

function Form() {
  const navigate = useNavigate();
  const [attachment, setAttachment] = useState<Attachment>();
  const { mutate, isPending } = useCustomMutation((data: Attachment) =>
    privateApi.post('/api/ads/asset/create', data).then(() => void 0)
  );
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!attachment) return;
    mutate(attachment, { onSuccess: () => navigate(-1) });
  };

  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ width: 1, maxWidth: 500 }}
      onSubmit={handleSubmit}
    >
      <Alert severity="info">一件物料只能上传一个附件</Alert>
      {attachment ? (
        <FakeAttachment
          key={attachment.name}
          {...attachment}
          onDelete={isPending ? undefined : () => setAttachment(undefined)}
        />
      ) : (
        <FakeFileInput
          filter={['text', 'image', 'video']}
          onAdd={(a) => setAttachment(a)}
        />
      )}
      <Divider />
      <Button variant="contained" type="submit" disabled={isPending}>
        上传
      </Button>
      <Typography align="center">
        {isPending ? <CircularProgress /> : null}
      </Typography>
    </Stack>
  );
}
