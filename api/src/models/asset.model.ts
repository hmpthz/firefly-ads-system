import type { AssetTicket_Server, Attachment } from '@shared/asset.js';
import type { Organization_Server } from '@shared/org.js';
import mongoose from 'mongoose';

export interface AssetTicket extends AssetTicket_Server {
  org: mongoose.Types.ObjectId;
}
export interface AssetTicket_Populated {
  org: Organization_Server;
}

export const attachmentSchemaDef = {
  name: {
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
    ...attachmentSchemaDef,
  },
  { timestamps: true }
);
export const assetTicketModel = mongoose.model<AssetTicket>(
  'AssetTicket',
  assetTicketSchema
);
export type AssetTicketDoc = ConstructorReturnType<typeof assetTicketModel>;
