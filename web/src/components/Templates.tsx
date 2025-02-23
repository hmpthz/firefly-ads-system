import { Box, Typography } from '@mui/material';
import type { Attachment } from '@shared/asset';
import type React from 'react';

type TemplateProps = Partial<Record<string, Attachment>>;
export type TemplateAsset = { name: string; type: 'text' | 'image' };

export type TemplateData = {
  name: string;
  exampleImage: string;
  assets: Record<string, TemplateAsset>;
  component: React.FC<TemplateProps>;
};

export const templatesData: Record<string, TemplateData> = {
  'horizontal-1': {
    name: '横板1（800x320）',
    exampleImage: '/templates/blue-800x320-example.jpg',
    assets: {
      bg: { name: '背景图片', type: 'image' },
      title: { name: '标题', type: 'text' },
      subtitle: { name: '副标题', type: 'text' },
    },
    component: Horizontal_1,
  },
  'vertical-1': {
    name: '竖版1（533x800）',
    exampleImage: '/templates/red-533x800-example.jpg',
    assets: {
      bg: { name: '背景图片', type: 'image' },
      center: { name: '中间图片', type: 'image' },
      title: { name: '标题', type: 'text' },
      hint: { name: '描述', type: 'text' },
    },
    component: Vertical_1,
  },
};
export const templatesName = Object.fromEntries(
  Object.entries(templatesData).map(([key, { name }]) => [name, key])
);

export function Horizontal_1({ bg, title, subtitle }: TemplateProps) {
  return (
    <Box sx={{ position: 'relative', width: 800, height: 320 }}>
      <Box
        component="img"
        alt="bg"
        src={'/templates/blue-800x320.jpg'}
        width={1}
        height={1}
      />
      <Typography
        sx={{
          width: 1,
          fontWeight: '500',
          fontSize: 60,
          color: '#abffe4',
          position: 'absolute',
          top: 40,
          left: 0,
          textAlign: 'center',
        }}
      >
        {title?.contentType == 'text' ? title.content : '示例标题 标题'}
      </Typography>
      <Typography
        sx={{
          width: '80%',
          fontWeight: '500',
          fontSize: 30,
          color: '#b8ffcb',
          position: 'absolute',
          top: 180,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        {subtitle?.contentType == 'text'
          ? subtitle.content
          : '示例副标题 副标题 副标题'}
      </Typography>
    </Box>
  );
}

export function Vertical_1({ bg, center, title, hint }: TemplateProps) {
  return (
    <Box sx={{ position: 'relative', width: 533, height: 800 }}>
      <Box
        component="img"
        alt="bg"
        src={'/templates/red-533x800.jpg'}
        width={1}
        height={1}
      />
      <Typography
        sx={{
          width: 1,
          fontWeight: '500',
          fontSize: 60,
          color: '#fff1b8',
          position: 'absolute',
          top: 120,
          left: 0,
          textAlign: 'center',
        }}
      >
        {title?.contentType == 'text' ? title.content : '示例标题 标题'}
      </Typography>
      <Box
        component="img"
        alt="bg"
        src={'/templates/placeholder.jpg'}
        sx={{
          width: 150,
          height: 150,
          position: 'absolute',
          borderRadius: '4px',
          top: 300,
          left: 180,
        }}
      />
      <Typography
        sx={{
          width: '80%',
          fontWeight: '500',
          fontSize: 30,
          color: '#f7ff57',
          position: 'absolute',
          top: 560,
          right: 0,
          textAlign: 'left',
        }}
      >
        {hint?.contentType == 'text'
          ? hint.content
          : '示例描述文字 描述文字 描述文字 描述文字'}
      </Typography>
    </Box>
  );
}
