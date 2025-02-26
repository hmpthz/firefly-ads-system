import type { AssetTicket_Client, Attachment } from '@shared/asset';
import type { TemplateAsset } from './Templates';
import { useState } from 'react';
import { useCustomMutation } from '@/hooks/useCustomQuery';
import { privateApi } from '@/utils/axios';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { FakeAttachment, FakeFileInput } from './Attachment';
import { RadioGroupControl } from './Inputs';

export function CreationAssetEdit({
  name,
  type,
  preview,
  onAdd,
  onDelete,
}: TemplateAsset & {
  preview?: Attachment;
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
        sx={(theme) => ({
          pl: '10px',
          borderLeft: `2px solid ${theme.palette.primary.main}`,
          borderTop: `2px solid ${theme.palette.primary.main}`,
        })}
      >
        <Typography variant="h6">{name}</Typography>
        {preview ? (
          <FakeAttachment {...preview} onDelete={onDelete} />
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
