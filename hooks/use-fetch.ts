import { useState } from "react";
import { toast } from "sonner";

// Generic type T is the return type of the async function
const useFetch = <T, Args extends any[]>(
  cb: (...args: Args) => Promise<T>
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err) {
      const typedErr = err as Error;
      setError(typedErr);
      toast.error(typedErr.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
