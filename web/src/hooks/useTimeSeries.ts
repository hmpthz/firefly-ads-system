import { useEffect, useState } from 'react';
import { useStoreActions, useStoreSlice } from '@/store';
import type {
  TimeScale,
  CampaignDataPoint,
  UnitDataPoint,
  CreationDataPoint,
  TicketStateDataPoint,
  BooleanDataPoint,
} from '@/store/timeSeriesSlice';
import type { AdCampaign_Client, AdUnit_Client } from '@shared/campaign';
import type { AdCreationTicket_Client } from '@shared/creation';

// 配置模拟延迟时间范围（毫秒）
const MIN_LOADING_DELAY = 800; // 最小延迟时间
const MAX_LOADING_DELAY = 2000; // 最大延迟时间

// 生成随机延迟时间
const getRandomDelay = () =>
  MIN_LOADING_DELAY + Math.random() * (MAX_LOADING_DELAY - MIN_LOADING_DELAY);

/**
 * 获取投放计划的时间序列数据
 * @param campaign 投放计划对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 投放计划的时间序列数据，加载中时返回undefined
 */
export function useCampaignTimeSeries(
  campaign: AdCampaign_Client | undefined,
  scale: TimeScale = 'daily'
): CampaignDataPoint[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // 如果campaign未定义，跳过所有操作，直接返回undefined
    if (!campaign) {
      setLoading(false);
      setDataReady(false);
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);

    // 检查数据是否存在
    const dataExists = !!(
      timeSeries.campaignSeries[campaign._id] &&
      timeSeries.campaignSeries[campaign._id][scale]
    );

    // 如果数据已存在，只需模拟短暂的加载
    if (dataExists) {
      const timer = setTimeout(() => {
        setLoading(false);
        setDataReady(true);
      }, getRandomDelay() / 3); // 已有数据时使用更短的延迟

      return () => clearTimeout(timer);
    }

    // 数据不存在，模拟加载并生成数据
    const timer = setTimeout(() => {
      // 生成数据
      dispatch(
        timeSeriesActions.generateCampaignSeries({
          campaign,
          scale,
        })
      );

      // 完成加载
      setLoading(false);
      setDataReady(true);
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [campaign?._id, scale]);

  // 加载中或未准备好时返回undefined，否则返回数据
  if (!campaign) return undefined;

  return loading || !dataReady
    ? undefined
    : timeSeries.campaignSeries[campaign._id]?.[scale];
}

/**
 * 获取投放单元的时间序列数据
 * @param unit 投放单元对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 投放单元的时间序列数据，加载中时返回undefined
 */
export function useUnitTimeSeries(
  unit: AdUnit_Client | undefined,
  scale: TimeScale = 'daily'
): UnitDataPoint[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // 如果unit未定义，跳过所有操作，直接返回undefined
    if (!unit) {
      setLoading(false);
      setDataReady(false);
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);

    // 检查数据是否存在
    const dataExists = !!(
      timeSeries.unitSeries[unit._id] && timeSeries.unitSeries[unit._id][scale]
    );

    // 如果数据已存在，只需模拟短暂的加载
    if (dataExists) {
      const timer = setTimeout(() => {
        setLoading(false);
        setDataReady(true);
      }, getRandomDelay() / 3); // 已有数据时使用更短的延迟

      return () => clearTimeout(timer);
    }

    // 数据不存在，模拟加载并生成数据
    const timer = setTimeout(() => {
      // 生成数据
      dispatch(
        timeSeriesActions.generateUnitSeries({
          unit,
          scale,
        })
      );

      // 完成加载
      setLoading(false);
      setDataReady(true);
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [unit?._id, scale]);

  // 加载中或未准备好时返回undefined，否则返回数据
  if (!unit) return undefined;

  return loading || !dataReady
    ? undefined
    : timeSeries.unitSeries[unit._id]?.[scale];
}

/**
 * 获取广告创意的时间序列数据
 * @param creation 广告创意对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 广告创意的时间序列数据，加载中时返回undefined
 */
export function useCreationTimeSeries(
  creation: AdCreationTicket_Client | undefined,
  scale: TimeScale = 'daily'
): CreationDataPoint[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // 如果creation未定义，跳过所有操作，直接返回undefined
    if (!creation) {
      setLoading(false);
      setDataReady(false);
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);

    // 检查数据是否存在
    const dataExists = !!(
      timeSeries.creationSeries[creation._id] &&
      timeSeries.creationSeries[creation._id][scale]
    );

    // 如果数据已存在，只需模拟短暂的加载
    if (dataExists) {
      const timer = setTimeout(() => {
        setLoading(false);
        setDataReady(true);
      }, getRandomDelay() / 3); // 已有数据时使用更短的延迟

      return () => clearTimeout(timer);
    }

    // 数据不存在，模拟加载并生成数据
    const timer = setTimeout(() => {
      // 生成数据
      dispatch(
        timeSeriesActions.generateCreationSeries({
          creation,
          scale,
        })
      );

      // 完成加载
      setLoading(false);
      setDataReady(true);
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [creation?._id, scale]);

  // 加载中或未准备好时返回undefined，否则返回数据
  if (!creation) return undefined;

  return loading || !dataReady
    ? undefined
    : timeSeries.creationSeries[creation._id]?.[scale];
}

/**
 * 一次性获取多个投放计划的时间序列数据
 * @param campaigns 投放计划对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的campaigns数组顺序对应，加载中时返回undefined
 */
function useBatchCampaignTimeSeries(
  campaigns: AdCampaign_Client[] | undefined,
  scale: TimeScale = 'daily'
): CampaignDataPoint[][] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [_loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 如果campaigns未定义，跳过所有操作，直接返回undefined
    if (!campaigns) {
      setLoading(false);
      setDataReady(false);
      setLoadedIds(new Set());
      return;
    }

    if (campaigns.length === 0) {
      setLoading(false);
      setDataReady(true);
      setLoadedIds(new Set());
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);
    setLoadedIds(new Set());

    // 追踪已加载的数据ID
    const idsToLoad = new Set(campaigns.map((c) => c._id));

    // 为每个campaign创建加载Promise
    campaigns.forEach((campaign) => {
      // 检查数据是否已存在
      const dataExists = !!(
        timeSeries.campaignSeries[campaign._id] &&
        timeSeries.campaignSeries[campaign._id][scale]
      );

      // 设置加载延迟时间
      const delay = dataExists
        ? getRandomDelay() / 3 // 已有数据时使用更短的延迟
        : getRandomDelay();

      // 创建延迟加载任务
      setTimeout(() => {
        if (!dataExists) {
          // 生成数据
          dispatch(
            timeSeriesActions.generateCampaignSeries({
              campaign,
              scale,
            })
          );
        }

        // 更新已加载的ID集合
        setLoadedIds((prev) => {
          const updated = new Set(prev);
          updated.add(campaign._id);

          // 检查是否所有数据都已加载完成
          if (
            Array.from(updated).filter((id) => idsToLoad.has(id)).length ===
            idsToLoad.size
          ) {
            setLoading(false);
            setDataReady(true);
          }

          return updated;
        });
      }, delay);
    });

    return () => {
      // 清理状态
      setLoading(false);
      setDataReady(false);
    };
  }, [campaigns?.map((c) => c._id).join(',') || '', scale]);

  // 如果campaigns未定义，直接返回undefined
  if (!campaigns) return undefined;

  // 加载中或未准备好时返回undefined，否则返回数据数组
  return loading || !dataReady
    ? undefined
    : campaigns.map(
        (campaign) => timeSeries.campaignSeries[campaign._id]?.[scale] || []
      );
}

/**
 * 一次性获取多个投放单元的时间序列数据
 * @param units 投放单元对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的units数组顺序对应，加载中时返回undefined
 */
function useBatchUnitTimeSeries(
  units: AdUnit_Client[] | undefined,
  scale: TimeScale = 'daily'
): UnitDataPoint[][] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [_loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 如果units未定义，跳过所有操作，直接返回undefined
    if (!units) {
      setLoading(false);
      setDataReady(false);
      setLoadedIds(new Set());
      return;
    }

    if (units.length === 0) {
      setLoading(false);
      setDataReady(true);
      setLoadedIds(new Set());
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);
    setLoadedIds(new Set());

    // 追踪已加载的数据ID
    const idsToLoad = new Set(units.map((u) => u._id));

    // 为每个unit创建加载Promise
    units.forEach((unit) => {
      // 检查数据是否已存在
      const dataExists = !!(
        timeSeries.unitSeries[unit._id] &&
        timeSeries.unitSeries[unit._id][scale]
      );

      // 设置加载延迟时间
      const delay = dataExists
        ? getRandomDelay() / 3 // 已有数据时使用更短的延迟
        : getRandomDelay();

      // 创建延迟加载任务
      setTimeout(() => {
        if (!dataExists) {
          // 生成数据
          dispatch(
            timeSeriesActions.generateUnitSeries({
              unit,
              scale,
            })
          );
        }

        // 更新已加载的ID集合
        setLoadedIds((prev) => {
          const updated = new Set(prev);
          updated.add(unit._id);

          // 检查是否所有数据都已加载完成
          if (
            Array.from(updated).filter((id) => idsToLoad.has(id)).length ===
            idsToLoad.size
          ) {
            setLoading(false);
            setDataReady(true);
          }

          return updated;
        });
      }, delay);
    });

    return () => {
      // 清理状态
      setLoading(false);
      setDataReady(false);
    };
  }, [units?.map((u) => u._id).join(',') || '', scale]);

  // 如果units未定义，直接返回undefined
  if (!units) return undefined;

  // 加载中或未准备好时返回undefined，否则返回数据数组
  return loading || !dataReady
    ? undefined
    : units.map((unit) => timeSeries.unitSeries[unit._id]?.[scale] || []);
}

