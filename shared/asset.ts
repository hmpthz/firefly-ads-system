import type { Organization_Client } from './org';

export type AttachmentType = 'text' | 'image' | 'video' | 'doc';
export interface Attachment<T extends AttachmentType = AttachmentType> {
  name: string;
  /** 简单起见，不用真正处理文件内容，显示个假的就行 */
  contentType: T;
  content: string;
}

export type TicketState = 'pending' | 'in-progress' | 'approved' | 'declined';
export interface Ticket {
  state: TicketState;
}

/** 物料工单 */
type AssetTicket = Ticket & Attachment<Exclude<AttachmentType, 'doc'>>;
export type AssetTicket_Client = AssetTicket &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
  };
export type AssetTicket_Server = AssetTicket & Timestamp_Server;

export type UpdateTicketFormData = Pick<Ticket, 'state'>;
export type UpdateAssetFormData = Partial<AssetTicket>;
