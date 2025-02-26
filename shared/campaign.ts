import type { AdCreationTicket_Client } from './creation';
import type { Organization_Client } from './org';

export type PricingModel = 'cpm' | 'cpc' | 'cpt';
interface AdCampaign {
  name: string;
  dateRange: { from: string; to: string };
  timeRange: string[];
  pricingModel: PricingModel;
  budget: number;
}

export type AdCampaign_Client = AdCampaign &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
    units: AdUnit_Client[];
  };
export type AdCampaign_Server = AdCampaign & Timestamp_Server;

interface AdUnit {
  name: string;
  gender: 'male' | 'female';
  locations: {
    province: string;
    city: string;
  }[];
  ages: { from: number; to: number };
  features: string[];
}

export type AdUnit_Client = AdUnit &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
    creations: AdCreationTicket_Client[];
  };
export type AdUnit_Server = AdUnit & Timestamp_Server;

export type NewCampaignFormData = AdCampaign & { units: NewUnitFormData[] };
export type NewUnitFormData = AdUnit & {
  /** 先创建广告创意或使用原有的，然后将它们Id绑定倒新的广告单元 */
  creations: string[];
};

export type UpdateCampaignFormData = Partial<AdCampaign> & {
  /** 创建或删除广告单元 */
  units: (
    | { op: 'new'; id?: undefined; data: NewUnitFormData }
    | { op: 'delete'; id: string; data?: undefined }
  )[];
};
export type UpdateUnitFormData = Partial<AdUnit> & {
  /** 创建或删除广告创意 */
  creations: { op: 'new' | 'delete'; id: string }[];
};