/**
 * 一次性获取多个广告创意的时间序列数据
 * @param creations 广告创意对象数组
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 时间序列数据数组，与输入的creations数组顺序对应，加载中时返回undefined
 */
function useBatchCreationTimeSeries(
  creations: AdCreationTicket_Client[] | undefined,
  scale: TimeScale = 'daily'
): CreationDataPoint[][] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [_loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 如果creations未定义，跳过所有操作，直接返回undefined
    if (!creations) {
      setLoading(false);
      setDataReady(false);
      setLoadedIds(new Set());
      return;
    }

    if (creations.length === 0) {
      setLoading(false);
      setDataReady(true);
      setLoadedIds(new Set());
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);
    setLoadedIds(new Set());

    // 追踪已加载的数据ID
    const idsToLoad = new Set(creations.map((c) => c._id));

    // 为每个creation创建加载Promise
    creations.forEach((creation) => {
      // 检查数据是否已存在
      const dataExists = !!(
        timeSeries.creationSeries[creation._id] &&
        timeSeries.creationSeries[creation._id][scale]
      );

      // 设置加载延迟时间
      const delay = dataExists
        ? getRandomDelay() / 3 // 已有数据时使用更短的延迟
        : getRandomDelay();

      // 创建延迟加载任务
      setTimeout(() => {
        if (!dataExists) {
          // 生成数据
          dispatch(
            timeSeriesActions.generateCreationSeries({
              creation,
              scale,
            })
          );
        }

        // 更新已加载的ID集合
        setLoadedIds((prev) => {
          const updated = new Set(prev);
          updated.add(creation._id);

          // 检查是否所有数据都已加载完成
          if (
            Array.from(updated).filter((id) => idsToLoad.has(id)).length ===
            idsToLoad.size
          ) {
            setLoading(false);
            setDataReady(true);
          }

          return updated;
        });
      }, delay);
    });

    return () => {
      // 清理状态
      setLoading(false);
      setDataReady(false);
    };
  }, [creations?.map((c) => c._id).join(',') || '', scale]);

  // 如果creations未定义，直接返回undefined
  if (!creations) return undefined;

  // 加载中或未准备好时返回undefined，否则返回数据数组
  return loading || !dataReady
    ? undefined
    : creations.map(
        (creation) => timeSeries.creationSeries[creation._id]?.[scale] || []
      );
}

