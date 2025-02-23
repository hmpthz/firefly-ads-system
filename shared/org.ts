import type { Attachment, AttachmentType, Ticket } from './asset';
import type { User_Server } from './user';

export interface OrganizationProfile {
  name: string;
  description: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
}
export type Organization_Client = OrganizationProfile &
  Timestamp_Client &
  _Id & {
    /** 当前（最新）的资质工单 */
    credential?: CredentialTicket_Client;
  };
export type Organization_Server = OrganizationProfile & Timestamp_Server;

interface CredentialTicket extends Ticket {
  attachments: Attachment<Exclude<AttachmentType, 'video'>>[];
}
export type CredentialTicket_Client = CredentialTicket &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
  };
export type CredentialTicket_Server = CredentialTicket & Timestamp_Server;

export type NewOrgFormData = OrganizationProfile & Pick<User_Server, 'role'>;

export type UpdateOrgFormData = Partial<OrganizationProfile>;
