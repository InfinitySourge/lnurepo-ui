import { useI18n } from '../i18n/useI18n.js';
import Button from './Button.jsx';
import Notice from './Notice.jsx';
import { API_ORIGIN } from '../api.js';
export default function CatalogFailure({ error, retry }) {
  const { t } = useI18n();
  const expired = error.status === 401;
  return <Notice variant="error" title={expired ? t('error.session') : t('error.load')}><p>{expired ? t('error.sessionDescription') : t('error.loadDescription')}</p><div className="mt-4">{expired ? <Button href={API_ORIGIN + '/auth/login'}>{t('common.loginAgain')}</Button> : <Button onClick={retry}>{t('common.retry')}</Button>}</div></Notice>;
}
