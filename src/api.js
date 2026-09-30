const configuredOrigin = import.meta.env.VITE_API_ORIGIN || 'https://api.lnurepo.info';
const apiUrl = new URL(configuredOrigin);
if (apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash || apiUrl.username || apiUrl.password
    || !['http:', 'https:'].includes(apiUrl.protocol)
    || (import.meta.env.PROD && apiUrl.protocol !== 'https:')) {
  throw new Error('VITE_API_ORIGIN must be an origin (HTTPS in production)');
}
export const API_ORIGIN = apiUrl.origin;
