import type {
  Attachment,
  AttachmentType,
  Ticket,
  Timestamp_Client,
  Timestamp_Server,
} from './asset';
import type { User_Server } from './user';

export interface OrganizationProfile {
  id: string;
  name: string;
  description: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
}
export interface Organization_Client
  extends OrganizationProfile,
    Timestamp_Client {
  /** 当前（最新）的资质工单 */
  credential?: CredentialTicket & Timestamp_Client;
}
export type Organization_Server = OrganizationProfile & Timestamp_Server;

interface CredentialTicket extends Ticket {
  attachments: Attachment<Exclude<AttachmentType, 'video'>>[];
}
export interface CredentialTicket_Client
  extends CredentialTicket,
    Timestamp_Client {
  org: Pick<OrganizationProfile, 'id' | 'name'>;
}
export type CredentialTicket_Server = CredentialTicket & Timestamp_Server;

export type CreateOrgFormData = Omit<OrganizationProfile, 'id'> &
  Pick<User_Server, 'role'>;
