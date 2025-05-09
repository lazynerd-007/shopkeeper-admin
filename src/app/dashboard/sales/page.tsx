'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './sales-page.module.css';
import env from '../../../utils/env';

// Transaction type based on the API response
interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  productId: string;
}

interface PaymentItem {
  id: string;
  amountPaid: number;
  paymentMethod: string;
  paymentRef: string;
  currency: string;
  updatedAt: string;
}

// Customer interface to replace any
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // Add any other fields that might be in the customer object
}

interface Transaction {
  id: string;
  transactionReference: string;
  totalPriceAfterProductDiscount: number;
  totalPriceBeforeProductDiscount: number;
  amountToPay: number;
  amountPaid: number;
  balance: number;
  isPayLater: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer | null;
  cashier: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
  };
  branch: {
    id: string;
    name: string;
    contactEmail: string;
    phoneNumber: string;
    branchNumber: string;
  };
  store: {
    id: string;
    name: string;
    contactEmail: string;
    businessEmail: string;
    phoneNumber: string;
  };
  sales: SaleItem[];
  payments: PaymentItem[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    docs: Transaction[];
  };
}

// Store interface
interface Store {
  id: string;
  name: string;
  contactEmail: string;
  businessEmail: string;
  phoneNumber: string;
}

// Stores API response type
interface StoresApiResponse {
  status: boolean;
  message: string;
  data: Store[];
}

// Format date to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency with thousands separator
const formatCurrency = (amount: number, currency: string = 'GHS') => {
  // Use en-US locale to ensure commas for thousands
  return `${currency} ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2,
    useGrouping: true
  })}`;
};

// Add a skeleton loader component
const SkeletonLoader = () => (
  <div className="flex items-center justify-between">
    <div>
      <div className="h-5 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
  </div>
);

