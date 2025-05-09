import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: {
    path: string[];
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const path = context.params.path.join('/');
    const { searchParams } = new URL(request.url);
    
    // Rebuild the URL with search parameters
    let apiUrl = `https://api.myshopkeeper.net/api/v1/${path}`;
    if (searchParams.toString()) {
      apiUrl += `?${searchParams.toString()}`;
    }
    
    console.log(`Proxying API request to: ${apiUrl}`);
    
    // Get headers from the original request
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Don't forward host header
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    });
    
    // Add any necessary authentication headers
    if (!headers.has('Authorization') && request.headers.get('Authorization')) {
      headers.set('Authorization', request.headers.get('Authorization')!);
    }
    
    if (!headers.has('D-UUID')) {
      headers.set('D-UUID', '645545453533');
    }
    
    // Forward the request
    const response = await fetch(apiUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, D-UUID, S-UUID',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: error instanceof Error ? error.message : 'API proxy error',
        error: error 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, D-UUID, S-UUID',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Forward POST, PUT, and DELETE methods
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  return handleRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return handleRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return handleRequest(request, context);
}

// Helper function to handle all methods
async function handleRequest(request: NextRequest, context: RouteContext) {
  return GET(request, context);
} 