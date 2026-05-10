import { useState } from 'react';
import { ChildProfile, CollegeData } from './types';
import CollegeSearch from './CollegeSearch';
import { School, X, TrendingUp, Info, Calendar } from 'lucide-react';
import { formatCurrency, calculateInflatedTotalCost } from './utils';
import { differenceInMonths, parseISO, format } from 'date-fns';

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
      [name]: type === 'checkbox' ? checked : (name === 'name' || name === 'collegeStartDate' || name === 'initialBalanceDate' ? value : parseFloat(value) || 0),
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

  const currentYear = new Date().getFullYear(); // 2026
  const dataYear = profile.targetCollege?.dataYear || 2022;
  const lagYears = Math.max(0, currentYear - dataYear);
  const catchUpRate = 0.0488; // 4.88% bridge rate
  
  // The 'Real Today' cost (May 2026 baseline)
  const costTodayAnnual = (profile.targetCollege?.costOfAttendance || 0) * Math.pow(1 + catchUpRate, lagYears);
  const costTodayTotal = costTodayAnnual * 4;
  
  const today = new Date();
  const startDate = parseISO(profile.collegeStartDate);
  const monthsToStart = Math.max(0, differenceInMonths(startDate, today));
  const yearsFromTodayToStart = monthsToStart / 12;
  
  const inflatedCost = profile?.targetCollege ? calculateInflatedTotalCost(profile.targetCollege, yearsFromTodayToStart, profile.collegeInflationRate || 4.5) : 0;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Details */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Kid & Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Child Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase">College Start</label>
                <input
                  type="month"
                  name="collegeStartDate"
                  value={profile.collegeStartDate}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
              Financial Anchor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Initial Balance ($)</label>
                <input
                  type="number"
                  name="initialBalance"
                  value={profile.initialBalance}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  As of Date
                </label>
                <input
                  type="month"
                  name="initialBalanceDate"
                  value={profile.initialBalanceDate || format(new Date(), 'yyyy-MM')}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">Growth & contributions are calculated retrospectively from this date.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
              Strategy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase text-xs">Monthly Contribution ($)</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={profile.monthlyContribution}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center">
                  Return Rate (%)
                </label>
                <input
                  type="number"
                  name="expectedReturnRate"
                  value={profile.expectedReturnRate}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                name="stopContributingAtCollege"
                id="stopContributing"
                checked={profile.stopContributingAtCollege ?? true}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="stopContributing" className="text-sm font-medium text-blue-800 cursor-pointer">
                Stop contributions when college starts
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: College Target */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-200 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <School className="h-5 w-5 mr-2 text-blue-600" />
              Target College
            </h2>
            <button 
              onClick={() => setIsManual(!isManual)}
              className="text-[10px] uppercase font-bold text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              {isManual ? 'Use Search' : 'Manual Entry'}
            </button>
          </div>
          
          {isManual ? (
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">College Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Duke University"
                  value={profile.targetCollege?.name || ''}
                  onChange={handleManualCollegeChange}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Annual Cost Today ($)</label>
                <input
                  type="number"
                  name="costOfAttendance"
                  placeholder="e.g. 96000"
                  value={profile.targetCollege?.costOfAttendance || ''}
                  onChange={handleManualCollegeChange}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          ) : profile.targetCollege ? (
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
              <button 
                onClick={clearCollege}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 p-1 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mb-4">
                <h3 className="font-black text-xl text-blue-900 leading-tight pr-8">{profile.targetCollege.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
                  Verified Data Source
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase leading-none">Annual Cost (Est. {currentYear})</label>
                    <a 
                      href={profile.targetCollege.id ? `https://nces.ed.gov/collegenavigator/?id=${profile.targetCollege.id}#expenses` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-500 hover:underline flex items-center"
                    >
                      Official Page
                      <TrendingUp className="h-2.5 w-2.5 ml-1 transform rotate-45" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      name="costOfAttendance"
                      value={Math.round(costTodayAnnual)}
                      onChange={(e) => {
                        const newVal = parseFloat(e.target.value) || 0;
                        const baseVal = newVal / Math.pow(1 + catchUpRate, lagYears);
                        handleManualCollegeChange({ target: { name: 'costOfAttendance', value: baseVal.toString() } } as any);
                      }}
                      className="w-full p-3 text-2xl font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-[10px] font-bold text-blue-300 uppercase">{currentYear}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">4yr Total ({currentYear})</span>
                      <p className="text-md font-bold text-gray-600">{formatCurrency(costTodayTotal)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-orange-500 uppercase block mb-1">Future 4yr Total ({yearsFromTodayToStart.toFixed(1)}y)</span>
                      <p className="text-md font-bold text-orange-600">{formatCurrency(inflatedCost)}</p>
                    </div>
                </div>
              </div>
              
              <div className="mt-5 bg-orange-50 p-3 rounded-lg flex items-start space-x-2 border border-orange-100">
                <Info className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 w-full">
                  <p className="text-[11px] text-orange-800 leading-tight font-medium">
                    With <strong>{profile.collegeInflationRate ?? 4.5}%</strong> inflation, her first year will cost <strong>{formatCurrency(costTodayAnnual * Math.pow(1 + (profile.collegeInflationRate ?? 4.5)/100, yearsFromTodayToStart))}</strong> (<strong>{((Math.pow(1 + (profile.collegeInflationRate ?? 4.5)/100, yearsFromTodayToStart) - 1) * 100).toFixed(1)}%</strong> more than today).
                  </p>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-orange-400 uppercase">Adjust Inflation Rate</label>
                    <input
                      type="number"
                      name="collegeInflationRate"
                      value={profile.collegeInflationRate ?? 4.5}
                      onChange={(e) => {
                        handleChange(e);
                        // Also trigger a re-calculation of the bridged price if we want it to be super responsive
                      }}
                      className="w-full p-1.5 text-xs bg-white border border-orange-200 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-inner">
              <School className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">Search for a college below to begin</p>
            </div>
          )}

          {!isManual && <div className="mt-6"><CollegeSearch onSelect={handleCollegeSelect} /></div>}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;