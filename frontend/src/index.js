import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// ✅ Suppress ResizeObserver warning + error logs
const originalWarn = console.warn;
console.warn = function (msg, ...args) {
  if (
    typeof msg === "string" &&
    msg.includes("ResizeObserver loop completed")
  ) return;
  originalWarn(msg, ...args);
};

const originalError = console.error;
console.error = function (msg, ...args) {
  if (
    typeof msg === "string" &&
    msg.includes("ResizeObserver loop completed")
  ) return;
  originalError(msg, ...args);
};



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
reportWebVitals();
