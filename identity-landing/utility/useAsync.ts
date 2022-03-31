import {
  DependencyList, useCallback, useEffect, useState,
} from 'react';

export const useAsync = <T>(asyncFunction: () => Promise<T>, dependencies: DependencyList): [boolean, T | undefined, unknown] => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<T>();

  const callbackMemoized = useCallback(() => {
    setIsLoading(true);
    setError(undefined);
    setResult(undefined);
    asyncFunction()
      .then(setResult)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, dependencies);

  useEffect(() => {
    callbackMemoized();
  }, [callbackMemoized]);

  return [isLoading, result, error];
};
