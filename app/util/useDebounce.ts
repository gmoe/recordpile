'use client';
import { useRef, useEffect, useState } from 'react';

/** Limit the rate of changes to a value to a specified delay. */
export default function useDebounce(value: any, delay: number = 150) {
  const idRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    clearTimeout(idRef.current);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    idRef.current = handler;

    return () => {
      clearTimeout(handler);
    }
  }, [value, delay]);

  return debouncedValue;
}
