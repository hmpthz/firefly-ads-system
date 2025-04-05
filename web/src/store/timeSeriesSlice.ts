import {
  createSlice,
  type CaseReducer,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { TicketState } from '@shared/asset';
import type { AdCampaign_Client, AdUnit_Client } from '@shared/campaign';
import type { AdCreationTicket_Client } from '@shared/creation';

// 定义时间级别类型
export type TimeScale = 'hourly' | 'daily' | 'weekly';

// 为每种资源定义专门的数据类型
export interface CampaignDataPoint {
  time: Date;
  budget: number; // 已消耗预算
  remainingBudget: number; // 剩余预算
  consumptionRate: number; // 消耗率（百分比）
}

export interface UnitDataPoint {
  time: Date;
  impressions: number; // 实际曝光量
  expectedImpressions: number; // 预期曝光量
  completionRate: number; // 完成率（百分比）
}

export interface CreationDataPoint {
  time: Date;
  impressions: number; // 曝光次数
  clicks: number; // 点击次数
  ctr: number; // 点击率（百分比）
}

export interface TicketStateDataPoint {
  state: TicketState | undefined;
  count: number;
}

export interface BooleanDataPoint {
  enabled: boolean;
  count: number;
}

// 定义各类资源的时间序列数据存储结构
interface TimeSeriesStore {
  // 投放计划数据
  campaignSeries: Record<string, Record<TimeScale, CampaignDataPoint[]>>;
  // 投放单元数据
  unitSeries: Record<string, Record<TimeScale, UnitDataPoint[]>>;
  // 广告创意数据
  creationSeries: Record<string, Record<TimeScale, CreationDataPoint[]>>;
  // 工单状态数据
  ticketStateSeries: Record<string, TicketStateDataPoint[]>;
  // 布尔值数据
  booleanSeries: Record<string, BooleanDataPoint[]>;
}

// 初始状态
const initialState: TimeSeriesStore = {
  campaignSeries: {},
  unitSeries: {},
  creationSeries: {},
  ticketStateSeries: {},
  booleanSeries: {},
};

// 生成工单状态数据
const generateTicketStateData = (): TicketStateDataPoint[] => {
  // 总数量，500-1000之间随机
  const totalCount = 500 + Math.floor(Math.random() * 500);

  // 各状态的权重分配 (总和为1)
  const stateWeights: Record<string, number> = {
    'in-progress': 0.35, // 35%
    approved: 0.3, // 30%
    pending: 0.2, // 20%
    declined: 0.1, // 10%
    undefined: 0.05, // 5%
  };

  // 添加随机波动
  const addRandomVariation = (weight: number) => {
    const variation = weight * 0.6; // 60%的波动范围
    return weight + (Math.random() * variation * 2 - variation);
  };

  // 生成带波动的权重
  const adjustedWeights: Record<string, number> = {};
  for (const [state, weight] of Object.entries(stateWeights)) {
    adjustedWeights[state] = addRandomVariation(weight);
  }

  // 归一化权重使总和为1
  const totalWeight = Object.values(adjustedWeights).reduce(
    (sum, w) => sum + w,
    0
  );
  for (const state in adjustedWeights) {
    adjustedWeights[state] /= totalWeight;
  }

  // 根据权重分配数量
  const result: TicketStateDataPoint[] = [];
  let remainingCount = totalCount;

  // 添加各状态的数据点
  Object.entries(adjustedWeights).forEach(([stateStr, weight], index) => {
    // 为最后一个状态分配剩余数量，避免舍入误差
    const count =
      index === Object.keys(adjustedWeights).length - 1
        ? remainingCount
        : Math.round(totalCount * weight);

    remainingCount -= count;

    result.push({
      state: stateStr !== 'undefined' ? (stateStr as TicketState) : undefined,
      count,
    });
  });

  return result;
};

// 生成布尔数据
const generateBooleanData = (): BooleanDataPoint[] => {
  // 总数量，200-1000之间随机
  const totalCount = 200 + Math.floor(Math.random() * 800);

  const trueRatio = 0.2 + Math.random() * 0.8;

  // 计算各状态数量
  const trueCount = Math.round(totalCount * trueRatio);
  const falseCount = totalCount - trueCount;

  return [
    { enabled: true, count: trueCount },
    { enabled: false, count: falseCount },
  ];
};

// 生成指定时间范围内的时间点数组
const generateTimePoints = (scale: TimeScale): Date[] => {
  const now = new Date();
  const timePoints: Date[] = [];

  if (scale === 'hourly') {
    // 生成最近24小时的时间点，每小时一个
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      time.setMinutes(0);
      time.setSeconds(0);
      time.setMilliseconds(0);
      timePoints.push(time);
    }
  } else if (scale === 'daily') {
    // 生成最近30天的时间点，每天一个
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now);
      time.setDate(now.getDate() - i);
      time.setHours(0);
      time.setMinutes(0);
      time.setSeconds(0);
      time.setMilliseconds(0);
      timePoints.push(time);
    }
  } else if (scale === 'weekly') {
    // 生成最近12周的时间点，每周一个
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now);
      time.setDate(now.getDate() - i * 7);
      time.setHours(0);
      time.setMinutes(0);
      time.setSeconds(0);
      time.setMilliseconds(0);
      timePoints.push(time);
    }
  }

  return timePoints;
};

