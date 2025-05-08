/**
 * Validate a date string in YYYY-MM-DD format
 */
export const isValidDateString = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Get the first day of the current month as YYYY-MM-DD
 */
export const getFirstDayOfMonth = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Get the current date as YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Get a date from n days ago as YYYY-MM-DD
 */
export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Parse a date string to ensure it's in YYYY-MM-DD format
 */
export const parseDateString = (dateStr: string): string | null => {
  try {
    if (!dateStr) return null;
    
    // If already in correct format
    if (isValidDateString(dateStr)) {
      return dateStr;
    }
    
    // Try to parse from a date object
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date.toISOString().split('T')[0];
  } catch {
    // Error is caught but not used
    return null;
  }
};

/**
 * Check if date1 is after date2
 */
export const isDateAfter = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1 > d2;
};

/**
 * Calculate the difference between two dates in days
 */
export const dateDiffInDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 