interface CampaignUnitsTimeSeriesData {
  campaign: CampaignDataPoint[];
  units: UnitDataPoint[][];
}
/**
 * 组合hook：同时获取投放计划及其所有单元的时间序列数据
 * @param campaign 投放计划对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 包含投放计划和所有单元时间序列数据的对象，加载中时返回undefined
 */
export function useCampaignUnitsTimeSeries(
  campaign: AdCampaign_Client | undefined,
  scale: TimeScale = 'daily'
): CampaignUnitsTimeSeriesData | undefined {
  // 如果campaign未定义，直接返回undefined
  if (!campaign) return undefined;

  const campaignData = useCampaignTimeSeries(campaign, scale);
  const unitsData = useBatchUnitTimeSeries(campaign.units, scale);

  // 如果任一数据仍在加载中，则返回undefined
  if (campaignData === undefined || unitsData === undefined) {
    return undefined;
  }

  // 返回组合数据
  return {
    campaign: campaignData,
    units: unitsData,
  };
}

interface UnitCreationsTimeSeriesData {
  unit: UnitDataPoint[];
  creations: CreationDataPoint[][];
}
/**
 * 组合hook：同时获取投放单元及其所有创意的时间序列数据
 * @param unit 投放单元对象
 * @param scale 时间尺度: 'hourly' | 'daily' | 'weekly'
 * @returns 包含投放单元和所有创意时间序列数据的对象，加载中时返回undefined
 */
