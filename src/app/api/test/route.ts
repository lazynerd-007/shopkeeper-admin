import { NextResponse } from 'next/server';

// Simple API test endpoint
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId') || '7'; // Default store ID
    const token = url.searchParams.get('token') || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5IiwiZW1haWwiOiJhZG1pbkBibHVwZW5ndWluLmNvbSIsImZpcnN0TmFtZSI6IkJsdVBlbmd1aW4iLCJsYXN0TmFtZSI6IkFmcmljYSIsInRpbWUiOiIyMDI1LTA1LTA5VDEwOjUxOjE3LjQ3NVoiLCJleHBpcmUiOiIyMDI1LTA1LTEwVDEwOjUxOjE3LjQ3NVoiLCJpYXQiOjE3NDY3ODc4NzcsImV4cCI6MTc0Njg3NDI3N30.ZUmD3ccUzBqg-0KrNI2GZZuF3-VL8xus8SUHxhQbCSg';
    
    if (!token || !storeId) {
      return NextResponse.json(
        { error: 'Missing token or storeId. Please provide as query parameters.' }, 
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
    
    // Return detailed information about the merchant data
    const merchantDetails = [];
    
    if (data.data && data.data.docs && data.data.docs.length > 0) {
      for (const merchant of data.data.docs) {
        merchantDetails.push({
          id: merchant.id,
          name: merchant.merchant,
          status: merchant.status,
          isActive: merchant.isActive,
          lastTransactionDate: merchant.lastTransactionDate,
          hasStatus: 'status' in merchant,
          hasIsActive: 'isActive' in merchant,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      merchantDetails,
      rawData: data
    });
  } catch (err) {
    console.error('Test API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 