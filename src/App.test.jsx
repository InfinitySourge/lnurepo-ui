import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Render main app', () => {
  it('App successfully renders without crashes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }));
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
   
    expect(await screen.findByRole('link', { name: 'Увійти через Microsoft' })).toBeTruthy();
  });
});
