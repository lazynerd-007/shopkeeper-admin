import { NextResponse } from 'next/server';

// Simple API test endpoint
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId') || localStorage.getItem('storeId');
    const token = url.searchParams.get('token') || localStorage.getItem('token');
    
    if (!token || !storeId) {
      return NextResponse.json(
        { error: 'Missing token or storeId' }, 
        { status: 400 }
      );
    }
    
    // Make request to merchant summary endpoint
    const headers = {
      'D-UUID': '645545453533',
      'S-UUID': storeId,
      'Authorization': `Bearer ${token}`
    };
    
    // Call merchant summary API
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
    });
    
    const apiUrl = `https://api.myshopkeeper.net/api/v1/stores/summary/merchant?${params.toString()}`;
    
    console.log('Making request to:', apiUrl);
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    
    const data = await res.json();
    
    // Log response structure to help debug
    console.log('API Response structure:', Object.keys(data));
    console.log('API Response status:', data.status);
    
    if (data.data && data.data.docs && data.data.docs.length > 0) {
      const firstMerchant = data.data.docs[0];
      console.log('First merchant fields:', Object.keys(firstMerchant));
      console.log('First merchant status:', firstMerchant.status);
      console.log('First merchant isActive:', firstMerchant.isActive);
      console.log('First merchant lastTransactionDate:', firstMerchant.lastTransactionDate);
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('Test API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 