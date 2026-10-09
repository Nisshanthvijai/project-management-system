import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Runs an API call when the screen opens and whenever `deps` change.
// It also reloads when the screen regains focus (e.g. after saving a task on another screen).
// Returns { data, loading, error, reload }. `reload` returns a promise (used by pull-to-refresh).
export function useApi(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const id = ++latestRequest.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === latestRequest.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === latestRequest.current) setState((s) => ({ data: s.data, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      load();
    }, [load]),
  );

  return { ...state, reload: load };
}
