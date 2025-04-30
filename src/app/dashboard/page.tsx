'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard-page.module.css';

// Mock data for demonstration
const mockMerchants = [
  { 
    id: 1, 
    name: 'Lazynerd Store', 
    branch: 'Main Branch', 
    status: 'active', 
    totalSales: 15000, 
    lastActivity: '2023-11-15T10:30:00Z',
    salesCount: 120
  },
  { 
    id: 2, 
    name: 'Lazynerd Store', 
    branch: 'Downtown Branch', 
    status: 'active', 
    totalSales: 8500, 
    lastActivity: '2023-11-14T14:45:00Z',
    salesCount: 75
  },
  { 
    id: 3, 
    name: 'TechGadgets', 
    branch: 'Main Store', 
    status: 'inactive', 
    totalSales: 3200, 
    lastActivity: '2023-10-30T09:15:00Z',
    salesCount: 28
  },
  { 
    id: 4, 
    name: 'Fashion Hub', 
    branch: 'Mall Branch', 
    status: 'active', 
    totalSales: 12700, 
    lastActivity: '2023-11-15T16:20:00Z',
    salesCount: 95
  },
  { 
    id: 5, 
    name: 'Fashion Hub', 
    branch: 'City Center', 
    status: 'active', 
    totalSales: 9800, 
    lastActivity: '2023-11-13T11:10:00Z',
    salesCount: 82
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

export default function Dashboard() {
  const [merchants, setMerchants] = useState(mockMerchants);
  const [activeMerchants, setActiveMerchants] = useState(0);
  const [inactiveMerchants, setInactiveMerchants] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  useEffect(() => {
    // Calculate summary statistics
    const active = merchants.filter(m => m.status === 'active').length;
    const inactive = merchants.filter(m => m.status === 'inactive').length;
    const sales = merchants.reduce((sum, merchant) => sum + merchant.totalSales, 0);
    const salesCount = merchants.reduce((sum, merchant) => sum + merchant.salesCount, 0);
    
    setActiveMerchants(active);
    setInactiveMerchants(inactive);
    setTotalSales(sales);
    setTotalSalesCount(salesCount);
  }, [merchants]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.buttonGroup}>
          <Link 
            href="/dashboard/merchants"
            className={`${styles.button} ${styles.primaryButton}`}
          >
            View All Merchants
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Active Merchants</p>
              <p className={styles.statValue}>{activeMerchants}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Inactive Merchants</p>
              <p className={styles.statValue}>{inactiveMerchants}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Total Sales</p>
              <p className={styles.statValue}>{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Total Transactions</p>
              <p className={styles.statValue}>{totalSalesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivityCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>Merchant Overview</h2>
          <p className={styles.sectionSubtitle}>Store-based merchant information and sales data</p>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Merchant</th>
                <th className={styles.tableHeaderCell}>Branch</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Total Sales</th>
                <th className={styles.tableHeaderCell}>Transactions</th>
                <th className={styles.tableHeaderCell}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.merchantName}>{merchant.name}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.merchantBranch}>{merchant.branch}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${merchant.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                      {merchant.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    {formatCurrency(merchant.totalSales)}
                  </td>
                  <td className={styles.tableCell}>
                    {merchant.salesCount}
                  </td>
                  <td className={styles.tableCell}>
                    {formatDate(merchant.lastActivity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}