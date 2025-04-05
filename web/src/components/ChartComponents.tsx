import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Button, ButtonGroup, Box, Typography, Stack } from '@mui/material';
import type { EChartsOption } from 'echarts';
import type {
  TimeScale,
} from '@/store/timeSeriesSlice';
import { RadioGroupControl } from './Inputs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// 时间尺度选择按钮组件
interface TimeScaleSelectorProps {
  scale: TimeScale;
  setScale: (scale: TimeScale) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TimeScaleSelector: React.FC<TimeScaleSelectorProps> = ({
  scale,
  setScale,
  orientation = 'vertical',
}) => {
  return (
    <ButtonGroup
      orientation={orientation}
      variant="contained"
      sx={{
        height: 'fit-content',
        minWidth: orientation === 'vertical' ? '80px' : 0,
      }}
    >
      <Button
        onClick={() => setScale('hourly')}
        color={scale === 'hourly' ? 'primary' : 'inherit'}
      >
        小时
      </Button>
      <Button
        onClick={() => setScale('daily')}
        color={scale === 'daily' ? 'primary' : 'inherit'}
      >
        天
      </Button>
      <Button
        onClick={() => setScale('weekly')}
        color={scale === 'weekly' ? 'primary' : 'inherit'}
      >
        周
      </Button>
    </ButtonGroup>
  );
};

// 折线图组件接口
export interface LineChartProps {
  title: string;
  timeScale: TimeScale;
  setTimeScale: (scale: TimeScale) => void;
  series: Array<{
    name: string;
    data: Array<{ time: Date; value: number }>;
    color?: string;
  }>;
  yAxisName?: string;
  width?: string | number;
  height?: string | number;
  loading?: boolean;
  layout?: 'left' | 'top';
}

// 折线图组件
export const LineChart: React.FC<LineChartProps> = ({
  title,
  timeScale,
  setTimeScale,
  series,
  yAxisName = '',
  width = '100%',
  height = '400px',
  loading = false,
  layout = 'left',
}) => {
  // 准备echarts配置
  const getOption = (): EChartsOption => {
    // 处理X轴时间格式
    const timeFormat =
      timeScale === 'hourly'
        ? 'HH:00'
        : timeScale === 'daily'
        ? 'MM-DD'
        : 'MM-DD';

    // 准备数据
    const xAxisData =
      series.length > 0
        ? series[0].data.map((item) => {
            const date = new Date(item.time);
            // 根据timeScale格式化时间
            if (timeScale === 'hourly') {
              return `${date.getHours().toString().padStart(2, '0')}:00`;
            } else if (timeScale === 'daily') {
              return `${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date
                .getDate()
                .toString()
                .padStart(2, '0')}`;
            } else {
              return `${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date
                .getDate()
                .toString()
                .padStart(2, '0')}`;
            }
          })
        : [];

    // 准备series配置
    const seriesConfig = series.map((item) => ({
      name: item.name,
      type: 'line' as const,
      data: item.data.map((point) => point.value),
      itemStyle: {
        color: item.color,
      },
      lineStyle: {
        width: 2,
      },
      symbol: 'circle',
      symbolSize: 6,
    }));

    return {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let result = params[0].axisValue + '<br/>';
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: series.map((item) => item.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameLocation: 'end',
        nameGap: 15,
        nameTextStyle: {
          align: 'right',
        },
      },
      series: seriesConfig,
    };
  };

  return (
    <Stack
      direction={layout === 'left' ? 'row' : 'column'}
      spacing={2}
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: 3,
        p: 2,
        border: '2px solid #e0e0e0',
      }}
    >
      {layout === 'left' ? (
        <TimeScaleSelector
          scale={timeScale}
          setScale={setTimeScale}
          orientation="vertical"
        />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TimeScaleSelector
            scale={timeScale}
            setScale={setTimeScale}
            orientation="horizontal"
          />
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography>加载中...</Typography>
          </Box>
        ) : (
          <ReactECharts
            option={getOption()}
            notMerge={true}
            opts={{ renderer: 'svg' }}
          />
        )}
      </Box>
    </Stack>
  );
};

// 饼图组件接口
export interface PieChartProps {
  title: string;
  timeScale?: TimeScale;
  setTimeScale?: (scale: TimeScale) => void;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  width?: string | number;
  height?: string | number;
  loading?: boolean;
  layout?: 'left' | 'top';
}

// 饼图组件
export const PieChart: React.FC<PieChartProps> = ({
  title,
  timeScale,
  setTimeScale,
  data,
  width = '100%',
  height = '400px',
  loading = false,
  layout = 'left',
}) => {
  // 准备echarts配置
  const getOption = (): EChartsOption => {
    return {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map((item) => item.name),
      },
      grid: {
        containLabel: true,
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          center: ['40%', '50%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
          })),
        },
      ],
    };
  };

  return (
    <Stack
      direction={layout === 'left' ? 'row' : 'column'}
      spacing={2}
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: 3,
        p: 2,
        border: '2px solid #e0e0e0',
      }}
    >
      {timeScale && setTimeScale ? (
        layout === 'left' ? (
          <TimeScaleSelector
            scale={timeScale}
            setScale={setTimeScale}
            orientation="vertical"
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TimeScaleSelector
              scale={timeScale}
              setScale={setTimeScale}
              orientation="horizontal"
            />
          </Box>
        )
      ) : null}
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography>加载中...</Typography>
          </Box>
        ) : (
          <ReactECharts
            option={getOption()}
            notMerge={true}
            opts={{ renderer: 'svg' }}
          />
        )}
      </Box>
    </Stack>
  );
};

export const ChartsControl = ({
  show,
  setShow,
  onDownload,
  loading,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  onDownload: () => void;
  loading: boolean;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <RadioGroupControl
      row
      name="showCharts"
      value={show}
      labels={{ true: '显示图表', false: '隐藏图表' }}
      text="数据可视化："
      onChange={(_, val) => setShow(val === 'true')}
    />

    <Button
      variant="outlined"
      startIcon={<FileDownloadIcon />}
      onClick={onDownload}
      disabled={loading}
    >
      下载XML数据
    </Button>
  </Stack>
);

export const getColorByIndex = (index: number) => {
  const colors = [
    '#1976d2',
    '#2196f3',
    '#64b5f6',
    '#90caf9',
    '#4caf50',
    '#66bb6a',
    '#81c784',
    '#a5d6a7',
    '#ff9800',
    '#ffa726',
    '#ffb74d',
    '#ffcc80',
  ];
  return colors[index % colors.length];
};

export const ticketStateColors = {
  approved: '#4caf50', // 绿色
  'in-progress': '#2196f3', // 蓝色
  pending: '#ff9800', // 橙色
  declined: '#f44336', // 红色
  undefined: '#9e9e9e', // 灰色 (undefined)
};