export default function SalesPage() {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add loading state specifically for stats cards
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  
  // Store list for filter dropdown
  const [storeList, setStoreList] = useState<{ id: string; name: string }[]>([]);
  
  // State for total statistics
  const [totalStats, setTotalStats] = useState({
    totalSales: null as number | null,
    totalTransactions: null as number | null,
    averageTransaction: null as number | null
  });
  
  // Add a ref to track if this is the initial render
  const isInitialMount = useRef(true);
  
  // Add a ref to track the last API URL fetched
  const lastFetchedUrl = useRef<string>('');
  
  // Validate and format dates
  const validateAndFormatDates = useCallback(() => {
    try {
      let formattedStartDate = null;
      let formattedEndDate = null;
      
      // Simple validation for YYYY-MM-DD format
      const isValidDateFormat = (dateStr: string) => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
      };
      
      if (startDate) {
        if (!isValidDateFormat(startDate)) {
          throw new Error('Start date must be in YYYY-MM-DD format');
        }
        
        // Ensure the date is valid (e.g., not 2023-02-31)
        const date = new Date(startDate);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid start date');
        }
        
        formattedStartDate = startDate;
      }
      
      if (endDate) {
        if (!isValidDateFormat(endDate)) {
          throw new Error('End date must be in YYYY-MM-DD format');
        }
        
        // Ensure the date is valid
        const date = new Date(endDate);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid end date');
        }
        
        formattedEndDate = endDate;
      }
      
      return { formattedStartDate, formattedEndDate, isValid: true };
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid date format';
      return { 
        formattedStartDate: null, 
        formattedEndDate: null, 
        isValid: false, 
        error: errorMessage
      };
    }
  }, [startDate, endDate]);
  
  // Debug utility to check localStorage
  const debugLocalStorage = useCallback(() => {
    const token = localStorage.getItem('token');
    const storeId = localStorage.getItem('storeId');
    console.log('localStorage debug:');
    console.log('- token exists:', !!token);
    console.log('- storeId:', storeId);
  }, []);
  
  // Fetch total summary data for all stores regardless of pagination
  const fetchTotalSummary = useCallback(async (storeId: string = 'all') => {
    setIsLoadingStats(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view summary data');
      }
      
      // Set up headers
      const headers: Record<string, string> = {
        'D-UUID': '645545453533',
        'Authorization': `Bearer ${token}`
      };
      
      // Get the default store ID from localStorage
      const defaultStoreId = localStorage.getItem('storeId');
      
      // Add S-UUID header based on the context
      if (storeId !== 'all') {
        // When filtering by specific store, set the S-UUID to that store
        headers['S-UUID'] = storeId;
      } else if (defaultStoreId) {
        // When showing all stores, use the default store ID for authentication
        headers['S-UUID'] = defaultStoreId;
      }
      
      // Build params for the merchant summary endpoint
      const params = new URLSearchParams({
        page: '1',
        limit: '100',  // Get a reasonably large result set
        search: '',
        status: '',
        startDate: '',
        endDate: ''
      });
      
      // If specific store, add that as a parameter
      if (storeId !== 'all') {
        params.append('storeId', storeId);
      }
      
      // Use the merchant summary endpoint for all cases
      const summaryUrl = `${env.API_BASE_URL}/stores/summary/merchant?${params.toString()}`;
      
      console.log('Fetching merchant summary from:', summaryUrl);
      
      const summaryResponse = await fetch(summaryUrl, {
        method: 'GET',
        headers: headers
      });
      
      if (!summaryResponse.ok) {
        throw new Error(`HTTP Error: ${summaryResponse.status} ${summaryResponse.statusText}`);
      }
      
      const summaryData = await summaryResponse.json();
      
      if (!summaryData.status) {
        throw new Error(summaryData.message || 'Failed to fetch merchant summary data');
      }
      
      if (storeId !== 'all') {
        // For specific store, find matching store in response
        let storeData = null;
        
        if (summaryData.data && Array.isArray(summaryData.data.docs)) {
          // Look for the specific store in the merchant summary data
          storeData = summaryData.data.docs.find((m: { id: string }) => m.id === storeId);
        }
        
        if (storeData) {
          // Update stats with accurate data from merchant summary
          setTotalStats({
            totalSales: storeData.transactionAmount || 0,
            totalTransactions: storeData.transactionCount || 0,
            averageTransaction: storeData.transactionCount > 0 
              ? storeData.transactionAmount / storeData.transactionCount 
              : 0
          });
        } else {
          // No store data found
          setTotalStats({
            totalSales: null,
            totalTransactions: null,
            averageTransaction: null
          });
        }
      } else {
        // For all stores, aggregate the data from all merchants
        if (summaryData.data && Array.isArray(summaryData.data.docs)) {
          const merchants = summaryData.data.docs;
          
          // Calculate totals across all merchants
          let totalAmount = 0;
          let totalCount = 0;
          
          merchants.forEach((merchant: { transactionAmount?: number; transactionCount?: number }) => {
            totalAmount += merchant.transactionAmount || 0;
            totalCount += merchant.transactionCount || 0;
          });
          
          // Calculate average transaction
          const averageTransaction = totalCount > 0 ? totalAmount / totalCount : 0;
          
          setTotalStats({
            totalSales: totalAmount,
            totalTransactions: totalCount,
            averageTransaction: averageTransaction
          });
        } else {
          // No data available
          setTotalStats({
            totalSales: null,
            totalTransactions: null,
            averageTransaction: null
          });
        }
      }
    } catch (err) {
      console.error('Error fetching transaction summary:', err);
      setTotalStats({
        totalSales: null,
        totalTransactions: null,
        averageTransaction: null
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);
  
  // Fetch transactions data
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingStats(true);
    setError(null);
    
    console.log('fetchTransactions called with storeFilter:', storeFilter);
    debugLocalStorage();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view sales data');
      }
      
      // Validate and format dates
      const { formattedStartDate, formattedEndDate, isValid, error } = validateAndFormatDates();
      
      if (!isValid) {
        throw new Error(`Date validation error: ${error}`);
      }
      
      // Build base URL - avoid using /stores/ path that causes CORS issues
      // Use the main endpoint with appropriate headers for all requests
      let url = `${env.API_BASE_URL}/sales/shops-transactions`;
      
      // Create URLSearchParams object for proper parameter handling
      const params = new URLSearchParams();
      
      // Add pagination params
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Add search param
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm);
      }
      
      // Add date params if they exist
      if (formattedStartDate) {
        params.append('startDate', formattedStartDate);
      }
      
      if (formattedEndDate) {
        params.append('endDate', formattedEndDate);
      }
      
      // For all stores, explicitly request all stores data
      if (storeFilter === 'all') {
        params.append('getAllStores', 'true');
      }
      
      // Complete URL with params
      url = `${url}?${params.toString()}`;
      
      // Skip fetching if the URL is the same as the last one
      // This prevents unnecessary refreshes
      if (url === lastFetchedUrl.current) {
        console.log('Skipping fetch - URL unchanged:', url);
        setIsLoading(false);
        setIsLoadingStats(false);
        return;
      }
      
      // Store the current URL for future comparison
      lastFetchedUrl.current = url;
      
      // Log the URL for debugging
      console.log('API URL:', url);
      
      // Set up headers
      const headers: Record<string, string> = {
        'D-UUID': '645545453533',
        'Authorization': `Bearer ${token}`
      };
      
      // Get the default store ID from localStorage
      const defaultStoreId = localStorage.getItem('storeId');
      
      // Add S-UUID header based on the context
      if (storeFilter !== 'all') {
        // When filtering by store, set the S-UUID to that store
        headers['S-UUID'] = storeFilter;
        console.log('Added specific store filter for:', storeFilter);
      } else if (defaultStoreId) {
        // When showing all stores, use the default store ID for authentication
        console.log('Using default storeId from localStorage:', defaultStoreId);
        headers['S-UUID'] = defaultStoreId;
      } else {
        console.log('No storeId available in localStorage');
      }
      
      console.log('Request headers:', headers);
      
      // Make the request
      console.log('Making API request to:', url);
      console.log('With headers:', JSON.stringify(headers));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Log the API response for debugging
      console.log('API Response:', data);
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch transactions data');
      }
      
      console.log('Number of transactions:', data.data.docs.length);
      console.log('Store IDs in response:', [...new Set(data.data.docs.map((t: Transaction) => t.store.id))]);
      console.log('Store names in response:', [...new Set(data.data.docs.map((t: Transaction) => t.store.name))]);
      
      // Filter transactions by store if needed
      let filteredDocs = [...data.data.docs];
      
      // If we're filtering by a specific store, ensure that's all we display
      if (storeFilter !== 'all') {
        const beforeCount = filteredDocs.length;
        filteredDocs = filteredDocs.filter((transaction: Transaction) => transaction.store.id === storeFilter);
        const afterCount = filteredDocs.length;
        
        console.log(`Store filter check: ${beforeCount} → ${afterCount} transactions`);
        
        if (beforeCount > 0 && afterCount === 0) {
          console.warn('No transactions found for the selected store. Check store ID:', storeFilter);
        }
        
        // For a specific store, if there are no transactions after filtering,
        // we need to set the total items and pages to 0
        if (afterCount === 0) {
          setTotalItems(0);
          setTotalPages(0);
        }
      }
      
      // Update states
      setFilteredTransactions(filteredDocs);
      
      // Only update pagination info if we're not filtering by store, 
      // or if we have filtered results
      if (storeFilter === 'all' || filteredDocs.length > 0) {
        setTotalPages(data.data.pages);
        setTotalItems(data.data.total);
        setItemsPerPage(data.data.limit);
      }
      
      // Update summary stats with current store filter
      // Use a simple function call rather than an IIFE to avoid creating a new function on each render
      fetchTotalSummary(storeFilter);
      
    } catch (err: Error | unknown) {
      console.error('Error fetching transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      setFilteredTransactions([]);
      setIsLoadingStats(false);
    } finally {
      setIsLoading(false);
    }
  }, [storeFilter, currentPage, itemsPerPage, searchTerm, validateAndFormatDates, debugLocalStorage, fetchTotalSummary]);
  
  // Fetch stores from the API
  const fetchStores = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view store data');
      }
      
      const response = await fetch(`${env.API_BASE_URL}/stores/merchants`, {
        method: 'GET',
        headers: {
          'D-UUID': '645545453533',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to fetch stores:', errorData);
        throw new Error(`Failed to fetch stores: ${response.status} ${response.statusText}`);
      }
      
      const data: StoresApiResponse = await response.json();
      
      // Log the API response for debugging
      console.log('Stores API Response:', data);
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch stores data');
      }
      
      // Make sure we have store data
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn('No stores found in API response');
      }
      
      // Map store data to the format needed for the dropdown
      const stores = data.data.map((store: Store) => ({
        id: store.id,
        name: store.name
      }));
      
      console.log('Setting store list:', stores);
      setStoreList(stores);
      
      return stores;
    } catch (err: Error | unknown) {
      console.error('Error fetching stores:', err);
      // Don't set the main error state to avoid disrupting the transactions view
      return [];
    }
  }, []);
  
  // Load stores and transactions when component mounts
  useEffect(() => {
    // Reset store filter to 'all' to show all stores on initial load
    setStoreFilter('all');
    
    // Load stores first, then transactions
    const loadData = async () => {
      try {
        // Clear any previous filters on initial load
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        
        await fetchStores();
        // Force the initial load to get all stores data - this will also fetch summary data
        fetchTransactions();
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure this only runs once on mount
  
  // Fetch transactions when page or store filter changes
  useEffect(() => {
    // Skip the first render, as loadData already calls fetchTransactions
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Fetch data when store filter changes, even if isLoading is true
    if (storeFilter) {
      fetchTransactions();
    }
  }, [currentPage, storeFilter, fetchTransactions]);
  
  // Effect for when dates change - validate but don't fetch
  useEffect(() => {
    // Clear error when inputs change
    if (error) {
      setError(null);
    }
  }, [startDate, endDate, searchTerm, error]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates before searching
    const { isValid, error } = validateAndFormatDates();
    if (!isValid) {
      setError(error || 'Invalid date format');
      return;
    }
    
    setCurrentPage(1); // Reset to first page when searching
    fetchTransactions();
  };
  
  // Handle date input change with validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setDate: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    setDate(value);
    
    // Clear any existing errors when inputs change
    if (error) {
      setError(null);
    }
  };
  
  // Reset all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStoreFilter('all');
    setCurrentPage(1);
    setError(null);
    fetchTransactions();
  };
  
  // Handle store filter change
  const handleStoreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStoreFilter = e.target.value;
    setIsLoadingStats(true); // Show loading state when switching stores
    setIsLoading(true); // Also show loading state for the table
    setStoreFilter(newStoreFilter);
    setCurrentPage(1); // Reset to page 1 when changing stores
  };

  return (
    <div className={styles.container}>
      {/* Log statements removed to fix type error */}
      
      <div className={styles.header}>
        <h1 className={styles.title}>Sales Transactions</h1>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleClearFilters}
            className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
          <Link 
            href="/dashboard"
            className={styles.backButton}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        {/* Total Sales Card */}
        <div className={styles.statCard}>
          {isLoadingStats ? (
            <SkeletonLoader />
          ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Total Sales</p>
                <p className={styles.statValue} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(totalStats.totalSales || 0)}
                </p>
                {storeFilter !== 'all' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {storeList.find(store => store.id === storeFilter)?.name || 'Selected Store'}
                  </p>
                )}
            </div>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Total Transactions Card */}
        <div className={styles.statCard}>
          {isLoadingStats ? (
            <SkeletonLoader />
          ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Total Transactions</p>
                <p className={styles.statValue} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {totalStats.totalTransactions?.toLocaleString() || '0'}
                </p>
                {storeFilter !== 'all' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {storeList.find(store => store.id === storeFilter)?.name || 'Selected Store'}
                  </p>
                )}
            </div>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Average Transaction Card */}
        <div className={styles.statCard}>
          {isLoadingStats ? (
            <SkeletonLoader />
          ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Average Transaction</p>
                <p className={styles.statValue} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(totalStats.averageTransaction || 0)}
                </p>
                {storeFilter !== 'all' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {storeList.find(store => store.id === storeFilter)?.name || 'Selected Store'}
                  </p>
                )}
            </div>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row gap-4">
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Store</label>
          <select 
            className={styles.filterSelect}
              value={storeFilter}
              onChange={handleStoreFilterChange}
            >
              <option value="all">All Stores</option>
              {storeList.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Start Date</label>
            <input 
              type="date" 
              className={styles.filterSelect}
              value={startDate}
              onChange={(e) => handleDateChange(e, setStartDate)}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>End Date</label>
            <input 
              type="date" 
            className={styles.filterSelect}
              value={endDate}
              onChange={(e) => handleDateChange(e, setEndDate)}
            />
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Search</label>
            <div className="flex">
          <input 
            type="text" 
                placeholder="Search by reference or product"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
              <button 
                type="submit"
                className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
        </div>
        </form>
      </div>

      {/* Display error message if there's an error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Sales Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>
            {storeFilter !== 'all' 
              ? `Sales Transactions - ${storeList.find(store => store.id === storeFilter)?.name || 'Selected Store'}`
              : 'Sales Transactions'
            }
          </h2>
          <p className={styles.sectionSubtitle}>
            {isLoading ? 'Loading transactions...' : `Showing ${filteredTransactions.length} of ${totalItems} transactions
            ${storeFilter !== 'all' ? '(Filtered by store)' : ''}`}
          </p>
        </div>
        
        {isLoading ? (
          <div>
            <div className="overflow-x-auto">
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeaderRow}>
                    <th className={styles.tableHeaderCell}>ID</th>
                    <th className={styles.tableHeaderCell}>Reference</th>
                    <th className={styles.tableHeaderCell}>Date</th>
                    <th className={styles.tableHeaderCell}>Amount</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                    <th className={styles.tableHeaderCell}>Store</th>
                    <th className={styles.tableHeaderCell}>Branch</th>
                    <th className={styles.tableHeaderCell}>Cashier</th>
                    <th className={styles.tableHeaderCell}>Items</th>
                    <th className={styles.tableHeaderCell}>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className={styles.tableRow}>
                      {[...Array(10)].map((_, cellIndex) => (
                        <td key={cellIndex} className={styles.tableCell}>
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button
                disabled={true}
                className={`${styles.paginationButton} opacity-50 cursor-not-allowed`}
              >
                Previous
              </button>
              
              <span className="mx-2 text-sm text-gray-400 animate-pulse">
                Loading...
              </span>
              
              <button
                disabled={true}
                className={`${styles.paginationButton} opacity-50 cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeaderRow}>
                    <th className={styles.tableHeaderCell}>ID</th>
                    <th className={styles.tableHeaderCell}>Reference</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Amount</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                    <th className={styles.tableHeaderCell}>Store</th>
                    <th className={styles.tableHeaderCell}>Branch</th>
                    <th className={styles.tableHeaderCell}>Cashier</th>
                    <th className={styles.tableHeaderCell}>Items</th>
                <th className={styles.tableHeaderCell}>Payment Method</th>
              </tr>
            </thead>
            <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          {transaction.id}
                        </td>
                        <td className={styles.tableCell}>
                          {transaction.transactionReference}
                        </td>
                        <td className={styles.tableCell}>
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className={styles.tableCell}>
                          {formatCurrency(transaction.amountPaid)}
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          {transaction.store.name}
                        </td>
                        <td className={styles.tableCell}>
                          {transaction.branch.name}
                        </td>
                        <td className={styles.tableCell}>
                          {`${transaction.cashier.firstName} ${transaction.cashier.lastName}`}
                        </td>
                        <td className={styles.tableCell}>
                          {transaction.sales.length}
                        </td>
                        <td className={styles.tableCell}>
                          {transaction.payments.length > 0 
                            ? transaction.payments[0].paymentMethod 
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-gray-500">
                        No transactions found
                      </td>
                </tr>
                  )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className={`${styles.paginationButton} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              
              <span className="mx-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`${styles.paginationButton} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}