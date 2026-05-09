import { CalculationResult } from './types';
import { formatCurrency } from './utils';
import { Target, TrendingUp, Wallet } from 'lucide-react';

interface SummaryStatsProps {
  result: CalculationResult;
  targetCost: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ result, targetCost }) => {
  const progress = targetCost > 0 ? (result.finalBalance / targetCost) * 100 : 0;
  
  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Contributions</h3>
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(result.totalContributions)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Earnings</h3>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(result.totalEarnings)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Proj. Balance</h3>
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{formatCurrency(result.finalBalance)}</p>
        </div>
      </div>

      {targetCost > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Progress Toward College Goal ({formatCurrency(targetCost)})</h3>
            <span className="text-sm font-bold text-blue-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Based on current projections, you will have {formatCurrency(result.finalBalance)} of the {formatCurrency(targetCost)} needed.
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryStats;