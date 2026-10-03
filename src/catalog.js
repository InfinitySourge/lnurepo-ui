import { useEffect, useState } from 'react';
import { ApiError, request } from './api.js';
function validBucket(b) {
  return b && typeof b.available === 'boolean' && typeof b.has_more === 'boolean' && Array.isArray(b.items) && b.items.length <= 30 && (b.available || b.items.length === 0)
    && b.items.every((i) => i && (i.description === undefined || typeof i.description === 'string' && i.description.length <= 2000) && ['id', 'title', 'faculty'].every((k) => typeof i[k] === 'string' && i[k].length > 0 && i[k].length <= ({id:128,title:300,faculty:120})[k]));
}
export function useCatalogData(faculty, query = '', favorites = false) {
  const [revision, revise] = useState(0);
  const key = JSON.stringify([faculty, query, favorites, revision]);
  const [result, update] = useState(null);
  useEffect(() => {
    if (!favorites && !faculty) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await request(favorites ? '/api/favorites' : '/api/catalog', {signal: controller.signal, ...(favorites ? {} : {query:{faculty,q:query}})});
        if (!(favorites ? validBucket(data) : data && ['disciplines','teachers','materials'].every((n) => validBucket(data[n])))) throw new ApiError();
        if (!controller.signal.aborted) update({key,data});
      } catch (error) { if (!controller.signal.aborted) update({key,error}); }
    }, query ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [faculty, query, favorites, key]);
  return {...(result?.key === key ? result : {}), loading:result?.key !== key, retry:() => revise((v) => v + 1)};
}
