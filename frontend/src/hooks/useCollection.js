import { useEffect, useState } from "react";

/**
 * Subscribes to a live Firestore collection via a feature service's
 * `.subscribe()` method. Returns { data, loading, error }.
 */
export function useCollection(service, constraints = [], deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsub = service.subscribe(
      constraints,
      (docs) => {
        setData(docs);
        setLoading(false);
      }
    );
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
