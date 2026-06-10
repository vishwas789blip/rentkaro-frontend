import { useState, useEffect } from "react";

/**
 * Debounce any value — waits until user stops typing
 * before updating the returned value.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 400);
 *   useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
