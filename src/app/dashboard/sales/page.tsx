'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './sales-page.module.css';

// Mock data for demonstration
const mockSalesData = [
  { 
    id: 1, 
    merchantName: 'Lazynerd Store', 
    branch: 'Main Branch', 
    date: '2023-11-15T10:30:00Z',
    amount: 1250.00,
    transactionId: 'TRX-001-2023',
    paymentMethod: 'Cash',
    customerName: 'John Doe'
  },
  { 
    id: 2, 
    merchantName: 'Lazynerd Store', 
    branch: 'Downtown Branch', 
    date: '2023-11-14T14:45:00Z',
    amount: 780.50,
    transactionId: 'TRX-002-2023',
    paymentMethod: 'Mobile Money',
    customerName: 'Jane Smith'
  },
  { 
    id: 3, 
    merchantName: 'TechGadgets', 
    branch: 'Main Store', 
    date: '2023-10-30T09:15:00Z',
    amount: 3200.00,
    transactionId: 'TRX-003-2023',
    paymentMethod: 'Card',
    customerName: 'Michael Johnson'
  },
  { 
    id: 4, 
    merchantName: 'Fashion Hub', 
    branch: 'Mall Branch', 
    date: '2023-11-15T16:20:00Z',
    amount: 950.75,
    transactionId: 'TRX-004-2023',
    paymentMethod: 'Mobile Money',
    customerName: 'Sarah Williams'
  },
  { 
    id: 5, 
    merchantName: 'Fashion Hub', 
    branch: 'City Center', 
    date: '2023-11-13T11:10:00Z',
    amount: 1450.25,
    transactionId: 'TRX-005-2023',
    paymentMethod: 'Cash',
    customerName: 'David Brown'
  },
  { 
    id: 6, 
    merchantName: 'Grocery Express', 
    branch: 'North Branch', 
    date: '2023-11-15T08:45:00Z',
    amount: 675.30,
    transactionId: 'TRX-006-2023',
    paymentMethod: 'Card',
    customerName: 'Emily Davis'
  },
  { 
    id: 7, 
    merchantName: 'Grocery Express', 
    branch: 'South Branch', 
    date: '2023-11-01T13:20:00Z',
    amount: 890.45,
    transactionId: 'TRX-007-2023',
    paymentMethod: 'Mobile Money',
    customerName: 'Robert Wilson'
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

export default function SalesPage() {
  const [sales, setSales] = useState(mockSalesData);
  const [filteredSales, setFilteredSales] = useState(mockSalesData);
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate summary statistics
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalTransactions = filteredSales.length;
  const averageTransactionValue = totalTransactions > 0 ? totalSalesAmount / totalTransactions : 0;
  
  // Get unique merchants for filter dropdown
  const uniqueMerchants = Array.from(new Set(sales.map(sale => sale.merchantName)));

  useEffect(() => {
    // Apply filters
    let filtered = [...sales];
    
    // Filter by merchant
    if (merchantFilter !== 'all') {
      filtered = filtered.filter(sale => sale.merchantName === merchantFilter);
    }
    
    // Filter by date range
    if (dateFilter !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      if (dateFilter === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateFilter === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      }
      
      filtered = filtered.filter(sale => new Date(sale.date) >= startDate);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSales(filtered);
  }, [sales, merchantFilter, dateFilter, searchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sales Overview</h1>
        <div className={styles.buttonGroup}>
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
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Total Sales</p>
              <p className={styles.statValue}>{formatCurrency(totalSalesAmount)}</p>
            </div>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              💰
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Total Transactions</p>
              <p className={styles.statValue}>{totalTransactions}</p>
            </div>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
              🧾
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statTitle}>Average Transaction</p>
              <p className={styles.statValue}>{formatCurrency(averageTransactionValue)}</p>
            </div>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Merchant</label>
          <select 
            className={styles.filterSelect}
            value={merchantFilter}
            onChange={(e) => setMerchantFilter(e.target.value)}
          >
            <option value="all">All Merchants</option>
            {uniqueMerchants.map(merchant => (
              <option key={merchant} value={merchant}>{merchant}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date Range</label>
          <select 
            className={styles.filterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Search</label>
          <input 
            type="text" 
            placeholder="Search by merchant, branch, or ID"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>Sales Transactions</h2>
          <p className={styles.sectionSubtitle}>Showing {filteredSales.length} transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeaderRow}>
              <tr>
                <th className={styles.tableHeaderCell}>Transaction ID</th>
                <th className={styles.tableHeaderCell}>Merchant</th>
                <th className={styles.tableHeaderCell}>Branch</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Amount</th>
                <th className={styles.tableHeaderCell}>Payment Method</th>
                <th className={styles.tableHeaderCell}>Customer</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{sale.transactionId}</td>
                  <td className={styles.tableCell}>{sale.merchantName}</td>
                  <td className={styles.tableCell}>{sale.branch}</td>
                  <td className={styles.tableCell}>{formatDate(sale.date)}</td>
                  <td className={styles.tableCell}>{formatCurrency(sale.amount)}</td>
                  <td className={styles.tableCell}>{sale.paymentMethod}</td>
                  <td className={styles.tableCell}>{sale.customerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.paginationButton}>Previous</button>
          <button className={`${styles.paginationButton} ${styles.paginationButtonActive}`}>1</button>
          <button className={styles.paginationButton}>2</button>
          <button className={styles.paginationButton}>3</button>
          <button className={styles.paginationButton}>Next</button>
        </div>
      </div>
    </div>
  );
}