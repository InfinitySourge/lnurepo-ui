import { Component } from 'react';
import Button from './Button.jsx';
import Brand from './Brand.jsx';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="grid min-h-screen place-items-center p-6"><section className="max-w-md text-center">
      <Brand className="mx-auto" /><h1 className="mt-4 text-2xl font-bold">Не вдалося відкрити сторінку</h1>
      <p className="mt-3 mb-6 text-slate-500">Оновіть сторінку. Якщо помилка повториться, зверніться до підтримки.</p>
      <Button onClick={() => window.location.reload()}>Оновити сторінку</Button>
    </section></main>;
  }
}
