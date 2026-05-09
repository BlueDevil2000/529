import { CalculationResult } from './types';
import { formatCurrency } from './utils';
import { Target, TrendingUp, Wallet, School } from 'lucide-react';

interface SummaryStatsProps {
  result: CalculationResult;
  targetCost: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ result, targetCost }) => {
  const progress = targetCost > 0 ? (result.totalTuitionPaid / targetCost) * 100 : 0;
  
  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contributions</h3>
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(result.totalContributions)}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earnings</h3>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(result.totalEarnings)}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tuition Paid</h3>
            <School className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(result.totalTuitionPaid)}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Surplus</h3>
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <p className={`mt-1 text-xl font-bold ${result.finalBalance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
            {formatCurrency(result.finalBalance)}
          </p>
        </div>
      </div>

      {targetCost > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Projected Funding Level ({formatCurrency(targetCost)} total cost)</h3>
            <span className={`text-sm font-bold ${progress >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            {progress >= 100 
              ? `Great news! You are projected to fully cover the inflated cost of college and have ${formatCurrency(result.finalBalance)} left over.`
              : `You are projected to cover ${formatCurrency(result.totalTuitionPaid)} of the expected ${formatCurrency(targetCost)} cost, leaving a gap of ${formatCurrency(Math.abs(result.finalBalance))}.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryStats;