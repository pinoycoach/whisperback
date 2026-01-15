import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Success from './Success';

// Simple router
const Root = () => {
  const path = window.location.pathname;
  
  if (path === '/success') {
    return <Success />;
  }
  
  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);