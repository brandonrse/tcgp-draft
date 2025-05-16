import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import './App.css';
import HostDraft from './pages/HostDraft';
import JoinDraft from './pages/JoinDraft';
import Room from './pages/Room';
import Navbar from './Navbar';
import { CardDataProvider } from './context/CardDataContext';
import Footer from './Footer';

interface AppProps {
  socket: import("socket.io-client").Socket; 
}

function App({ socket }: AppProps) {
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('redirect-home', () => {
      console.log('Redirecting to home page');
      navigate('/');
    });

    return () => {
      socket.off('redirect-home');
    };
  }, [socket, navigate]);
  return (
      <CardDataProvider>
        <Navbar />
        <div className='main-content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/host" element={<HostDraft />} />
            <Route path="/join" element={<JoinDraft />} />
            <Route path="/room/:roomId" element={<Room socket={socket} />} />
          </Routes>
          <Footer />
        </div>

      </CardDataProvider>
  );
}

export default App;
