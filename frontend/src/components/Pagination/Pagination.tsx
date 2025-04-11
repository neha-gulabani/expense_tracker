import React from 'react';
import { Button } from '../Button/Button';

interface PaginationProps {
  currentPage?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Props used in Expenses.tsx
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onChangePage?: (newPage: number) => void;
  onChangeRowsPerPage?: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // Support for alternative prop names
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  className = '',
}) => {
  // Use either the primary props or the alternative ones
  const effectiveCurrentPage = currentPage !== undefined ? currentPage : (page !== undefined ? page : 0);
  const effectiveTotalItems = totalItems !== undefined ? totalItems : (count !== undefined ? count : 0);
  const effectivePageSize = pageSize !== undefined ? pageSize : (rowsPerPage !== undefined ? rowsPerPage : 10);
  const effectiveOnPageChange = onPageChange || onChangePage || (() => {});
  const effectiveOnPageSizeChange = onPageSizeChange || onChangeRowsPerPage || (() => {});
  
  const totalPages = Math.max(1, Math.ceil(effectiveTotalItems / effectivePageSize));
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    effectiveOnPageSizeChange(Number(e.target.value));
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between py-4 ${className}`}>
      <div className="flex-1 text-sm text-gray-500 mb-2 sm:mb-0">
        Showing {Math.min(effectivePageSize, effectiveTotalItems - effectiveCurrentPage * effectivePageSize)} of {effectiveTotalItems} items
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rows per page</span>
          <select
            value={effectivePageSize}
            onChange={handlePageSizeChange}
            className="h-8 rounded-md border border-gray-300 bg-transparent px-2 py-1 text-sm"
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="mx-2">
            Page {effectiveCurrentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => effectiveOnPageChange(0)}
            disabled={effectiveCurrentPage === 0}
            aria-label="First page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => effectiveOnPageChange(effectiveCurrentPage - 1)}
            disabled={effectiveCurrentPage === 0}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => effectiveOnPageChange(effectiveCurrentPage + 1)}
            disabled={effectiveCurrentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => effectiveOnPageChange(totalPages - 1)}
            disabled={effectiveCurrentPage >= totalPages - 1}
            aria-label="Last page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
