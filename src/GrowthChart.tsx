import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { YearlyData } from './types';
import { formatCurrency } from './utils';

interface GrowthChartProps {
  data: YearlyData[];
  targetCost?: number;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, targetCost }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 h-96">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Savings Growth Over Time</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            tickFormatter={(value) => `Year ${value}`} 
          />
          <YAxis tickFormatter={(val) => formatCurrency(val)} width={80} />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="totalPrincipal" 
            name="Total Contributions"
            stackId="1" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
          />
          <Area 
            type="monotone" 
            dataKey="totalEarnings" 
            name="Total Earnings"
            stackId="1" 
            stroke="#10b981" 
            fill="#10b981" 
          />
          {targetCost && targetCost > 0 && (
            <ReferenceLine 
              y={targetCost} 
              label={{ position: 'top', value: 'College Cost Target', fill: '#ef4444', fontSize: 12 }} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;