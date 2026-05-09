import { useState, useMemo, useEffect } from 'react';
import { Calculator, Plus, User, Trash2, Share2, Cloud, CloudOff } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import CalculatorForm from './CalculatorForm';
import GrowthChart from './GrowthChart';
import SummaryStats from './SummaryStats';
import { ChildProfile } from './types';
import { calculate529Growth, calculateTotalCollegeCost } from './utils';

function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState('1');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Initialize Family ID from URL or generate new one
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('family');
    
    if (!id) {
      id = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?family=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
    
    setFamilyId(id);
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!familyId) return;

    const docRef = doc(db, 'families', familyId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profiles) setProfiles(data.profiles);
        if (data.activeId) setActiveId(data.activeId);
      } else {
        // Initialize new family in cloud if it doesn't exist
        const initialProfiles = [
          {
            id: '1',
            name: 'Kid 1',
            initialBalance: 5000,
            monthlyContribution: 250,
            expectedReturnRate: 7.0,
            collegeStartDate: '2035-09',
          }
        ];
        setDoc(docRef, { profiles: initialProfiles, activeId: '1' });
      }
      setIsSyncing(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeId) || profiles[0] || {
      id: '1',
      name: 'Loading...',
      initialBalance: 0,
      monthlyContribution: 0,
      expectedReturnRate: 0,
      collegeStartDate: '2030-01',
    }, 
  [profiles, activeId]);

  const calculationResult = useMemo(() => 
    calculate529Growth(activeProfile), 
  [activeProfile]);

  const targetCost = useMemo(() => 
    calculateTotalCollegeCost(activeProfile.targetCollege),
  [activeProfile.targetCollege]);

  const pushToCloud = (newProfiles: ChildProfile[], newActiveId?: string) => {
    if (!familyId) return;
    setDoc(doc(db, 'families', familyId), { 
      profiles: newProfiles, 
      activeId: newActiveId || activeId 
    }, { merge: true });
  };

  const updateProfile = (updated: ChildProfile) => {
    const newProfiles = profiles.map(p => p.id === updated.id ? updated : p);
    setProfiles(newProfiles);
    pushToCloud(newProfiles);
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
    const newProfiles = [...profiles, newProfile];
    setProfiles(newProfiles);
    setActiveId(newId);
    pushToCloud(newProfiles, newId);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length === 1) return;
    const filtered = profiles.filter(p => p.id !== id);
    setProfiles(filtered);
    const newActive = activeId === id ? filtered[0].id : activeId;
    if (activeId === id) setActiveId(newActive);
    pushToCloud(filtered, newActive);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">529 Savings Planner</h1>
              {isSyncing ? (
                <CloudOff className="h-5 w-5 text-gray-400 animate-pulse" />
              ) : (
                <Cloud className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              Family ID: <span className="font-mono font-bold ml-1 text-blue-600">{familyId}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyShareLink}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
              title="Copy shareable link"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button
              onClick={addProfile}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setActiveId(p.id);
                pushToCloud(profiles, p.id);
              }}
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