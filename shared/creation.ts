import type {
  AssetTicket_Client,
  Attachment,
  Ticket,
  UpdateTicketFormData,
} from './asset';
import type { Organization_Client } from './org';

interface AdCreationTicket extends Ticket {
  name: string;
  template: string;
}

export type AdCreationTicket_Client = AdCreationTicket &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
    assets: Record<string, AssetTicket_Client>;
  };
export type AdCreationTicket_Server = AdCreationTicket & Timestamp_Server;

export type NewCreationFormData = Omit<AdCreationTicket, 'state'> & {
  /** 已有物料Id或是新的物料 */
  assets: Record<string, string | Attachment>;
};

export type UpdateCreationFormData = Partial<
  Omit<AdCreationTicket, 'state'>
> & {
  /** 更换后的物料Id或是更改原物料信息 */
  assets: Record<string, string | Partial<Attachment>>;
};
export type UpdateCreationTicketFormData = Partial<UpdateTicketFormData> & {
  /**  批量更改广告创意和物料的审核状态 */
  assets: Record<string, UpdateTicketFormData['state']>;
};
