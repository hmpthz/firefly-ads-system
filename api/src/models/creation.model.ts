import type { AdCreationTicket_Server } from '@shared/creation.js';
import mongoose, { Schema } from 'mongoose';
import type { OrganizationDoc } from './org.model.js';
import type { AssetTicketDoc } from './asset.model.js';

export interface AdCreationTicket extends AdCreationTicket_Server {
  org: mongoose.Types.ObjectId;
  assets: mongoose.Types.Map<mongoose.Types.ObjectId>;
}
export interface AdCreationTicket_Populated {
  org: OrganizationDoc;
  assets: mongoose.Types.Map<AssetTicketDoc>;
}

const adCreationTicketSchema = new mongoose.Schema<AdCreationTicket>(
  {
    state: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    // @ts-expect-error
    org: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
    assets: {
      type: Schema.Types.Map,
      of: { type: mongoose.Types.ObjectId, ref: 'AssetTicket' },
    },
  },
  { timestamps: true }
);
export const adCreationTicketModel = mongoose.model<AdCreationTicket>(
  'AdCreationTicket',
  adCreationTicketSchema
);
export type adCreationTicketDoc = ConstructorReturnType<
  typeof adCreationTicketModel
>;
