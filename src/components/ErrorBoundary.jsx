import { Component } from 'react';
import { useI18n } from '../i18n/useI18n.js';
import Button from './Button.jsx';
import Brand from './Brand.jsx';
function Failure() {
  const { t } = useI18n();
  return <main className="grid min-h-screen place-items-center p-6"><section className="max-w-md text-center">
    <Brand className="mx-auto" /><h1 className="mt-4 text-2xl font-bold">{t('error.boundaryTitle')}</h1>
    <p className="mt-3 mb-6 text-slate-500">{t('error.boundaryDescription')}</p>
    <Button onClick={() => window.location.reload()}>{t('error.refresh')}</Button>
  </section></main>;
}
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <Failure />;
  }
}
