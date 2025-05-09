// Environment configuration file
// This file centralizes all environment variables and provides defaults

interface EnvConfig {
  API_BASE_URL: string;
  // Add more environment variables as needed
}

// Load environment variables with fallbacks
const env: EnvConfig = {
  // Use the Next.js API proxy to avoid CORS issues
  API_BASE_URL: '/api',
  // Add more environment variables as needed
};

// Freeze the object to prevent modifications at runtime
export default Object.freeze(env); 