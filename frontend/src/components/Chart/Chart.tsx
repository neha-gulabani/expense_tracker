import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartProps {
  data: any[];
  type: 'bar' | 'horizontalBar';
  dataKey: string;
  xAxisKey: string;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any) => [string, string];
  tooltipLabelFormatter?: (label: any) => string;
  barColor?: string;
  barName?: string;
  height?: number | string;
  className?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  dataKey,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter = (value) => [`${value}`, 'Value'],
  tooltipLabelFormatter,
  barColor = '#8884d8',
  barName = 'Value',
  height = 400,
  className = '',
  margin = { top: 20, right: 30, left: 20, bottom: 30 }
}) => {
  // If no data, show a fallback message
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${typeof height === 'number' ? height : '[400px]'} bg-gray-50 rounded-md ${className}`}>
        <p className="text-gray-500 text-center">No data found</p>
      </div>
    );
  }

  // For horizontal bar chart
  if (type === 'horizontalBar') {
    return (
      <div className={`h-${typeof height === 'number' ? height : '[400px]'} ${className}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={margin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={yAxisFormatter}
            />
            <YAxis 
              dataKey={xAxisKey} 
              type="category" 
              width={80}
              tick={{ fontSize: 12 }}
              tickFormatter={xAxisFormatter}
            />
            <Tooltip 
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
            />
            <Bar 
              dataKey={dataKey} 
              fill={barColor} 
              name={barName} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default vertical bar chart
  return (
    <div className={`h-${typeof height === 'number' ? height : '[400px]'} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            tickFormatter={xAxisFormatter}
          />
          <YAxis 
            tickFormatter={yAxisFormatter}
          />
          <Tooltip 
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
          />
          <Bar 
            dataKey={dataKey} 
            fill={barColor} 
            name={barName} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
