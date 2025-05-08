'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loader from '../../../Loader';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number) => {
  return `GHS${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format numbers with comma separators
const formatNumber = (num: number) => {
  return num?.toLocaleString('en-US') || '-';
};

const BASE_URL = 'https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1';

// Define proper interface for merchants
interface Merchant {
  id: string;
  merchant: string;
  branch: string;
  contactEmail: string;
  status: string;
  transactionAmount: number;
  transactionCount: number;
  lastTransactionDate: string;
  createdAt: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const storeId = localStorage.getItem('storeId');
        if (!token || !storeId) throw new Error('Missing authentication. Please log in again.');
        const headers = {
          'D-UUID': '645545453533',
          'S-UUID': storeId,
          'Authorization': `Bearer ${token}`
        };
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(rowsPerPage),
          search: searchTerm || '',
          status: statusFilter || '',
          startDate: '',
          endDate: '',
        });
        const url = `${BASE_URL}/stores/summary/merchant?${params.toString()}`;
        const res = await fetch(url, {
          method: 'GET',
          headers,
        });
        const data = await res.json();
        if (!res.ok || !data.status) throw new Error(data.message || 'Failed to fetch merchants');
        setMerchants(data.data.docs);
        setTotal(data.data.total);
        setTotalPages(data.data.pages);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load merchants.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, [currentPage, rowsPerPage, searchTerm, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(searchInputValue);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex">
            <input
              id="search"
              type="text"
                value={searchInputValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by merchant, branch, or email"
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                autoComplete="off"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Merchant List</h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
            <p className="text-sm text-gray-700 mb-2 sm:mb-0">Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, total)} of {formatNumber(total)} merchants</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                aria-label="Select rows per page"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Merchant</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Total Sales</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Transactions</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Last Activity</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchants.map((merchant, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.merchant}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.branch}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.contactEmail}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${merchant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(merchant.transactionAmount)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatNumber(merchant.transactionCount)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(merchant.lastTransactionDate)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(merchant.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto mb-4 sm:mb-0">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <span className="text-sm text-gray-900 font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to next page"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to last page"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}