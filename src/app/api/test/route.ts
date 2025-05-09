// Simple API test endpoint
export async function GET() {
  try {
    // Test token provided by the user
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5IiwiZW1haWwiOiJhZG1pbkBibHVwZW5ndWluLmNvbSIsImZpcnN0TmFtZSI6IkJsdVBlbmd1aW4iLCJsYXN0TmFtZSI6IkFmcmljYSIsInRpbWUiOiIyMDI1LTA1LTA5VDEwOjUxOjE3LjQ3NVoiLCJleHBpcmUiOiIyMDI1LTA1LTEwVDEwOjUxOjE3LjQ3NVoiLCJpYXQiOjE3NDY3ODc4NzcsImV4cCI6MTc0Njg3NDI3N30.ZUmD3ccUzBqg-0KrNI2GZZuF3-VL8xus8SUHxhQbCSg";
    const storeId = "7";
    
    // Make a test request to the dashboard endpoint
    const response = await fetch("https://api.myshopkeeper.net/api/v1/users/dashboard", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "D-UUID": "645545453533",
        "S-UUID": storeId
      }
    });
    
    const data = await response.json();
    
    // Return both the API response and request details for debugging
    return Response.json({
      success: true,
      apiResponse: data,
      requestDetails: {
        url: "https://api.myshopkeeper.net/api/v1/users/dashboard",
        token: token.substring(0, 20) + "...", // Truncate for security
        storeId: storeId
      }
    });
  } catch (error) {
    console.error("API test failed:", error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 