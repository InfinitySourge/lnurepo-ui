import Button from './Button.jsx';
import Notice from './Notice.jsx';
import { API_ORIGIN } from '../api.js';
export default function CatalogFailure({ error, retry }) {
  const expired = error.status === 401;
  return <Notice variant="error" title={expired ? 'Сесія завершилась' : 'Не вдалося завантажити дані'}><p>{expired ? 'Увійдіть повторно.' : 'Спробуйте ще раз. Якщо проблема повторюється, зверніться до підтримки.'}</p><div className="mt-4">{expired ? <Button href={API_ORIGIN + '/auth/login'}>Увійти знову</Button> : <Button onClick={retry}>Спробувати ще раз</Button>}</div></Notice>;
}
