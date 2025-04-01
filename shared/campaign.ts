import type { AdCreationTicket_Client } from './creation';
import type { Organization_Client } from './org';

export type PricingModel = 'cpm' | 'cpc' | 'cpt';
interface AdCampaign {
  name: string;
  dateRange: { from: string; to: string };
  timeRange: string[] | null;
  pricingModel: PricingModel;
  budget: number;
  active?: boolean;
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
  expectedImpressions: number;
  features: string[];
  active?: boolean;
}

export type AdUnit_Client = AdUnit &
  Timestamp_Client &
  _Id & {
    org: Organization_Client;
    creations: AdCreationTicket_Client[];
  };
export type AdUnit_Server = AdUnit & Timestamp_Server;

export type NewCampaignFormData = AdCampaign & {
  /** 将已创建的广告单元Id绑定到广告投放计划 */
  units: string[];
};
export type NewUnitFormData = AdUnit & {
  /** 绑定的广告投放计划名称 */
  campaignName?: string;
  /** 将已创建的广告创意Id绑定到广告投放单元 */
  creations: string[];
};
