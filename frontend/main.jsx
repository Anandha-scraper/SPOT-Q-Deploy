import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import { AuthProvider } from './src/context/AuthContext';
import { HeroUIProvider } from '@heroui/react';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);