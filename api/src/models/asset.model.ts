import type { AssetTicket_Server } from '@shared/asset.js';
import mongoose from 'mongoose';
import type { OrganizationDoc } from './org.model.js';

export interface AssetTicket extends AssetTicket_Server {
  org: mongoose.Types.ObjectId;
}
export interface AssetTicket_Populated {
  org: OrganizationDoc;
}

export const attachmentSchemaDef = {
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
};

const assetTicketSchema = new mongoose.Schema<AssetTicket>(
  {
    state: {
      type: String,
      required: true,
    },
    // @ts-expect-error
    org: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
    ...attachmentSchemaDef,
  },
  { timestamps: true }
);
assetTicketSchema.index({ name: 1 }, { unique: true });

export const assetTicketModel = mongoose.model<AssetTicket>(
  'AssetTicket',
  assetTicketSchema
);
export type AssetTicketDoc = ConstructorReturnType<typeof assetTicketModel>;
