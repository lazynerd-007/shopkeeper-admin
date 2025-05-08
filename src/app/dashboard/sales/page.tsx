'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './sales-page.module.css';

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
  <div className="animate-pulse flex space-x-4 w-full">
    <div className="flex-1 space-y-4 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
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
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0
  });
  
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
        throw new Error('You must be logged in to view sales data');
      }
      
      // Get the default store ID from localStorage
      const defaultStoreId = localStorage.getItem('storeId');
      
      // Set up headers
      const headers: Record<string, string> = {
        'D-UUID': '645545453533',
        'Authorization': `Bearer ${token}`
      };
      
      // If fetching for a specific store, use that store's ID
      // Otherwise, fall back to the default store ID for authentication
      if (storeId !== 'all') {
        headers['S-UUID'] = storeId;
        console.log('Fetching summary for specific store:', storeId);
      } else if (defaultStoreId) {
        headers['S-UUID'] = defaultStoreId;
      }
      
      // For the initial query, we need to get the total transaction count
      // We'll use different approaches for "all stores" vs "specific store"
      let url;
      
      if (storeId === 'all') {
        // For all stores, first fetch just the total count
        url = 'https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/sales/shops-transactions?limit=1&page=1&getAllStores=true';
      } else {
        // For a specific store, use storeId in the header
        url = 'https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/sales/shops-transactions?limit=1&page=1';
      }
      
      console.log('Fetching count data via transactions endpoint:', url);
      console.log('With headers:', JSON.stringify(headers));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Transaction count data:', data);
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch summary data');
      }
      
      // Get the total transaction count based on the current filter
      let totalTransactions = 0;
      
      if (data.data && typeof data.data.total === 'number') {
        if (storeId !== 'all') {
          // For a specific store, we get the exact count from the API
          totalTransactions = data.data.total;
        } else {
          // For all stores view, we need to get the true total count
          totalTransactions = data.data.total;
        }
        
        // Now fetch a representative sample to calculate total sales and average
        try {
          // Determine an appropriate sample size - larger for all stores
          const sampleSize = storeId === 'all' ? 200 : Math.min(totalTransactions, 100);
          
          // Build the sample URL based on the store filter
          const sampleUrl = 'https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/sales/shops-transactions';
          const params = new URLSearchParams();
          params.append('limit', sampleSize.toString());
          params.append('page', '1');
          
          if (storeId === 'all') {
            params.append('getAllStores', 'true');
          }
          
          const finalSampleUrl = `${sampleUrl}?${params.toString()}`;
          
          console.log(`Fetching sample of ${sampleSize} transactions for calculations`);
          console.log('Sample URL:', finalSampleUrl);
          
          const sampleResponse = await fetch(finalSampleUrl, {
            method: 'GET',
            headers: headers
          });
          
          if (!sampleResponse.ok) {
            throw new Error(`HTTP Error: ${sampleResponse.status} ${sampleResponse.statusText}`);
          }
          
          const sampleData = await sampleResponse.json();
          
          if (sampleData.status && sampleData.data && Array.isArray(sampleData.data.docs)) {
            // Filter transactions if necessary
            const relevantTransactions = storeId !== 'all'
              ? sampleData.data.docs.filter((t: Transaction) => t.store.id === storeId)
              : sampleData.data.docs;
            
            console.log(`Using ${relevantTransactions.length} transactions for calculations`);
            
            if (relevantTransactions.length === 0) {
              // No transactions found for this store
              setTotalStats({
                totalSales: 0,
                totalTransactions: 0,
                averageTransaction: 0
              });
              return;
            }
            
            // Calculate total from the sample
            const totalPaid = relevantTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
            
            // Calculate average transaction
            const averageTransaction = totalPaid / relevantTransactions.length;
            
            // For specific store, use the exact count from the current filter
            // For all stores, we need a different approach
            let storeSpecificTotal = totalTransactions;
            
            if (storeId === 'all') {
              // For all stores, we need to make sure we have the correct total count
              // The total from the first API call includes all stores
              
              // Count unique stores in our sample to estimate better
              const uniqueStores = new Set(relevantTransactions.map(t => t.store.id)).size;
              console.log(`Sample contains transactions from ${uniqueStores} unique stores`);
              
              // If we have store IDs in the sample, ensure we're including all transactions
              storeSpecificTotal = totalTransactions;
            }
            
            // Calculate total sales based on average and count
            const estimatedTotalSales = averageTransaction * storeSpecificTotal;
            
            console.log('Calculated stats:', {
              totalTransactions: storeSpecificTotal,
              averageTransaction,
              estimatedTotalSales
            });
            
            // Update the stats
            setTotalStats({
              totalSales: estimatedTotalSales,
              totalTransactions: storeSpecificTotal,
              averageTransaction: averageTransaction
            });
            
            return;
          }
        } catch (err) {
          console.error('Error calculating sales stats:', err);
        }
      }
      
      // Fallback if we couldn't calculate better stats
      setTotalStats({
        totalSales: 0,
        totalTransactions: totalTransactions || 0,
        averageTransaction: 0
      });
      
    } catch (err: Error | unknown) {
      console.error('Error fetching total summary:', err);
      // Don't set the main error state to avoid disrupting the transactions view
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
      let url = `https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/sales/shops-transactions`;
      
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
      console.log('Store IDs in response:', [...new Set(data.data.docs.map(t => t.store.id))]);
      console.log('Store names in response:', [...new Set(data.data.docs.map(t => t.store.name))]);
      
      // Filter transactions by store if needed
      let filteredDocs = [...data.data.docs];
      
      // If we're filtering by a specific store, ensure that's all we display
      if (storeFilter !== 'all') {
        const beforeCount = filteredDocs.length;
        filteredDocs = filteredDocs.filter(transaction => transaction.store.id === storeFilter);
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
      
      // Update summary stats based on the current filter
      // Don't include fetchTotalSummary in the dependencies, call it directly
      (async () => {
        try {
          // Copy just the function call - don't include the function definition here
          setIsLoadingStats(true);
          // Add the rest of fetchTotalSummary implementation...
          // This would be the entire body of fetchTotalSummary
          // ...
          
          // Just for this fix, we'll call the original function instead
          await fetchTotalSummary(storeFilter);
        } catch (err) {
          console.error('Error in inline fetchTotalSummary:', err);
        }
      })();
      
    } catch (err: Error | unknown) {
      console.error('Error fetching transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      setFilteredTransactions([]);
      setIsLoadingStats(false);
    } finally {
      setIsLoading(false);
    }
  }, [storeFilter, currentPage, itemsPerPage, searchTerm, validateAndFormatDates, debugLocalStorage]);
  
  // Fetch stores from the API
  const fetchStores = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view store data');
      }
      
      const response = await fetch('https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/stores/merchants', {
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
      const stores = data.data.map(store => ({
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
  }, [fetchStores, fetchTransactions]);
  
  // Fetch transactions when page or store filter changes
  useEffect(() => {
    // Only fetch if component has been mounted
    if (!isLoading) {
      fetchTransactions();
    }
  }, [currentPage, storeFilter, fetchTransactions, isLoading]);
  
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
      setError(error);
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
  const handleStoreFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStoreFilter = e.target.value;
    console.log('Store filter changed to:', newStoreFilter);
    
    setStoreFilter(newStoreFilter);
    
    // Reset to first page when changing store filter
    setCurrentPage(1);
  }, []);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    debugLocalStorage();
    console.log('Manual refresh triggered');
    setCurrentPage(1);
    fetchTransactions();
  }, [debugLocalStorage, fetchTransactions]);

  return (
    <div className={styles.container}>
      {/* Log the current store filter for debugging */}
      {console.log('Rendering with store filter:', storeFilter)}
      {console.log('Current store list:', storeList)}
      
      <div className={styles.header}>
        <h1 className={styles.title}>Sales Transactions</h1>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleManualRefresh}
            className="mr-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Refresh Data
          </button>
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
                  {formatCurrency(totalStats.totalSales)}
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
                  {totalStats.totalTransactions.toLocaleString()}
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
                  {formatCurrency(totalStats.averageTransaction)}
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
            Showing {filteredTransactions.length} of {totalItems} transactions
            {storeFilter !== 'all' && <span className="ml-2 font-semibold">(Filtered by store)</span>}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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