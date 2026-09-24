import React from 'react';
import ReactDOM from 'react-dom/client';
import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../keystatic/keystatic.config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Keystatic config={keystaticConfig} />
  </React.StrictMode>
);