export function useUnitCreationsTimeSeries(
  unit: AdUnit_Client | undefined,
  scale: TimeScale = 'daily'
): UnitCreationsTimeSeriesData | undefined {
  // 如果unit未定义，直接返回undefined
  if (!unit) return undefined;

  const unitData = useUnitTimeSeries(unit, scale);
  const creationsData = useBatchCreationTimeSeries(unit.creations, scale);

  // 如果任一数据仍在加载中，则返回undefined
  if (unitData === undefined || creationsData === undefined) {
    return undefined;
  }

  // 返回组合数据
  return {
    unit: unitData,
    creations: creationsData,
  };
}

/**
 * 获取工单状态数据
 * @param key 数据键值，通常是某种唯一标识符
 * @returns 工单状态数据，加载中时返回undefined
 */
export function useTicketStateData(
  key: string | undefined
): TicketStateDataPoint[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // 如果key未定义，跳过所有操作，直接返回undefined
    if (!key) {
      setLoading(false);
      setDataReady(false);
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);

    // 检查数据是否存在
    const dataExists = !!timeSeries.ticketStateSeries[key];

    // 如果数据已存在，只需模拟短暂的加载
    if (dataExists) {
      const timer = setTimeout(() => {
        setLoading(false);
        setDataReady(true);
      }, getRandomDelay() / 3); // 已有数据时使用更短的延迟

      return () => clearTimeout(timer);
    }

    // 数据不存在，模拟加载并生成数据
    const timer = setTimeout(() => {
      // 生成数据
      dispatch(
        timeSeriesActions.generateTicketStateSeries({
          key,
        })
      );

      // 完成加载
      setLoading(false);
      setDataReady(true);
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [key]);

  // 加载中或未准备好时返回undefined，否则返回数据
  if (!key) return undefined;

  return loading || !dataReady ? undefined : timeSeries.ticketStateSeries[key];
}

/**
 * 获取布尔类型数据
 * @param key 数据键值，通常是某种唯一标识符
 * @returns 布尔数据，加载中时返回undefined
 */
export function useBooleanData(
  key: string | undefined
): BooleanDataPoint[] | undefined {
  const { dispatch, timeSeriesActions } = useStoreActions();
  const timeSeries = useStoreSlice('timeSeries');
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // 如果key未定义，跳过所有操作，直接返回undefined
    if (!key) {
      setLoading(false);
      setDataReady(false);
      return;
    }

    // 重置加载状态
    setLoading(true);
    setDataReady(false);

    // 检查数据是否存在
    const dataExists = !!timeSeries.booleanSeries[key];

    // 如果数据已存在，只需模拟短暂的加载
    if (dataExists) {
      const timer = setTimeout(() => {
        setLoading(false);
        setDataReady(true);
      }, getRandomDelay() / 3); // 已有数据时使用更短的延迟

      return () => clearTimeout(timer);
    }

    // 数据不存在，模拟加载并生成数据
    const timer = setTimeout(() => {
      // 生成数据
      dispatch(
        timeSeriesActions.generateBooleanSeries({
          key,
        })
      );

      // 完成加载
      setLoading(false);
      setDataReady(true);
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [key]);

  // 加载中或未准备好时返回undefined，否则返回数据
  if (!key) return undefined;

  return loading || !dataReady ? undefined : timeSeries.booleanSeries[key];
}

// 时间序列数据转XML工具函数

/**
 * 将日期对象转换为格式化的日期字符串
 * @param date 日期对象
 * @returns 格式化的日期字符串 YYYY-MM-DD HH:MM:SS
 */
function formatDate(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将广告创意时间序列数据转换为XML格式
 * @param creationName 广告创意名称
 * @param data 广告创意时间序列数据
 * @returns XML格式字符串
 */
export function creationTimeDataToXML(
  creationName: string,
  data: CreationDataPoint[] | undefined
): string {
  if (!data) return '';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<creation name="${creationName}" exportTime="${formatDate(
    new Date()
  )}">\n`;

  data.forEach((item) => {
    xml += `  <timePoint date="${formatDate(new Date(item.time))}">\n`;
    xml += `    <impressions>${item.impressions}</impressions>\n`;
    xml += `    <clicks>${item.clicks}</clicks>\n`;
    xml += `    <ctr>${item.ctr}</ctr>\n`;
    xml += `  </timePoint>\n`;
  });

  xml += `</creation>`;
  return xml;
}

/**
 * 将Campaign和Units组合数据转换为XML格式
 * @param campaignName 投放计划名称
 * @param campaignData 投放计划时间序列数据
 * @param unitsData 投放单元时间序列数据
 * @param unitNames 投放单元名称数组
 * @returns XML格式字符串
 */
export function campaignUnitsTimeDataToXML(
  campaignName: string,
  campaignData: CampaignDataPoint[] | undefined,
  unitsData: Array<UnitDataPoint[] | undefined> | undefined,
  unitNames: string[]
): string {
  if (!campaignData || !unitsData) return '';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<campaignWithUnits name="${campaignName}" exportTime="${formatDate(
    new Date()
  )}">\n`;

  // 计划数据
  xml += `  <campaignData>\n`;
  campaignData.forEach((item) => {
    xml += `    <timePoint date="${formatDate(new Date(item.time))}">\n`;
    xml += `      <budget>${item.budget}</budget>\n`;
    xml += `      <remainingBudget>${item.remainingBudget}</remainingBudget>\n`;
    xml += `      <consumptionRate>${item.consumptionRate}</consumptionRate>\n`;
    xml += `    </timePoint>\n`;
  });
  xml += `  </campaignData>\n`;

  // 单元数据
  xml += `  <units>\n`;
  unitsData.forEach((unitData, index) => {
    if (unitData && unitData.length > 0) {
      const unitName =
        index < unitNames.length ? unitNames[index] : `Unit ${index + 1}`;
      xml += `    <unit name="${unitName}">\n`;
      unitData.forEach((item) => {
        xml += `      <timePoint date="${formatDate(new Date(item.time))}">\n`;
        xml += `        <impressions>${item.impressions}</impressions>\n`;
        xml += `        <expectedImpressions>${item.expectedImpressions}</expectedImpressions>\n`;
        xml += `        <completionRate>${item.completionRate}</completionRate>\n`;
        xml += `      </timePoint>\n`;
      });
      xml += `    </unit>\n`;
    }
  });
  xml += `  </units>\n`;

  xml += `</campaignWithUnits>`;
  return xml;
}

