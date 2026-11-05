import { useSyncExternalStore } from 'react';
import { getLanguage, setLanguage, subscribeLanguage, translate } from './language.js';

export function useI18n() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, () => 'uk');
  return { language, setLanguage, t: (key, values) => translate(language, key, values) };
}
