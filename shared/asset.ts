import type { OrganizationProfile } from './org';

export interface Timestamp_Client {
  createdAt: string;
  updatedAt: string;
}
export interface Timestamp_Server {
  createdAt: Date;
  updatedAt: Date;
}

export type AttachmentType = 'text' | 'image' | 'video' | 'doc';
export interface Attachment<T extends AttachmentType = AttachmentType> {
  name: string;
  /** 简单起见，不用真正处理文件内容，显示个假的就行 */
  contentType: T;
}

export type TicketState = 'pending' | 'in-progress' | 'approved' | 'declined';
export interface Ticket {
  id: string;
  state: TicketState;
}

/** 物料工单 */
type AssetTicket = Ticket & Attachment<Exclude<AttachmentType, 'doc'>>;
export interface AssetTicket_Client extends AssetTicket, Timestamp_Client {
  org: Pick<OrganizationProfile, 'id' | 'name'>;
}
export type AssetTicket_Server = AssetTicket & Timestamp_Server;
