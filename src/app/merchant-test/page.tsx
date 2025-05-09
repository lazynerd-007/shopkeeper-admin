'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loader from '../../Loader';

interface MerchantData {
  id: string;
  merchant: string;
  branch: string;
  status: string;
  lastTransactionDate: string;
  statusFromApi: string;
}

export default function MerchantTestPage() {
  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        // Get auth from localStorage
        const token = localStorage.getItem('token');
        const storeId = localStorage.getItem('storeId');
        
        if (!token || !storeId) {
          throw new Error('Missing authentication data. Please log in first.');
        }
        
        // Direct API call to merchant endpoint
        const url = 'https://api.myshopkeeper.net/api/v1/stores/summary/merchant?page=1&limit=10';
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'D-UUID': '645545453533',
            'S-UUID': storeId,
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.status) {
          throw new Error(data.message || 'Failed to fetch merchants');
        }
        
        // Log the response structure
        console.log('API response status:', data.status);
        console.log('First merchant data:', data.data.docs[0]);
        
        // Transform the data to show key status information
        const merchantData = data.data.docs.map((m: any) => ({
          id: m.id,
          merchant: m.merchant,
          branch: m.branch,
          status: m.status,
          lastTransactionDate: m.lastTransactionDate,
          statusFromApi: JSON.stringify(m.status)
        }));
        
        setMerchants(merchantData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching merchants:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMerchants();
  }, []);
  
  if (loading) return <Loader />;
  if (error) return <div className="p-6 bg-red-50 text-red-700">{error}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchant Status Test</h1>
        <Link href="/dashboard/merchants" className="bg-blue-500 text-white px-4 py-2 rounded">
          Back to Merchants
        </Link>
      </div>
      
      <div className="bg-yellow-50 p-4 mb-6 rounded border border-yellow-200">
        <h2 className="font-semibold mb-2">Debug Information</h2>
        <p>This page makes a direct API call to test merchant status values.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Merchant</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Branch</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{merchant.merchant}</td>
                <td className="px-4 py-3">{merchant.branch}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    merchant.status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {merchant.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {merchant.statusFromApi} ({typeof merchant.status})
                </td>
                <td className="px-4 py-3">
                  {merchant.lastTransactionDate 
                    ? new Date(merchant.lastTransactionDate).toLocaleString() 
                    : 'No activity'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 