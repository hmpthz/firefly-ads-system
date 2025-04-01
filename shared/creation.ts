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
  /** 投放状态 */
  active?: boolean;
}

export type AdCreationTicket_Client = AdCreationTicket &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
    assets: Record<string, AssetTicket_Client>;
  };
export type AdCreationTicket_Server = AdCreationTicket & Timestamp_Server;

export type NewCreationFormData = Omit<AdCreationTicket, 'state'> & {
  /** 绑定的广告投放单元名称 */
  unitName?: string;
  /** 已有物料Id或是新的物料 */
  assets: Record<string, string | Attachment>;
};

export type UpdateCreationTicketFormData = Partial<UpdateTicketFormData> & {
  /**  批量更改广告创意和物料的审核状态 */
  assets: Record<string, UpdateTicketFormData['state']>;
};
