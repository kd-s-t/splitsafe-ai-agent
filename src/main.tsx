import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './lib/redux/store/store';
import App from './App';
import './styles/globals.css'; // Global styles
import './lib/utils/polyfills';

// Initialize polyfills early
if (typeof window !== 'undefined') {
  // Remove trailing slashes for IC deployment compatibility
  const currentPath = window.location.pathname;
  if (currentPath !== '/' && currentPath.endsWith('/')) {
    window.history.replaceState({}, '', currentPath.slice(0, -1));
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

