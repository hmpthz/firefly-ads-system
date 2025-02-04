import type {
  CredentialTicket_Server,
  Organization_Server,
} from '@shared/org.js';
import mongoose from 'mongoose';
import { attachmentSchemaDef } from './asset.model.js';

export interface Organization extends Organization_Server {
  credential?: mongoose.Types.ObjectId;
  credentialTickets: mongoose.Types.ObjectId[];
}
export interface Organization_Populated {
  credential?: CredentialTicket;
  credentialTickets: CredentialTicket[];
}

export interface CredentialTicket extends CredentialTicket_Server {
  org: mongoose.Types.ObjectId;
}
export interface CredentialTicket_Populated {
  org: Organization_Server;
}

const organizationSchema = new mongoose.Schema<Organization>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  credential: { type: mongoose.Types.ObjectId, ref: 'CredentialTicket' },
  credentialTickets: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'CredentialTicket' }],
    default: [],
  },
});
organizationSchema.index({ name: 1 }, { unique: true });
export const organizationModel = mongoose.model<Organization>(
  'Organization',
  organizationSchema
);
export type OrganizationDoc = ConstructorReturnType<typeof organizationModel>;

const credentialTicketSchema = new mongoose.Schema<CredentialTicket>(
  {
    state: {
      type: String,
      required: true,
    },
    attachments: [attachmentSchemaDef],
    // @ts-ignore
    org: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true }
);
export const credentialTicketModel = mongoose.model<CredentialTicket>(
  'CredentialTicket',
  credentialTicketSchema
);
export type CredentialTicketDoc = ConstructorReturnType<
  typeof credentialTicketModel
>;
