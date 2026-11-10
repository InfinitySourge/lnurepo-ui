import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { initializeTheme } from './theme.js';
import { initializeLanguage } from './i18n/language.js';

initializeTheme();
initializeLanguage();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
