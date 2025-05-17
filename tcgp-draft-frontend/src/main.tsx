import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { io } from 'socket.io-client';

// Initialize the socket connection globally
const socket = io('http://localhost:3001'); // Replace with server URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App socket={socket} />
    </BrowserRouter>
  </StrictMode>
);