// 生成投放计划的时间序列数据
const generateCampaignData = (
  campaign: AdCampaign_Client,
  scale: TimeScale
): CampaignDataPoint[] => {
  const timePoints = generateTimePoints(scale);
  const totalBudget = campaign.budget;

  // 计算每个时间点应该消耗的平均预算
  const totalPoints = timePoints.length;

  // 创建随机增长模式 - 一些点增长快，一些点增长慢
  // 创建随机权重数组，总和为1
  const growthWeights = Array(totalPoints)
    .fill(0)
    .map(() => Math.random());
  const totalWeight = growthWeights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = growthWeights.map((w) => w / totalWeight);

  // 目标消耗总额（预算的60%-80%之间随机）
  const targetConsumption = totalBudget * (0.6 + Math.random() * 0.2);

  // 生成累积的时间序列数据
  let cumulativeBudget = 0;

  // 添加一些随机的增长波动点 - 比如广告活动中的推广日
  const boostPoints = new Set();
  const boostCount = Math.floor(totalPoints * 0.15); // 约15%的时间点会有推广活动
  for (let i = 0; i < boostCount; i++) {
    boostPoints.add(Math.floor(Math.random() * totalPoints));
  }

  return timePoints.map((time, index) => {
    // 基础增长率基于权重
    let growthRate = normalizedWeights[index] * totalPoints;

    // 如果是提升点，则增加2-4倍的增长
    if (boostPoints.has(index)) {
      growthRate *= 2 + Math.random() * 2;
    }

    // 添加季节性波动 - 使用正弦波模拟
    const seasonality = 1 + 0.2 * Math.sin((index / totalPoints) * Math.PI * 4);
    growthRate *= seasonality;

    // 计算当前时间点的增量
    const increment = (targetConsumption / totalPoints) * growthRate;

    // 确保增量为正数，防止数据下降
    const positiveIncrement = Math.max(0, increment);

    // 累加值
    cumulativeBudget += positiveIncrement;
    const roundedBudget = Math.round(cumulativeBudget);

    // 计算消耗率和剩余预算
    const consumptionRate = Math.min(
      100,
      Math.round((roundedBudget / totalBudget) * 100)
    );
    const remainingBudget = Math.max(0, totalBudget - roundedBudget);

    // 返回完整的数据对象
    return {
      time,
      budget: roundedBudget,
      remainingBudget,
      consumptionRate,
    };
  });
};

// 生成投放单元的时间序列数据
const generateUnitData = (
  unit: AdUnit_Client,
  scale: TimeScale
): UnitDataPoint[] => {
  const timePoints = generateTimePoints(scale);
  const expectedTotal = unit.expectedImpressions;

  // 计算每个时间点应该增加的平均值
  const totalPoints = timePoints.length;

  // 创建随机增长模式
  // 创建随机权重数组，总和为1
  const growthWeights = Array(totalPoints)
    .fill(0)
    .map(() => Math.random());
  const totalWeight = growthWeights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = growthWeights.map((w) => w / totalWeight);

  // 目标最终曝光量（预期曝光量的70%-90%之间随机）
  const targetImpressions = expectedTotal * (0.7 + Math.random() * 0.2);

  // 生成累积的时间序列数据
  let cumulativeImpressions = 0;

  // 随机生成一些高峰期和低谷期
  const peakDays = new Set();
  const lowDays = new Set();

  // 约10%的日子是高峰期，10%是低谷期
  const specialDayCount = Math.floor(totalPoints * 0.1);
  for (let i = 0; i < specialDayCount; i++) {
    peakDays.add(Math.floor(Math.random() * totalPoints));
    lowDays.add(Math.floor(Math.random() * totalPoints));
  }

  return timePoints.map((time, index) => {
    // 基础增长率基于权重
    let growthRate = normalizedWeights[index] * totalPoints;

    // 高峰期增长是平常的2-3倍
    if (peakDays.has(index)) {
      growthRate *= 2 + Math.random();
    }

    // 低谷期增长是平常的0.3-0.7倍
    if (lowDays.has(index)) {
      growthRate *= 0.3 + Math.random() * 0.4;
    }

    // 添加随机波动
    const volatility = 0.3; // 波动率
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    growthRate *= randomFactor;

    // 计算当前时间点的增量
    const increment = (targetImpressions / totalPoints) * growthRate;

    // 确保增量为正数，防止数据下降
    const positiveIncrement = Math.max(0, increment);

    // 累加值
    cumulativeImpressions += positiveIncrement;
    const roundedImpressions = Math.round(cumulativeImpressions);

    // 计算完成率
    const completionRate = Math.min(
      100,
      Math.round((roundedImpressions / expectedTotal) * 100)
    );

    // 返回完整的数据对象
    return {
      time,
      impressions: roundedImpressions,
      expectedImpressions: expectedTotal,
      completionRate,
    };
  });
};

// 生成广告创意的时间序列数据
const generateCreationData = (
  creation: AdCreationTicket_Client,
  scale: TimeScale
): CreationDataPoint[] => {
  const timePoints = generateTimePoints(scale);

  // 基于创意类型和模板等信息，设定一个基准曝光量
  // 这里简单示例，实际可以基于更多因素调整
  const baseImpressions = 10000; // 基准曝光量

  // 计算每个时间点应该增加的平均值
  const totalPoints = timePoints.length;

  // 创建随机增长模式
  // 创建随机权重数组，总和为1
  const growthWeights = Array(totalPoints)
    .fill(0)
    .map(() => Math.random());
  const totalWeight = growthWeights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = growthWeights.map((w) => w / totalWeight);

  // 添加一些随机的增长波动周期 - 模拟用户活跃度周期
  const periods = Math.floor(2 + Math.random() * 3); // 2-4个随机波动周期

  // 生成累积的时间序列数据
  let cumulativeImpressions = 0;

  // 随机CTR差异 - 不同时间段的CTR会有差异
  const timeBasedCTRs = Array(totalPoints)
    .fill(0)
    .map(() => 2 + Math.random() * 3); // 2% - 5% 的CTR

  return timePoints.map((time, index) => {
    // 基础增长率基于权重
    let growthRate = normalizedWeights[index] * totalPoints;

    // 添加周期性波动
    const cyclicalFactor =
      1 + 0.3 * Math.sin((index / totalPoints) * Math.PI * periods);
    growthRate *= cyclicalFactor;

    // 周末效应 - 生成一个0-6的数字代表星期几，增加周末流量
    const dayOfWeek =
      (Math.floor(time.getTime() / (24 * 60 * 60 * 1000)) + 4) % 7; // 0是周一
    if (dayOfWeek >= 5) {
      // 周六日
      growthRate *= 1.2 + Math.random() * 0.3; // 增加20%-50%
    }

    // 计算当前时间点的增量
    const increment = (baseImpressions / totalPoints) * growthRate;

    // 确保增量为正数，防止数据下降
    const positiveIncrement = Math.max(0, increment);

    // 累加曝光量
    cumulativeImpressions += positiveIncrement;
    const roundedImpressions = Math.round(cumulativeImpressions);

    // 当前时间点的点击率，允许随时间变化
    const ctr = timeBasedCTRs[index];

    // 根据当前CTR计算点击量
    const clicks = Math.round((roundedImpressions * ctr) / 100);

    // 返回完整的数据对象
    return {
      time,
      impressions: roundedImpressions,
      clicks,
      ctr,
    };
  });
};

