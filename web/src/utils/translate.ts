import type { AttachmentType, TicketState } from '@shared/asset';
import type { PricingModel } from '@shared/campaign';

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

export const pricingModelNames: Record<string, PricingModel> = {
  '每次点击成本（CPC）': 'cpc',
  '每千人成本（CPM）': 'cpm',
  '每时间段成本（CPT）': 'cpt',
};
const pricingModelMap = Object.fromEntries(
  Object.entries(pricingModelNames).map(([k, v]) => [v, k])
) as Record<PricingModel, string>;

export function tPricingModel(model: PricingModel) {
  return pricingModelMap[model];
}
