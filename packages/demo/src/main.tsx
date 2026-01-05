import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@rowakit/table/styles';
import './styles.css';
import './styles/app.css';
import './styles/AppShell.css';
import './styles/DemoPage.css';
import './styles/CodePanel.css';
import './styles/CopyButton.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
