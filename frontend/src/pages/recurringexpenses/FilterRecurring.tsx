import React from 'react';
import { Select } from '../../components/Select/Select';
import { Button } from '../../components/Button/Button';
import { Category } from '../../types';

interface FilterValues {
  category: string;
  minAmount: string;
  maxAmount: string;
  isActive?: boolean;
}

interface FilterRecurringProps {
  filters: FilterValues;
  categories: Category[];
  handleFilterChange: (key: keyof FilterValues, value: string | boolean | undefined) => void;
  resetFilters: () => void;
}

const FilterRecurring: React.FC<FilterRecurringProps> = ({
  filters,
  categories,
  handleFilterChange,
  resetFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((category) => ({
                value: category._id,
                label: category.name
              }))
            ]}
            placeholder="Filter by Category"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Amount
          </label>
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Amount
          </label>
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.isActive?.toString() || ''}
            onChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            placeholder="Filter by Status"
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={resetFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterRecurring;