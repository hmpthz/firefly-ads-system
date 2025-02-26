import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Attachment, AttachmentType } from '@shared/asset';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ImageIcon from '@mui/icons-material/Image';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import TheatersIcon from '@mui/icons-material/Theaters';
import PlayCircleIcon from '@mui/icons-material/PlayCircleFilledTwoTone';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMemo, useState, type JSX } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { RadioGroupControl } from './Inputs';
import { contentTypes } from '@/utils/translate';

export function FakeAttachment({
  name,
  content,
  contentType,
  onDelete,
}: Attachment & { onDelete?: () => void }) {
  const rand = useMemo(() => randInt(5, 1), []);

  let Icon: SvgIconComponent;
  let Display: JSX.Element;
  if (contentType == 'doc') {
    Icon = AttachFileIcon;
    Display = (
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 40 }} />
      </Box>
    );
  } else if (contentType == 'image') {
    Icon = ImageIcon;
    Display = (
      <Box sx={{ textAlign: 'center' }}>
        <Box
          component="img"
          alt="placeholder"
          src={`/placeholder-${rand}.jpg`}
          width={200}
        />
      </Box>
    );
  } else if (contentType == 'video') {
    Icon = TheatersIcon;
    Display = (
      <Box sx={{ textAlign: 'center', position: 'relative' }}>
        <Box
          component="img"
          alt="placeholder"
          src={`/placeholder-${rand}.jpg`}
          width={200}
        />
        <PlayCircleIcon
          sx={{
            fontSize: 60,
            position: 'absolute',
            zIndex: 1,
            left: '112px',
            top: '60px',
          }}
        />
      </Box>
    );
  } else {
    Icon = EditNoteIcon;
    Display = <Typography variant="body2">{content}</Typography>;
  }

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 300,
          p: 1,
          border: 1,
          borderRadius: 2,
          borderColor: 'grey.500',
        }}
      >
        <Typography fontWeight="bold">
          <Icon sx={{ verticalAlign: 'bottom', mr: 1 }} />
          {name}
        </Typography>
        {Display}
      </Box>
      {onDelete && (
        <IconButton size="large" color="error" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  );
}

export function FakeFileInput({
  filter,
  onAdd,
}: {
  filter?: AttachmentType[];
  onAdd: (a: Attachment) => void;
}) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<AttachmentType>(
    filter ? filter[0] : 'text'
  );
  const handleAdd = () => {
    if (name && content) {
      onAdd({ name, content, contentType });
      setName('');
      setContent('');
    }
  };

  return (
    <Stack gap={1}>
      <TextField
        variant="outlined"
        type="text"
        label="附件名称"
        autoComplete="off"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        variant="outlined"
        type="text"
        label="物料内容"
        placeholder="文字，或文件URL等......"
        autoComplete="off"
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <RadioGroupControl
          row
          name="contentType"
          sx={{ gap: 0 }}
          value={contentType}
          onChange={(_, val) => setContentType(val as AttachmentType)}
          labels={
            filter
              ? contentTypes.filter(([type]) => filter.includes(type))
              : contentTypes
          }
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
          添加
        </Button>
      </Stack>
    </Stack>
  );
}

export const randInt = (max: number, min = 0) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const placeholderText =
  'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam aperiam illum laborum vero sint dolorum dolor magnam';
