import { useEffect, useState } from 'react';
import { ApiError, request } from './api.js';

export function useFaculties() {
  const [revision, revise] = useState(0);
  const [result, update] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const names = [];
        let offset = 0;
        while (true) {
          const data = await request('/api/faculties', { signal: controller.signal, query: { offset: String(offset), limit: '100' } });
          if (!Array.isArray(data) || data.length > 100 || data.some((item) => !Number.isSafeInteger(item?.id) || item.id < 1 || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || /\p{C}/u.test(item.name))) throw new ApiError();
          names.push(...data.map((item) => item.name));
          if (data.length < 100) break;
          offset += 100;
          if (offset >= 10000) throw new ApiError();
        }
        if (!controller.signal.aborted) update({ revision, data: [...new Set(names)] });
      } catch (error) {
        if (!controller.signal.aborted) update({ revision, error });
      }
    }
    load();
    return () => controller.abort();
  }, [revision]);
  return { ...(result?.revision === revision ? result : {}), loading: result?.revision !== revision, retry: () => revise((value) => value + 1) };
}
