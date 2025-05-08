import React from 'react';
import useDebounce from '../hooks/useDebounce';

export interface FilterOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  onSearch: (term: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onFilterChange: (filterId: string) => void;
  onReset: () => void;
  searchPlaceholder?: string;
  startDate: string;
  endDate: string;
  searchTerm: string;
  filterOptions: FilterOption[];
  currentFilter: string;
  isLoading?: boolean;
  filterLabel?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onDateRangeChange,
  onFilterChange,
  onReset,
  searchPlaceholder = 'Search...',
  startDate,
  endDate,
  searchTerm,
  filterOptions,
  currentFilter,
  isLoading = false,
  filterLabel = 'Filter By'
}) => {
  // Use debounce for search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Call search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== null) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
  };
  
  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange(e.target.value, endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange(startDate, e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <form className="w-full flex flex-col md:flex-row gap-4">
        {/* Filter Dropdown */}
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {filterLabel}
          </label>
          <select
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentFilter}
            onChange={handleFilterChange}
            disabled={isLoading}
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Range */}
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={startDate}
            onChange={handleStartDateChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={endDate}
            onChange={handleEndDateChange}
            disabled={isLoading}
          />
        </div>
        
        {/* Search Input */}
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onReset}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-r-md hover:bg-gray-300 focus:outline-none"
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterBar; 