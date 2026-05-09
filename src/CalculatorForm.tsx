import { ChildProfile, CollegeData } from './types';
import CollegeSearch from './CollegeSearch';
import { School, X } from 'lucide-react';
import { formatCurrency, calculateTotalCollegeCost } from './utils';

interface CalculatorFormProps {
  profile: ChildProfile;
  onChange: (profile: ChildProfile) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ profile, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...profile,
      [name]: name === 'name' || name === 'collegeStartDate' ? value : parseFloat(value) || 0,
    });
  };

  const handleCollegeSelect = (college: CollegeData) => {
    onChange({
      ...profile,
      targetCollege: college,
    });
  };

  const clearCollege = () => {
    onChange({
      ...profile,
      targetCollege: undefined,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kid Details</h2>
          <div className="space-y-4">
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

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Financials</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial ($)</label>
              <input
                type="number"
                name="initialBalance"
                value={profile.initialBalance}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly ($)</label>
              <input
                type="number"
                name="monthlyContribution"
                value={profile.monthlyContribution}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return (%)</label>
              <input
                type="number"
                name="expectedReturnRate"
                value={profile.expectedReturnRate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <School className="h-5 w-5 mr-2 text-blue-600" />
            Target College
          </h2>
          
          {profile.targetCollege ? (
            <div className="bg-white p-4 rounded border border-blue-100 relative">
              <button 
                onClick={clearCollege}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-bold text-lg text-blue-800">{profile.targetCollege.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tuition (In-State):</span>
                  <span className="font-medium">{formatCurrency(profile.targetCollege.tuitionInState || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room & Board:</span>
                  <span className="font-medium">{formatCurrency(profile.targetCollege.roomAndBoard || 0)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between text-base font-bold text-gray-900">
                  <span>Est. 4-Year Cost:</span>
                  <span>{formatCurrency(calculateTotalCollegeCost(profile.targetCollege))}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No target college selected. Use the search below to find one.</p>
          )}

          <CollegeSearch onSelect={handleCollegeSelect} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;