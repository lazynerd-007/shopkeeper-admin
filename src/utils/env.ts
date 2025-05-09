// Environment configuration file
// This file centralizes all environment variables and provides defaults

interface EnvConfig {
  API_BASE_URL: string;
  // Add more environment variables as needed
}

// Load environment variables with fallbacks
const env: EnvConfig = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.default-domain.com',
  // Add more environment variables as needed
};

// Freeze the object to prevent modifications at runtime
export default Object.freeze(env); 