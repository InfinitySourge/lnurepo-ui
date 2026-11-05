import { useState } from 'react';
import { useI18n } from '../i18n/useI18n.js';
import { ApiError, errorMessage, request } from '../api.js';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function FavoriteButton({ materialId, initiallySaved = false, onRemoved }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const path = '/api/favorites/' + materialId;
      if (saved) {
        try { await request(path, { method: 'DELETE' }); }
        catch (failure) { if (failure.status !== 404) throw failure; }
        setSaved(false);
        onRemoved?.();
      } else {
        try {
          const result = await request('/api/favorites', { method: 'POST', body: { material_id: Number(materialId) } });
          if (result?.material_id !== Number(materialId)) throw new ApiError();
        }
        catch (failure) {
          if (failure.status !== 409) throw failure;
          const existing = await request(path);
          if (existing?.material_id !== Number(materialId)) throw new ApiError();
        }
        setSaved(true);
      }
    } catch (failure) { setError(failure); }
    finally { setBusy(false); }
  }
  return <>
    <Button variant="secondary" className="mt-4 w-full" aria-pressed={saved} busy={busy} onClick={toggle}>{t(saved ? 'favorites.remove' : 'favorites.save')}</Button>
    <Modal open={Boolean(error)} title={t('favorites.failed')} onClose={() => setError(null)}>{error && errorMessage(error)}</Modal>
  </>;
}
