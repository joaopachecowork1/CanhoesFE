import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  start: () => void;
  stop: () => void;
  setError: (error: Error | null) => void;
}

export function useLoadingState(initial = false): LoadingState {
  const [isLoading, setIsLoading] = useState(initial);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  return { isLoading, error, start, stop, setError };
}