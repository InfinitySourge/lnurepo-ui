import { useI18n } from '../i18n/useI18n.js';
import { Link } from 'react-router-dom';
export default function Brand({ className = '' }) {
  const { t } = useI18n();
  return <Link to="/" aria-label={t('navigation.brand')} className={`inline-flex rounded-md bg-white px-1 focus-visible:outline-2 focus-visible:outline-blue-400 ${className}`}>
    <img src="/wordmark.svg" alt="LNUrepo" width="200" height="54" className="h-11 w-40 object-contain sm:w-44" />
  </Link>;
}
