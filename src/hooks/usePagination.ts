import { useState, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: (totalPages: number) => void;
  resetPagination: () => void;
  canPreviousPage: (currentPage: number) => boolean;
  canNextPage: (currentPage: number, totalPages: number) => boolean;
}

/**
 * Hook to manage pagination state and logic
 */
export function usePagination(options: PaginationOptions = {}): PaginationState {
  const {
    initialPage = 1,
    initialPageSize = 20
  } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  /**
   * Go to the next page
   */
  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);
  
  /**
   * Go to the previous page
   */
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);
  
  /**
   * Go to the first page
   */
  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  /**
   * Go to the last page
   */
  const lastPage = useCallback((totalPages: number) => {
    setCurrentPage(totalPages);
  }, []);
  
  /**
   * Reset pagination to initial values
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);
  
  /**
   * Check if can go to previous page
   */
  const canPreviousPage = useCallback((page: number) => {
    return page > 1;
  }, []);
  
  /**
   * Check if can go to next page
   */
  const canNextPage = useCallback((page: number, totalPages: number) => {
    return page < totalPages;
  }, []);
  
  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    canPreviousPage,
    canNextPage
  };
}

export default usePagination; 