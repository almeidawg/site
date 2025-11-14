
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const cache = new Map();

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export const withCache = async (key, fetchFn, options = {}) => {
  const { forceRefresh = false, timeout = 10000 } = options;
  
  if (!forceRefresh) {
    const cached = getCachedData(key);
    if (cached) return cached;
  }
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );
  
  try {
    const data = await Promise.race([fetchFn(), timeoutPromise]);
    setCachedData(key, data);
    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    throw error;
  }
};
