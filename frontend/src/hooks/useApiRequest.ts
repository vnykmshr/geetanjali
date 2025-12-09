import { useState, useCallback } from "react";

interface UseApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiRequestOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

/**
 * Hook for managing API requests with loading and error states
 * Eliminates boilerplate for common loading/error/data pattern
 *
 * @example
 * const { data, loading, error, request } = useApiRequest<Verse>();
 * useEffect(() => {
 *   request(() => versesApi.get(canonicalId));
 * }, [canonicalId]);
 */
export function useApiRequest<T>(options: UseApiRequestOptions = {}) {
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const request = useCallback(
    async (
      apiCall: () => Promise<T>,
      errorFormatter?: (err: unknown) => string,
    ) => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        options.onSuccess?.();
        return result;
      } catch (err) {
        const errorMessage = errorFormatter ? errorFormatter(err) : String(err);
        setState({ data: null, loading: false, error: errorMessage });
        options.onError?.(errorMessage);
      }
    },
    [options],
  );

  return {
    ...state,
    request,
  };
}

export default useApiRequest;
