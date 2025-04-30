'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock data for demonstration
const mockMerchants = [
  { 
    id: 1, 
    name: 'Lazynerd Store', 
    branch: 'Main Branch', 
    status: 'active', 
    totalSales: 15000, 
    lastActivity: '2023-11-15T10:30:00Z',
    salesCount: 120,
    email: 'main@lazynerd.com',
    phone: '+233 50 123 4567',
    address: '123 Main Street, Accra'
  },
  { 
    id: 2, 
    name: 'Lazynerd Store', 
    branch: 'Downtown Branch', 
    status: 'active', 
    totalSales: 8500, 
    lastActivity: '2023-11-14T14:45:00Z',
    salesCount: 75,
    email: 'downtown@lazynerd.com',
    phone: '+233 50 123 4568',
    address: '456 Downtown Avenue, Accra'
  },
  { 
    id: 3, 
    name: 'TechGadgets', 
    branch: 'Main Store', 
    status: 'inactive', 
    totalSales: 3200, 
    lastActivity: '2023-10-30T09:15:00Z',
    salesCount: 28,
    email: 'info@techgadgets.com',
    phone: '+233 50 987 6543',
    address: '789 Tech Street, Kumasi'
  },
  { 
    id: 4, 
    name: 'Fashion Hub', 
    branch: 'Mall Branch', 
    status: 'active', 
    totalSales: 12700, 
    lastActivity: '2023-11-15T16:20:00Z',
    salesCount: 95,
    email: 'mall@fashionhub.com',
    phone: '+233 50 456 7890',
    address: '101 Mall Road, Accra'
  },
  { 
    id: 5, 
    name: 'Fashion Hub', 
    branch: 'City Center', 
    status: 'active', 
    totalSales: 9800, 
    lastActivity: '2023-11-13T11:10:00Z',
    salesCount: 82,
    email: 'city@fashionhub.com',
    phone: '+233 50 456 7891',
    address: '202 City Center, Takoradi'
  },
  { 
    id: 6, 
    name: 'Grocery Express', 
    branch: 'North Branch', 
    status: 'active', 
    totalSales: 18900, 
    lastActivity: '2023-11-15T08:45:00Z',
    salesCount: 210,
    email: 'north@groceryexpress.com',
    phone: '+233 50 222 3333',
    address: '303 North Road, Tamale'
  },
  { 
    id: 7, 
    name: 'Grocery Express', 
    branch: 'South Branch', 
    status: 'inactive', 
    totalSales: 7600, 
    lastActivity: '2023-11-01T13:20:00Z',
    salesCount: 85,
    email: 'south@groceryexpress.com',
    phone: '+233 50 222 4444',
    address: '404 South Street, Cape Coast'
  },
];

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

// Format currency
const formatCurrency = (amount: number) => {
  return `GHS${amount.toFixed(2)}`;
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState(mockMerchants);
  const [filteredMerchants, setFilteredMerchants] = useState(mockMerchants);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Apply filters
    let filtered = [...merchants];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(merchant => merchant.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(merchant => 
        merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMerchants(filtered);
    setTotalPages(Math.ceil(filtered.length / rowsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [merchants, statusFilter, searchTerm, rowsPerPage]);
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredMerchants.slice(startIndex, endIndex);
  };

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
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, branch, or email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All</option>
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
            <p className="text-sm text-gray-700 mb-2 sm:mb-0">Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredMerchants.length)} of {filteredMerchants.length} merchants</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Merchant</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Branch</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">Total Sales</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">Transactions</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageData().map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                    <div className="text-xs text-gray-600 sm:hidden mt-1">{merchant.branch}</div>
                    <div className="text-xs text-gray-600 md:hidden mt-1">{merchant.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-600">{merchant.branch}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-600">{merchant.email}</div>
                    <div className="text-xs text-gray-600 mt-1">{merchant.phone}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${merchant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {merchant.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                    {formatCurrency(merchant.totalSales)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                    {merchant.salesCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                    {formatDate(merchant.lastActivity)}
                  </td>
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
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Go to next page"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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