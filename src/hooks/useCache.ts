import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Whether to refresh cache in the background when stale (default: true) */
  backgroundRefresh?: boolean;
}

/**
 * Custom hook for caching data with automatic expiration
 */
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    backgroundRefresh = true
  } = options;
  
  // Use refs for mutable values that shouldn't trigger re-renders
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());
  const fetchingRef = useRef<Set<string>>(new Set());
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if cache is valid
  const isCacheValid = useCallback((cacheKey: string): boolean => {
    const item = cache.current.get(cacheKey);
    if (!item) return false;
    
    const now = Date.now();
    return now - item.timestamp < ttl;
  }, [ttl]);
  
  // Fetch data function
  const fetchData = useCallback(async (cacheKey: string, force: boolean = false): Promise<void> => {
    // Don't fetch if already fetching this key
    if (fetchingRef.current.has(cacheKey) && !force) {
      return;
    }
    
    try {
      fetchingRef.current.add(cacheKey);
      setIsLoading(true);
      
      // If cache is valid and we're not forcing a refresh, use cached data
      if (isCacheValid(cacheKey) && !force) {
        const cachedItem = cache.current.get(cacheKey);
        if (cachedItem) {
          setData(cachedItem.data);
          setIsLoading(false);
          
          // If background refresh is enabled and we're approaching TTL, refresh in background
          const age = Date.now() - cachedItem.timestamp;
          if (backgroundRefresh && age > (ttl * 0.8)) {
            await fetchDataAndCache(cacheKey, true);
          }
          
          return;
        }
      }
      
      await fetchDataAndCache(cacheKey);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      fetchingRef.current.delete(cacheKey);
      setIsLoading(false);
    }
  }, [isCacheValid, ttl, backgroundRefresh]);
  
  // Fetch and cache data
  const fetchDataAndCache = useCallback(async (cacheKey: string, isBackground: boolean = false): Promise<void> => {
    try {
      if (!isBackground) {
        setIsLoading(true);
      }
      
      const result = await fetchFn();
      
      // Store in cache
      cache.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        key: cacheKey
      });
      
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, [fetchFn]);
  
  // Expose a refetch method to manually refresh data
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(key, true);
  }, [fetchData, key]);
  
  // Initial fetch on mount
  useEffect(() => {
    fetchData(key);
  }, [fetchData, key]);
  
  return { data, isLoading, error, refetch };
}

export default useCache; 