import '@/lib/errorReporter';
import { enableMapSet } from "immer";
import React, { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import '@/index.css';
import App from './App';
enableMapSet();
/**
 * Singleton pattern for React Root to prevent double-initialization warnings
 * during Hot Module Replacement (HMR).
 */
declare global {
  interface Window {
    __reactRoot?: Root;
  }
}
const container = document.getElementById('root');
if (container) {
  if (!window.__reactRoot) {
    window.__reactRoot = createRoot(container);
  }
  window.__reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}