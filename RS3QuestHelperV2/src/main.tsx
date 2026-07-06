import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { V2_VERSION } from './App';
import './index.css';

console.log(`%c RUNNING RS3 QUEST HELPER V2 ${V2_VERSION} `, 'background:#1a4;color:#fff;font-size:14px;padding:4px 8px;');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
