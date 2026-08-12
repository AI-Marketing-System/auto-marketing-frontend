import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let [resource, config] = args;
  if (typeof resource === 'string' && (resource.includes('/api/v1') || resource.includes('ngrok'))) {
    config = config || {};
    config.headers = config.headers || {};
    if (config.headers instanceof Headers) {
      config.headers.append('ngrok-skip-browser-warning', 'true');
    } else {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    args[1] = config;
  }
  return originalFetch(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

