// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // seu App.jsx será resolvido normalmente
import './index.css';   // se você tiver esse arquivo, senão pode remover esta linha

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
