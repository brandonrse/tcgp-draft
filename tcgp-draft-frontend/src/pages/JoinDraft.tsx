import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinDraft.css';
import Modal from '../components/Modal';

interface Room {
  roomId: string;
  host: string;
  players: string[];
  playerCount: number;
  draftInProgress?: boolean;
}

const JoinDraft: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [username, setUsername] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/rooms');
      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoinClick = (room: Room) => {
    setSelectedRoom(room);
    setShowModal(true);
    setFormError(''); 
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !roomPassword || !selectedRoom) return;

    setIsJoining(true);

    try {
      const response = await fetch('/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, roomId: selectedRoom.roomId, roomPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Failed to join room.');
        return;
      }

      navigate(`/room/${selectedRoom.roomId}`, { state: { username } });

    } catch (err) {
      console.error(err);
      setFormError('Could not connect to server.');

    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className="join-container">
      <h2 className="join-title">Available Draft Rooms</h2>

      {error && <p className="error">{error}</p>}

      <button className="refresh-button" onClick={fetchRooms}>
        Refresh Room List
      </button>

      {rooms.length === 0 ? (
        <p>No rooms available. Try hosting one!</p>
      ) : (
        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room.roomId} className="room-item">
              <span>Host: <strong>{room.host}</strong></span>
              <span>Room ID: {room.roomId}</span>
              <span>Number of Players: {room.playerCount}</span>
              
              {room.draftInProgress ? (
                <button disabled className='disabled-button'>Draft in Progress</button>
              ) : <button onClick={() => handleJoinClick(room)}>Join Room</button>
              }
            </li>
          ))}

          {selectedRoom && (
            <Modal show={showModal} onClose={() => setShowModal(false)}>
              <h3>Join Room</h3>
              <p>Host: <strong>{selectedRoom.host}</strong></p>
              <p>Room ID: <strong>{selectedRoom.roomId}</strong></p>
              {formError && <p className="error-message">{formError}</p>}

              <form onSubmit={handleJoinSubmit}>
                <label>
                  Username:
                  <input maxLength={15} value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                  Password:
                  <input type="password" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} required />
                </label>
                <button disabled={isJoining} type="submit">Join Room</button>
              </form>
            </Modal>
          )}
        </ul>
      )}
    </main>
  );
};

export default JoinDraft;
