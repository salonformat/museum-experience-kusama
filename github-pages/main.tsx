import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <a className="portfolio-return" href="https://salonformat.com/">Salon Format ↗</a>
    <Home />
  </React.StrictMode>,
);