/**
 * 将Unit和Creations组合数据转换为XML格式
 * @param unitName 投放单元名称
 * @param unitData 投放单元时间序列数据
 * @param creationsData 广告创意时间序列数据
 * @param creationNames 广告创意名称数组
 * @returns XML格式字符串
 */
export function unitCreationsTimeDataToXML(
  unitName: string,
  unitData: UnitDataPoint[] | undefined,
  creationsData: Array<CreationDataPoint[] | undefined> | undefined,
  creationNames: string[]
): string {
  if (!unitData || !creationsData) return '';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<unitWithCreations name="${unitName}" exportTime="${formatDate(
    new Date()
  )}">\n`;

  // 单元数据
  xml += `  <unitData>\n`;
  unitData.forEach((item) => {
    xml += `    <timePoint date="${formatDate(new Date(item.time))}">\n`;
    xml += `      <impressions>${item.impressions}</impressions>\n`;
    xml += `      <expectedImpressions>${item.expectedImpressions}</expectedImpressions>\n`;
    xml += `      <completionRate>${item.completionRate}</completionRate>\n`;
    xml += `    </timePoint>\n`;
  });
  xml += `  </unitData>\n`;

  // 创意数据
  xml += `  <creations>\n`;
  creationsData.forEach((creationData, index) => {
    if (creationData && creationData.length > 0) {
      const creationName =
        index < creationNames.length
          ? creationNames[index]
          : `Creation ${index + 1}`;
      xml += `    <creation name="${creationName}">\n`;
      creationData.forEach((item) => {
        xml += `      <timePoint date="${formatDate(new Date(item.time))}">\n`;
        xml += `        <impressions>${item.impressions}</impressions>\n`;
        xml += `        <clicks>${item.clicks}</clicks>\n`;
        xml += `        <ctr>${item.ctr}</ctr>\n`;
        xml += `      </timePoint>\n`;
      });
      xml += `    </creation>\n`;
    }
  });
  xml += `  </creations>\n`;

  xml += `</unitWithCreations>`;
  return xml;
}

/**
 * 创建并下载XML文件
 * @param xmlContent XML内容
 * @param fileName 文件名
 */
export function downloadXML(xmlContent: string, fileName: string): void {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
