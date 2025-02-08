import type { AttachmentType, TicketState } from '@shared/asset';

export function tTicketState(state: TicketState): string {
  return (
    {
      pending: '等待审核中',
      'in-progress': '审核中',
      approved: '审核通过',
      declined: '审核不通过',
    } as Record<TicketState, string>
  )[state];
}

export function tCredentialState(state?: TicketState): string {
  return state ? tTicketState(state) : '未上传资质文件';
}

export const contentTypes: [AttachmentType, string][] = [
  ['text', '文字'],
  ['doc', '文档'],
  ['image', '图片'],
  ['video', '视频'],
];
const contentTypesMap = Object.fromEntries(contentTypes);

export function tContentType(type: AttachmentType) {
  return contentTypesMap[type];
}
