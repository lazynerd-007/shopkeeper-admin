// Simple API proxy without relying on next/server imports
export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function PUT(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, D-UUID, S-UUID',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleRequest(request: Request) {
  try {
    // Extract path from URL
    const pathSegments = new URL(request.url).pathname.split('/').slice(2);
    const path = pathSegments.join('/');
    const { searchParams } = new URL(request.url);
    
    // Rebuild the URL with search parameters
    let apiUrl = `https://api.myshopkeeper.net/api/v1/${path}`;
    if (searchParams.toString()) {
      apiUrl += `?${searchParams.toString()}`;
    }
    
    console.log(`Proxying API request to: ${apiUrl}`);
    
    // Get headers from the original request
    const headers = new Headers();
    request.headers.forEach((value: string, key: string) => {
      // Don't forward host header
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    });
    
    // Add any necessary authentication headers
    const authHeader = request.headers.get('Authorization');
    if (!headers.has('Authorization') && authHeader) {
      headers.set('Authorization', authHeader);
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
    return Response.json(data, {
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
    return Response.json(
      { 
        status: false, 
        message: error instanceof Error ? error.message : 'API proxy error',
        error: error 
      },
      { status: 500 }
    );
  }
} 