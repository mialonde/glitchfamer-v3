import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import { CMSProvider } from './context/CMSContext.tsx';
import './index.css';

// Polyfill Buffer for music-metadata-browser
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CMSProvider>
      <App />
    </CMSProvider>
  </StrictMode>,
);

