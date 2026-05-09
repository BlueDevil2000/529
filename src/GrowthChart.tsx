import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { YearlyData } from './types';
import { formatCurrency } from './utils';

interface GrowthChartProps {
  data: YearlyData[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
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
            dataKey="label" 
          />
          <YAxis tickFormatter={(val) => formatCurrency(val)} width={80} />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="balance" 
            name="Available Balance"
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="totalTuitionPaid" 
            name="Cumulative Tuition Paid"
            stroke="#f97316" 
            fill="#f97316" 
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;