import { useState } from 'react';
import { ChildProfile, CollegeData } from './types';
import CollegeSearch from './CollegeSearch';
import { School, X, TrendingUp, Info } from 'lucide-react';
import { formatCurrency, calculateTotalCollegeCost, calculateInflatedTotalCost } from './utils';
import { differenceInMonths, parseISO } from 'date-fns';

interface CalculatorFormProps {
  profile: ChildProfile;
  onChange: (profile: ChildProfile) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ profile, onChange }) => {
  const [isManual, setIsManual] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...profile,
      [name]: type === 'checkbox' ? checked : (name === 'name' || name === 'collegeStartDate' ? value : parseFloat(value) || 0),
    });
  };

  const handleManualCollegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const currentCollege = profile.targetCollege || { id: 0, name: '', tuitionInState: 0, tuitionOutState: 0, roomAndBoard: 0, costOfAttendance: 0 };
    
    onChange({
      ...profile,
      targetCollege: {
        ...currentCollege,
        [name]: name === 'name' ? value : parseFloat(value) || 0,
        // When entering manually, we set costOfAttendance as the primary driver
        costOfAttendance: name === 'costOfAttendance' ? parseFloat(value) || 0 : currentCollege.costOfAttendance
      }
    });
  };

  const handleCollegeSelect = (college: CollegeData) => {
    onChange({
      ...profile,
      targetCollege: college,
    });
    setIsManual(false);
  };

  const clearCollege = () => {
    onChange({
      ...profile,
      targetCollege: undefined,
    });
    setIsManual(false);
  };

  const yearsToCollege = Math.max(0, Math.ceil(differenceInMonths(parseISO(profile.collegeStartDate), new Date()) / 12));
  const inflatedCost = calculateInflatedTotalCost(profile.targetCollege, yearsToCollege, profile.collegeInflationRate || 4.5);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kid Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Start Date</label>
              <input
                type="month"
                name="collegeStartDate"
                value={profile.collegeStartDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">Savings & Strategy</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance ($)</label>
                <input
                  type="number"
                  name="initialBalance"
                  value={profile.initialBalance}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Add ($)</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={profile.monthlyContribution}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Return (%)</label>
                <input
                  type="number"
                  name="expectedReturnRate"
                  value={profile.expectedReturnRate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Education Inflation (%)
                  <TrendingUp className="h-3 w-3 ml-1 text-gray-400" />
                </label>
                <input
                  type="number"
                  name="collegeInflationRate"
                  value={profile.collegeInflationRate ?? 4.5}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                name="stopContributingAtCollege"
                id="stopContributing"
                checked={profile.stopContributingAtCollege ?? true}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="stopContributing" className="text-sm text-gray-600">
                Stop contributions when college starts
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <School className="h-5 w-5 mr-2 text-blue-600" />
              Target College
            </h2>
            <button 
              onClick={() => setIsManual(!isManual)}
              className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              {isManual ? 'Switch to Search' : 'Enter Manually'}
            </button>
          </div>
          
          {isManual ? (
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">College Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Duke University"
                  value={profile.targetCollege?.name || ''}
                  onChange={handleManualCollegeChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Annual Cost (Today)</label>
                <input
                  type="number"
                  name="costOfAttendance"
                  placeholder="e.g. 85000"
                  value={profile.targetCollege?.costOfAttendance || ''}
                  onChange={handleManualCollegeChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 italic mt-1">Manual mode: Inflation will still be applied to these values.</p>
            </div>
          ) : profile.targetCollege ? (
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm relative">
              <button 
                onClick={clearCollege}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-bold text-lg text-blue-800 pr-6">{profile.targetCollege.name}</h3>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sticker Price Today:</span>
                  <span className="font-medium">{formatCurrency(calculateTotalCollegeCost(profile.targetCollege) / 4)}/yr</span>
                </div>
                
                <div className="pt-2 border-t border-gray-50">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">4-Year Total (Today)</span>
                      <p className="text-lg font-bold text-gray-700">{formatCurrency(calculateTotalCollegeCost(profile.targetCollege))}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-orange-500 uppercase">Projected Total ({yearsToCollege}y)</span>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(inflatedCost)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-orange-50 p-2 rounded flex items-start space-x-2">
                <Info className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-orange-700 leading-tight">
                  With {profile.collegeInflationRate ?? 4.5}% inflation, college will cost {((inflatedCost / calculateTotalCollegeCost(profile.targetCollege) - 1) * 100).toFixed(0)}% more by the time they start.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <School className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No target college selected</p>
            </div>
          )}

          {!isManual && <CollegeSearch onSelect={handleCollegeSelect} />}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;