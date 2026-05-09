import { useState, useMemo, useEffect } from 'react';
import { Calculator, Plus, User, Trash2, Cloud, CloudOff, Loader2 } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const familyId = 'primary-family-shared';

  // Force clean URL
  useEffect(() => {
    if (window.location.search) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, []);

  // Sync with Firestore
  useEffect(() => {
    console.log("Connecting to cloud...");
    const docRef = doc(db, 'families', familyId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Cloud data received:", data);
        if (data.profiles && data.profiles.length > 0) {
          setProfiles(data.profiles);
          if (data.activeId) setActiveId(data.activeId);
        }
      } else {
        console.log("No cloud data found, initializing...");
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
      setHasLoaded(true);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);

  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeId) || profiles[0];
  }, [profiles, activeId]);

  const calculationResult = useMemo(() => {
    if (!activeProfile) return null;
    return calculate529Growth(activeProfile);
  }, [activeProfile]);

  const targetCost = useMemo(() => {
    if (!activeProfile) return 0;
    return calculateTotalCollegeCost(activeProfile.targetCollege);
  }, [activeProfile.targetCollege]);

  const pushToCloud = (newProfiles: ChildProfile[], newActiveId?: string) => {
    if (!hasLoaded) return; // Never save if we haven't finished loading
    console.log("Saving to cloud...");
    setDoc(doc(db, 'families', familyId), { 
      profiles: newProfiles, 
      activeId: newActiveId || activeId 
    }, { merge: true });
  };

  const updateProfile = (updated: ChildProfile) => {
    if (!hasLoaded) return;
    const newProfiles = profiles.map(p => p.id === updated.id ? updated : p);
    setProfiles(newProfiles);
    pushToCloud(newProfiles);
  };

  const addProfile = () => {
    if (!hasLoaded) return;
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
    if (profiles.length <= 1) return;
    const filtered = profiles.filter(p => p.id !== id);
    const newActive = activeId === id ? filtered[0].id : activeId;
    setProfiles(filtered);
    setActiveId(newActive);
    pushToCloud(filtered, newActive);
  };

  if (!hasLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Connecting to family data...</p>
      </div>
    );
  }

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
          </div>
          
          <div className="flex items-center space-x-2">
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

        {activeProfile && (
          <>
            <CalculatorForm profile={activeProfile} onChange={updateProfile} />
            {calculationResult && (
              <>
                <SummaryStats result={calculationResult} targetCost={targetCost} />
                <GrowthChart data={calculationResult.yearlyData} />
              </>
            )}
          </>
        )}
        
        <div className="mt-8 text-sm text-gray-500 text-center bg-white p-4 rounded-lg shadow-inner">
          <p className="font-semibold text-gray-700 mb-1">Shared Family Planner</p>
          <p>
            This data is shared across your family. Any changes you make are saved instantly to the cloud.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;