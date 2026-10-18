import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { App } from './App.tsx';

// BEGIN main_giris
// createRoot ile App bileşenini #root'a, StrictMode içinde bağlar.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
// END main_giris
