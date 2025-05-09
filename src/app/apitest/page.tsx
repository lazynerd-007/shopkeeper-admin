'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5IiwiZW1haWwiOiJhZG1pbkBibHVwZW5ndWluLmNvbSIsImZpcnN0TmFtZSI6IkJsdVBlbmd1aW4iLCJsYXN0TmFtZSI6IkFmcmljYSIsInRpbWUiOiIyMDI1LTA1LTA5VDEwOjUxOjE3LjQ3NVoiLCJleHBpcmUiOiIyMDI1LTA1LTEwVDEwOjUxOjE3LjQ3NVoiLCJpYXQiOjE3NDY3ODc4NzcsImV4cCI6MTc0Njg3NDI3N30.ZUmD3ccUzBqg-0KrNI2GZZuF3-VL8xus8SUHxhQbCSg";
  const storeId = "7";

  // Function to test our simple test API endpoint
  const testSimpleApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/test');
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to test direct API access
  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://api.myshopkeeper.net/api/v1/users/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'D-UUID': '645545453533',
          'S-UUID': storeId
        }
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to test our proxy API endpoint
  const testProxyApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'S-UUID': storeId
        }
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      <p>Use this page to test API connectivity with the provided token.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testSimpleApi} 
          disabled={loading}
          style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Simple API
        </button>
        
        <button 
          onClick={testDirectApi} 
          disabled={loading}
          style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Direct API (CORS)
        </button>
        
        <button 
          onClick={testProxyApi} 
          disabled={loading}
          style={{ padding: '10px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Proxy API
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Response:</h3>
          <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#e9ecef', borderRadius: '4px' }}>
        <h3>Auth Details:</h3>
        <p><strong>Token:</strong> {token.substring(0, 20)}...{token.substring(token.length - 10)}</p>
        <p><strong>Store ID:</strong> {storeId}</p>
      </div>
    </div>
  );
} 