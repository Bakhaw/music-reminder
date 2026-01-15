import { useEffect, useState } from "react";

export default function useDebounce<T>(values: T[], delay: number): T[] {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T[]>(values);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(values);
      }, delay);

      // Cancel the timeout if values change (also on delay change or unmount)
      // This is how we prevent debounced value from updating if values are changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [...values, delay] // Only re-call effect if any value or delay changes
  );

  return debouncedValue;
}
