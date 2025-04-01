import { FakeAttachment, FakeFileInput } from '@/components/Attachment';
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
import { GoBack } from '@/components/UI';

export const credentialCreateRoute: RouteObject = {
  path: 'create-credential',
  element: <Page />,
};

function Page() {
  return (
    <>
      <GoBack />
      <Typography variant="h4">上传机构资质文件</Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{}}>
        <Form />
      </Box>
    </>
  );
}

function Form() {
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { mutate, isPending } = useCustomMutation((data: Attachment[]) =>
    privateApi.post('/api/org/credential/create', data).then(() => void 0)
  );
  const deleteItem = (i: number) => {
    attachments.splice(i, 1);
    setAttachments([...attachments]);
  };
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (attachments.length == 0) return;
    mutate(attachments, { onSuccess: () => navigate(-1) });
  };

  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ width: 1, maxWidth: 500 }}
      onSubmit={handleSubmit}
    >
      <Alert severity="info">可以上传多个附件</Alert>
      {attachments.map((a, i) => (
        <FakeAttachment
          key={a.name}
          {...a}
          onDelete={isPending ? undefined : () => deleteItem(i)}
        />
      ))}
      {attachments.length > 0 && <Divider />}
      <FakeFileInput
        filter={['text', 'doc', 'image']}
        onAdd={(a) => setAttachments((prev) => [...prev, a])}
      />
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
