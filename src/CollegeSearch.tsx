import { useState, useEffect } from 'react';
import { Search, School, Loader2 } from 'lucide-react';
import { CollegeData } from './types';

interface CollegeSearchProps {
  onSelect: (college: CollegeData) => void;
}

const API_KEY = import.meta.env.VITE_COLLEGE_SCORECARD_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

const CollegeSearch: React.FC<CollegeSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 3) { // Require 4+ chars to save requests
        searchColleges();
      } else {
        setResults([]);
        setError(null);
      }
    }, 800); // Wait longer (800ms) to ensure they finished typing

    return () => clearTimeout(timer);
  }, [query]);

  const searchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}?api_key=${API_KEY}&school.name=${encodeURIComponent(query)}&fields=id,school.name,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.cost.roomboard.oncampus,latest.cost.attendance.academic_year,latest.type&per_page=20`
      );
      
      if (response.status === 429) {
        setError('Government API limit reached. Try again in an hour or enter manually.');
        return;
      }

      const data = await response.json();
      setResults(data.results || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Search unavailable. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (school: any) => {
    // robust year check
    const apiDataYear = new Date().getFullYear() - 2; 

    // Robust data sniffer: The API sometimes returns nulls or zero for certain fields.
    // We prioritize the total Cost of Attendance (COA), then fall back to summing parts.
    const coa = school['latest.cost.attendance.academic_year'];
    const tuition = school['latest.cost.tuition.in_state'] || school['latest.cost.tuition.out_of_state'];
    const rb = school['latest.cost.roomboard.oncampus'];

    onSelect({
      id: school.id,
      name: school['school.name'],
      tuitionInState: school['latest.cost.tuition.in_state'] || 0,
      tuitionOutState: school['latest.cost.tuition.out_of_state'] || 0,
      roomAndBoard: rb || 0,
      costOfAttendance: coa || (tuition && rb ? (tuition + rb) : (tuition || coa || 0)),
      dataYear: apiDataYear,
    });
    setQuery('');
    setShowDropdown(false);
    setError(null);
  };

  return (
    <div className="relative mt-4 pt-4 border-t border-gray-100">
      <label className="block text-sm font-medium text-gray-700 mb-2">Target College Lookup</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a college..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[10px] text-red-500 font-medium">{error}</p>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((school) => (
            <div
              key={school.id}
              onClick={() => handleSelect(school)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white text-gray-900"
            >
              <div className="flex items-center">
                <School className="h-4 w-4 mr-2" />
                <span className="font-normal block truncate">{school['school.name']}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegeSearch;