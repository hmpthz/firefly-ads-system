import { useEffect } from 'react';
import { useStoreActions, useStoreSlice } from '@/store';
import type {
  TimeScale,
  CampaignTimeData,
  UnitTimeData,
  CreationTimeData,
} from '@/store/timeSeriesSlice';
import type { AdCampaign_Client, AdUnit_Client } from '@shared/campaign';
import type { AdCreationTicket_Client } from '@shared/creation';

/**
 * 获取投放计划的时间序列数据
 * @param campaign 投放计划对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 投放计划的时间序列数据
 */
export function useCampaignTimeSeries(
  campaign: AdCampaign_Client,
  scale: TimeScale = 'daily'
): CampaignTimeData[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查数据是否存在，不存在则生成
    if (
      !timeSeries.campaignSeries[campaign._id] ||
      !timeSeries.campaignSeries[campaign._id][scale]
    ) {
      dispatch(
        timeSeriesActions.generateCampaignSeries({
          campaign,
          scale,
        })
      );
    }
  }, [campaign._id, scale]);

  return timeSeries.campaignSeries[campaign._id]?.[scale];
}

/**
 * 获取投放单元的时间序列数据
 * @param unit 投放单元对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 投放单元的时间序列数据
 */
export function useUnitTimeSeries(
  unit: AdUnit_Client,
  scale: TimeScale = 'daily'
): UnitTimeData[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查数据是否存在，不存在则生成
    if (
      !timeSeries.unitSeries[unit._id] ||
      !timeSeries.unitSeries[unit._id][scale]
    ) {
      dispatch(
        timeSeriesActions.generateUnitSeries({
          unit,
          scale,
        })
      );
    }
  }, [unit._id, scale]);

  return timeSeries.unitSeries[unit._id]?.[scale];
}

/**
 * 获取广告创意的时间序列数据
 * @param creation 广告创意对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 广告创意的时间序列数据
 */
export function useCreationTimeSeries(
  creation: AdCreationTicket_Client,
  scale: TimeScale = 'daily'
): CreationTimeData[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查数据是否存在，不存在则生成
    if (
      !timeSeries.creationSeries[creation._id] ||
      !timeSeries.creationSeries[creation._id][scale]
    ) {
      dispatch(
        timeSeriesActions.generateCreationSeries({
          creation,
          scale,
        })
      );
    }
  }, [creation._id, scale]);

  return timeSeries.creationSeries[creation._id]?.[scale];
}

/**
 * 一次性获取多个投放计划的时间序列数据
 * @param campaigns 投放计划对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的campaigns数组顺序对应
 */
export function useBatchCampaignTimeSeries(
  campaigns: AdCampaign_Client[],
  scale: TimeScale = 'daily'
): CampaignTimeData[][] {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查每个投放计划的数据是否存在，不存在则生成
    campaigns.forEach((campaign) => {
      if (
        !timeSeries.campaignSeries[campaign._id] ||
        !timeSeries.campaignSeries[campaign._id][scale]
      ) {
        dispatch(
          timeSeriesActions.generateCampaignSeries({
            campaign,
            scale,
          })
        );
      }
    });
  }, [campaigns.map((c) => c._id).join(','), scale]);

  // 返回与输入campaigns数组对应的数据数组
  return campaigns.map(
    (campaign) => timeSeries.campaignSeries[campaign._id]?.[scale] || []
  );
}

/**
 * 一次性获取多个投放单元的时间序列数据
 * @param units 投放单元对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的units数组顺序对应
 */
export function useBatchUnitTimeSeries(
  units: AdUnit_Client[],
  scale: TimeScale = 'daily'
): UnitTimeData[][] {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查每个投放单元的数据是否存在，不存在则生成
    units.forEach((unit) => {
      if (
        !timeSeries.unitSeries[unit._id] ||
        !timeSeries.unitSeries[unit._id][scale]
      ) {
        dispatch(
          timeSeriesActions.generateUnitSeries({
            unit,
            scale,
          })
        );
      }
    });
  }, [units.map((u) => u._id).join(','), scale]);

  // 返回与输入units数组对应的数据数组
  return units.map((unit) => timeSeries.unitSeries[unit._id]?.[scale] || []);
}

/**
 * 一次性获取多个广告创意的时间序列数据
 * @param creations 广告创意对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的creations数组顺序对应
 */
export function useBatchCreationTimeSeries(
  creations: AdCreationTicket_Client[],
  scale: TimeScale = 'daily'
): CreationTimeData[][] {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');

  useEffect(() => {
    // 检查每个广告创意的数据是否存在，不存在则生成
    creations.forEach((creation) => {
      if (
        !timeSeries.creationSeries[creation._id] ||
        !timeSeries.creationSeries[creation._id][scale]
      ) {
        dispatch(
          timeSeriesActions.generateCreationSeries({
            creation,
            scale,
          })
        );
      }
    });
  }, [creations.map((c) => c._id).join(','), scale]);

  // 返回与输入creations数组对应的数据数组
  return creations.map(
    (creation) => timeSeries.creationSeries[creation._id]?.[scale] || []
  );
}
