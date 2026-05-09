import { useState, useMemo, useEffect } from 'react';
import { Calculator, Plus, User, Trash2 } from 'lucide-react';
import CalculatorForm from './CalculatorForm';
import GrowthChart from './GrowthChart';
import SummaryStats from './SummaryStats';
import { ChildProfile } from './types';
import { calculate529Growth, calculateTotalCollegeCost } from './utils';

function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem('529_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profiles', e);
      }
    }
    return [
      {
        id: '1',
        name: 'Kid 1',
        initialBalance: 5000,
        monthlyContribution: 250,
        expectedReturnRate: 7.0,
        collegeStartDate: '2035-09',
      }
    ];
  });

  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem('529_activeId') || '1';
  });

  // Save to localStorage whenever profiles or activeId change
  useMemo(() => {
    localStorage.setItem('529_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useMemo(() => {
    localStorage.setItem('529_activeId', activeId);
  }, [activeId]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeId) || profiles[0], 
  [profiles, activeId]);

  const calculationResult = useMemo(() => 
    calculate529Growth(activeProfile), 
  [activeProfile]);

  const targetCost = useMemo(() => 
    calculateTotalCollegeCost(activeProfile.targetCollege),
  [activeProfile.targetCollege]);

  const updateProfile = (updated: ChildProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addProfile = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newProfile: ChildProfile = {
      id: newId,
      name: `Kid ${profiles.length + 1}`,
      initialBalance: 0,
      monthlyContribution: 100,
      expectedReturnRate: 7.0,
      collegeStartDate: '2040-09',
    };
    setProfiles([...profiles, newProfile]);
    setActiveId(newId);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length === 1) return;
    const filtered = profiles.filter(p => p.id !== id);
    setProfiles(filtered);
    if (activeId === id) setActiveId(filtered[0].id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">529 Savings Planner</h1>
          </div>
          <button
            onClick={addProfile}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeId === p.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">{p.name}</span>
              {profiles.length > 1 && (
                <Trash2 
                  className={`h-3.5 w-3.5 hover:text-red-300 ${activeId === p.id ? 'text-blue-200' : 'text-gray-400'}`} 
                  onClick={(e) => deleteProfile(p.id, e)}
                />
              )}
            </button>
          ))}
        </div>

        <CalculatorForm profile={activeProfile} onChange={updateProfile} />
        
        <SummaryStats result={calculationResult} targetCost={targetCost} />
        
        <GrowthChart data={calculationResult.yearlyData} targetCost={targetCost} />
        
        <div className="mt-8 text-sm text-gray-500 text-center bg-white p-4 rounded-lg shadow-inner">
          <p className="font-semibold text-gray-700 mb-1">How it works</p>
          <p>
            Projections are based on monthly compounding. College costs are estimated as (Tuition + Room & Board) × 4 years.
            Data provided by the US Dept. of Education College Scorecard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;