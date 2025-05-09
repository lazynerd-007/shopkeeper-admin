import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log the request headers and method
    console.log('Debug API request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    // Make a request to the actual API to test connectivity
    const apiUrl = 'https://api.myshopkeeper.net/api/v1/health';
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Return debug information
    res.status(200).json({
      success: true,
      proxy_working: response.ok,
      status: response.status,
      api_data: data,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
      },
    });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      request: {
        method: req.method,
        url: req.url,
      },
    });
  }
} 