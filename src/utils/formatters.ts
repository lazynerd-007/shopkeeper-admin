/**
 * Format a date to a readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format currency with thousands separator
 */
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  return `${currency} ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2,
    useGrouping: true
  })}`;
};

/**
 * Format a number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

/**
 * Format a percentage
 */
export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Format person's name (first + last)
 */
export const formatPersonName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Convert camelCase to Title Case
 */
export const camelCaseToTitleCase = (text: string): string => {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Basic formatting for display
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
}; 