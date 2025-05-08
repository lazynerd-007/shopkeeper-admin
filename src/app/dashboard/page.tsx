'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard-page.module.css';
import Loader from '../../Loader';

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

const formatCurrency = (amount: number) => {
  return `GHS${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format numbers with comma separators
const formatNumber = (num: number | undefined) => {
  if (num === undefined) return '-';
  return num.toLocaleString('en-US') || '-';
};

// Define proper types for the data
interface DashboardOverview {
  activeMerchantCount: number;
  inactiveMerchantCount: number;
  transactionSum: number;
  transactionCount: number;
}

interface Merchant {
  id: string;
  name: string;
  contactEmail: string;
  phoneNumber: string;
  createdAt: string;
}

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const storeId = localStorage.getItem('storeId');
        console.log('Dashboard API token:', token, 'storeId:', storeId);
        console.log('Token used for API:', token);
        if (!token || !storeId) throw new Error('Missing authentication. Please log in again.');
        const headers = {
          'D-UUID': '645545453533',
          'S-UUID': storeId,
          'Authorization': `Bearer ${token}`
        };
        // Fetch overview
        const overviewRes = await fetch('https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/stores/overview/merchant', {
          method: 'GET',
          headers
        });
        const overviewData = await overviewRes.json();
        if (!overviewRes.ok || !overviewData.status) throw new Error(overviewData.message || 'Failed to fetch overview');
        setOverview(overviewData.data);
        // Fetch merchants
        const merchantsRes = await fetch('https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1/stores/merchants', {
          method: 'GET',
          headers
        });
        const merchantsData = await merchantsRes.json();
        if (!merchantsRes.ok || !merchantsData.status) throw new Error(merchantsData.message || 'Failed to fetch merchants');
        setMerchants(merchantsData.data);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className={styles.container}><p style={{color: 'red'}}>{error}</p></div>;

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
              <p className={styles.statValue}>{overview?.activeMerchantCount ?? '-'}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Inactive Merchants</p>
              <p className={styles.statValue}>{overview?.inactiveMerchantCount ?? '-'}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Total Sales</p>
              <p className={styles.statValue}>{formatCurrency(overview?.transactionSum ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div>
              <p className={styles.statTitle}>Total Transactions</p>
              <p className={styles.statValue}>{formatNumber(overview?.transactionCount ?? 0)}</p>
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
                <th className={styles.tableHeaderCell}>Contact Email</th>
                <th className={styles.tableHeaderCell}>Phone</th>
                <th className={styles.tableHeaderCell}>Created</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{merchant.name}</td>
                  <td className={styles.tableCell}>{merchant.contactEmail}</td>
                  <td className={styles.tableCell}>{merchant.phoneNumber}</td>
                  <td className={styles.tableCell}>{formatDate(merchant.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}