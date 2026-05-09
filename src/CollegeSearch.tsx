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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchColleges();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchColleges = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}?api_key=${API_KEY}&school.name=${query}&fields=id,school.name,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.cost.roomboard.oncampus&per_page=5`
      );
      const data = await response.json();
      setResults(data.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (school: any) => {
    onSelect({
      id: school.id,
      name: school['school.name'],
      tuitionInState: school['latest.cost.tuition.in_state'],
      tuitionOutState: school['latest.cost.tuition.out_of_state'],
      roomAndBoard: school['latest.cost.roomboard.oncampus'],
    });
    setQuery('');
    setShowDropdown(false);
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