// 为投放计划生成时间序列数据
const generateCampaignSeries: CaseReducer<
  TimeSeriesStore,
  PayloadAction<{ campaign: AdCampaign_Client; scale: TimeScale }>
> = (state, action) => {
  const { campaign, scale } = action.payload;

  // 确保该ID的数据结构存在
  if (!state.campaignSeries[campaign._id]) {
    state.campaignSeries[campaign._id] = {} as Record<
      TimeScale,
      CampaignDataPoint[]
    >;
  }

  // 直接生成并存储数据，不检查是否已存在
  state.campaignSeries[campaign._id][scale] = generateCampaignData(
    campaign,
    scale
  );
};

// 为投放单元生成时间序列数据
const generateUnitSeries: CaseReducer<
  TimeSeriesStore,
  PayloadAction<{ unit: AdUnit_Client; scale: TimeScale }>
> = (state, action) => {
  const { unit, scale } = action.payload;

  // 确保该ID的数据结构存在
  if (!state.unitSeries[unit._id]) {
    state.unitSeries[unit._id] = {} as Record<TimeScale, UnitDataPoint[]>;
  }

  // 直接生成并存储数据，不检查是否已存在
  state.unitSeries[unit._id][scale] = generateUnitData(unit, scale);
};

// 为广告创意生成时间序列数据
const generateCreationSeries: CaseReducer<
  TimeSeriesStore,
  PayloadAction<{ creation: AdCreationTicket_Client; scale: TimeScale }>
> = (state, action) => {
  const { creation, scale } = action.payload;

  // 确保该ID的数据结构存在
  if (!state.creationSeries[creation._id]) {
    state.creationSeries[creation._id] = {} as Record<
      TimeScale,
      CreationDataPoint[]
    >;
  }

  // 直接生成并存储数据，不检查是否已存在
  state.creationSeries[creation._id][scale] = generateCreationData(
    creation,
    scale
  );
};

// 为工单状态生成数据
const generateTicketStateSeries: CaseReducer<
  TimeSeriesStore,
  PayloadAction<{ key: string }>
> = (state, action) => {
  const { key } = action.payload;

  // 生成并存储数据
  state.ticketStateSeries[key] = generateTicketStateData();
};

// 为布尔值生成数据
const generateBooleanSeries: CaseReducer<
  TimeSeriesStore,
  PayloadAction<{ key: string }>
> = (state, action) => {
  const { key } = action.payload;

  // 生成并存储数据
  state.booleanSeries[key] = generateBooleanData();
};

// 创建时间序列切片
const timeSeriesSlice = createSlice({
  name: 'timeSeries',
  initialState,
  reducers: {
    generateCampaignSeries,
    generateUnitSeries,
    generateCreationSeries,
    generateTicketStateSeries,
    generateBooleanSeries,
  },
});

export const timeSeriesReducer = timeSeriesSlice.reducer;
export const timeSeriesActions = timeSeriesSlice.actions;
