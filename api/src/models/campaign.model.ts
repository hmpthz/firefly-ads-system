import type { AdCampaign_Server, AdUnit_Server } from '@shared/campaign.js';
import mongoose from 'mongoose';
import type { OrganizationDoc } from './org.model.js';
import type { adCreationTicketDoc } from './creation.model.js';

export interface AdCampaign extends AdCampaign_Server {
  org: mongoose.Types.ObjectId;
  units: mongoose.Types.Array<mongoose.Types.ObjectId>;
}
export interface AdCampaign_Populated {
  org: OrganizationDoc;
  units: mongoose.Types.Array<AdUnitDoc>;
}

const adCampaignSchema = new mongoose.Schema<AdCampaign>(
  {
    name: {
      type: String,
      required: true,
    },
    dateRange: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
    },
    timeRange: {
      type: [String],
      required: true,
    },
    pricingModel: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    // @ts-expect-error
    org: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
    units: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'AdUnit' }],
      required: true,
    },
  },
  { timestamps: true }
);
export const adCampaignModel = mongoose.model<AdCampaign>(
  'AdCampaign',
  adCampaignSchema
);
export type adCampaignDoc = ConstructorReturnType<typeof adCampaignModel>;

interface AdUnit extends AdUnit_Server {
  org: mongoose.Types.ObjectId;
  creations: mongoose.Types.Array<mongoose.Types.ObjectId>;
}
export interface AdUnit_Populated {
  org: OrganizationDoc;
  creations: mongoose.Types.Array<adCreationTicketDoc>;
}

const adUnitSchema = new mongoose.Schema<AdUnit>(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    locations: {
      type: [
        {
          province: {
            type: String,
            required: true,
          },
          city: {
            type: String,
          },
        },
      ],
      required: true,
    },
    ages: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
    },
    features: {
      type: [String],
      required: true,
    },
    // @ts-expect-error
    org: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
    creations: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'AdCreationTicket' }],
      required: true,
    },
  },
  { timestamps: true }
);
export const adUnitModel = mongoose.model<AdUnit>('AdUnit', adUnitSchema);
export type AdUnitDoc = ConstructorReturnType<typeof adUnitModel>;
