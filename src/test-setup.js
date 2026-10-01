import { vi } from 'vitest';
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true, value: function () { this.open = true; },
});
Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  configurable: true, value: function () { this.open = false; this.dispatchEvent(new Event('close')); },
});
Object.defineProperty(window, 'matchMedia', {
  configurable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn() })),
});
