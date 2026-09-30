import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('Render main app', () => {
  it('App successfully renders without crashes', () => {
    const result = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
   
    expect(result).toBeTruthy();
  });
});