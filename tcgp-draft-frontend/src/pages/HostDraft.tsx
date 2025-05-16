import React, { useState } from 'react';
import './HostDraft.css';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

const HostDraft: React.FC = () => {
  const [username, setUsername] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !roomPassword.trim()) {
      alert('Please fill out both fields.');
      return;
    }

    try {
      const response = await apiFetch('/host', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, roomPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Something went wrong.');
        return;
      }

      setSubmitted(true);
      setRoomId(data.roomId);
      navigate(`/room/${data.roomId}`, {state: {username}});
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <main className="host-container">
      <h2 className="host-title">Host a New Draft</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="host-form">
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Room Password:
            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit">Create Room</button>
        </form>
      ) : (
        <div>
          <p>Room hosted! Waiting for players to join...</p>
          <p>Room ID: {roomId}</p>
          <p>Share the room ID with players to join.</p>
        </div>
      )}
    </main>
  );
};

export default HostDraft;
