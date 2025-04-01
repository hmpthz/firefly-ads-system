import {
  createSlice,
  type CaseReducer,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { AdCampaign_Client, AdUnit_Client } from '@shared/campaign';
import type { AdCreationTicket_Client } from '@shared/creation';

// 定义时间级别类型
export type TimeScale = 'hourly' | 'daily' | 'weekly';

// 为每种资源定义专门的数据类型
export interface CampaignTimeData {
  time: Date;
  budget: number; // 已消耗预算
  remainingBudget: number; // 剩余预算
  consumptionRate: number; // 消耗率（百分比）
}

export interface UnitTimeData {
  time: Date;
  impressions: number; // 实际曝光量
  expectedImpressions: number; // 预期曝光量
  completionRate: number; // 完成率（百分比）
}

export interface CreationTimeData {
  time: Date;
  impressions: number; // 曝光次数
  clicks: number; // 点击次数
  ctr: number; // 点击率（百分比）
}

// 定义各类资源的时间序列数据存储结构
interface TimeSeriesStore {
  // 投放计划数据
  campaignSeries: Record<string, Record<TimeScale, CampaignTimeData[]>>;
  // 投放单元数据
  unitSeries: Record<string, Record<TimeScale, UnitTimeData[]>>;
  // 广告创意数据
  creationSeries: Record<string, Record<TimeScale, CreationTimeData[]>>;
}

// 初始状态
const initialState: TimeSeriesStore = {
  campaignSeries: {},
  unitSeries: {},
  creationSeries: {},
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
): CampaignTimeData[] => {
  const timePoints = generateTimePoints(scale);
  const totalBudget = campaign.budget;

  // 计算每个时间点应该消耗的平均预算
  const totalPoints = timePoints.length;
  const avgIncrement = (totalBudget * 0.7) / totalPoints; // 假设最终消耗约70%预算

  // 生成累积的时间序列数据
  let cumulativeBudget = 0;
  return timePoints.map((time, index) => {
    // 添加一些随机波动，波动范围随时间增大
    const progression = (index + 1) / totalPoints; // 0.0 到 1.0 的进度

    // 随机波动系数随时间增加而增加，越靠近当前时间，波动越大
    const randomFactor = 1 + (Math.random() * 2 - 1) * 0.2 * progression;

    // 计算当前时间点的增量
    const increment = avgIncrement * randomFactor;

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
): UnitTimeData[] => {
  const timePoints = generateTimePoints(scale);
  const expectedTotal = unit.expectedImpressions;

  // 计算每个时间点应该增加的平均值
  const totalPoints = timePoints.length;
  const avgIncrement = (expectedTotal * 0.8) / totalPoints; // 假设最终达到约80%的预期曝光

  // 生成累积的时间序列数据
  let cumulativeImpressions = 0;
  return timePoints.map((time, index) => {
    // 添加一些随机波动，波动范围随时间增大
    const progression = (index + 1) / totalPoints; // 0.0 到 1.0 的进度

    // 随机波动系数随时间增加而增加，越靠近当前时间，波动越大
    const randomFactor = 1 + (Math.random() * 2 - 1) * 0.2 * progression;

    // 计算当前时间点的增量
    const increment = avgIncrement * randomFactor;

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
): CreationTimeData[] => {
  const timePoints = generateTimePoints(scale);

  // 基于创意类型和模板等信息，设定一个基准曝光量
  // 这里简单示例，实际可以基于更多因素调整
  const baseImpressions = 10000; // 基准曝光量

  // 计算每个时间点应该增加的平均值
  const totalPoints = timePoints.length;
  const avgIncrement = baseImpressions / totalPoints;

  // 生成累积的时间序列数据
  let cumulativeImpressions = 0;
  return timePoints.map((time, index) => {
    // 添加一些随机波动，波动范围随时间增大
    const progression = (index + 1) / totalPoints; // 0.0 到 1.0 的进度

    // 随机波动系数随时间增加而增加，越靠近当前时间，波动越大
    const randomFactor = 1 + (Math.random() * 2 - 1) * 0.2 * progression;

    // 计算当前时间点的增量
    const increment = avgIncrement * randomFactor;

    // 确保增量为正数，防止数据下降
    const positiveIncrement = Math.max(0, increment);

    // 累加曝光量
    cumulativeImpressions += positiveIncrement;
    const roundedImpressions = Math.round(cumulativeImpressions);

    // 随机点击率，在2%到4%之间浮动
    const ctr = 2 + Math.random() * 2;
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
      CampaignTimeData[]
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
    state.unitSeries[unit._id] = {} as Record<TimeScale, UnitTimeData[]>;
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
      CreationTimeData[]
    >;
  }

  // 直接生成并存储数据，不检查是否已存在
  state.creationSeries[creation._id][scale] = generateCreationData(
    creation,
    scale
  );
};

// 创建时间序列切片
const timeSeriesSlice = createSlice({
  name: 'timeSeries',
  initialState,
  reducers: {
    generateCampaignSeries,
    generateUnitSeries,
    generateCreationSeries,
  },
});

export const timeSeriesReducer = timeSeriesSlice.reducer;
export const timeSeriesActions = timeSeriesSlice.actions;
