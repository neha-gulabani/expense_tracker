import React from 'react';
import { DatePicker } from '../../components/DatePicker/DatePicker';
import { Select } from '../../components/Select/Select';

interface FilterValues {
  startDate: string;
  endDate: string;
  category: string;
  minAmount: string;
  maxAmount: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface FilterExpensesProps {
  filterValues: FilterValues;
  handleFilterChange: (key: keyof FilterValues, value: string) => void;
  resetFilters: () => void;
  categoryOptions: CategoryOption[];
  handleCategoryChange: (value: string) => void;
}

const FilterExpenses: React.FC<FilterExpensesProps> = ({
  filterValues,
  handleFilterChange,
  resetFilters,
  categoryOptions,
  handleCategoryChange
}) => {
  return <div className="bg-white p-4 rounded-lg shadow mb-6">
  <h2 className="text-lg font-semibold mb-4">Filters</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Start Date
      </label>
      <DatePicker
        value={filterValues.startDate}
        onChange={(date) => handleFilterChange('startDate', date)}
        placeholder="Start Date"
        className="w-full"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        End Date
      </label>
      <DatePicker
        value={filterValues.endDate}
        onChange={(date) => handleFilterChange('endDate', date)}
        placeholder="End Date"
        className="w-full"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category
      </label>
      <Select
        options={categoryOptions}
        value={filterValues.category}
        onChange={handleCategoryChange}
        placeholder="Select Category"
        className="w-full"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Min Amount
      </label>
      <input
        type="number"
        value={filterValues.minAmount}
        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
        placeholder="Min Amount"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Max Amount
      </label>
      <input
        type="number"
        value={filterValues.maxAmount}
        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
        placeholder="Max Amount"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
    <div className="flex items-end">
      <button
        onClick={resetFilters}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  </div>
</div>;
};

export default FilterExpenses;

