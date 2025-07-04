import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './Room.css';
import SettingsPanel from '../components/SettingsPanel';
import Draft from '../components/Draft';
import type { Socket } from 'socket.io-client';
import { useCardData } from '../hooks/useCardData';
import { 
  getCardsByPackIds, 
  getCardsWithoutTag,
  getRandomPokemonCards,
  getCardsByCardType,
  getAllTrainerCards,
  getCardsByTag,
  getCardsByTypes
} from '../services/CardService';
import type { Card } from '../interfaces/Card';

const ClipboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: '4px' }}
  >
    <path d="M16 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <polyline points="16 2 16 6 8 6 8 2" />
  </svg>
);

interface LocationState {
  username: string;
}

interface Player {
  id: string; 
  name: string;
}

interface Settings {
  timerEnabled: boolean;
  allowedExpansions: string[];
  coinFlipsEnabled: boolean;
  energyGenerationEnabled: boolean;
  exsEnabled: boolean;
  excludeTrainerCards: boolean;
  shopCardsEnabled: boolean;
  allowedTypes: string[];
}

const Room: React.FC<{ socket: Socket }> = ({ socket }) => {
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>({
    timerEnabled: false,
    allowedExpansions: ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a'],
    coinFlipsEnabled: true,
    energyGenerationEnabled: true,
    exsEnabled: true,
    excludeTrainerCards: false,
    shopCardsEnabled: true,
    allowedTypes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  });
  const [isDraftStarted, setIsDraftStarted] = useState(false); 
  const [currentPack, setCurrentPack] = useState<Card[]>([]);
  const [waitingForPack, setWaitingForPack] = useState(false); 
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const { username } = location.state as LocationState;
  const { cards } = useCardData();
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    const handleUnload = () => {
      socket.emit('leave-room', roomId, username);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [socket, roomId, username]);


  useEffect(() => {
    if (!hasJoinedRef.current) {
      socket.emit('join-room', roomId, username);
      hasJoinedRef.current = true;
    }

    socket.on('user-joined', (data) => {
      setPlayers((prev) => [...prev, data]);
    });

    socket.on('update-players', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('draft-started', () => {
      setIsDraftStarted(true);
    });

    socket.on('draft-error', (message) => {
      console.log('error', message);
    })

    return () => {
      socket.off('user-joined');
      socket.off('update-players');
      socket.off('draft-started');
      socket.off('draft-error');
      socket.off('receive-pack');
    };
  }, [roomId, socket, username]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateAllowedExpansions = (expansion: string) => {
    setSettings((prev) => {
      const isSelected = prev.allowedExpansions.includes(expansion);
      const updatedExpansions = isSelected
        ? prev.allowedExpansions.filter((e) => e !== expansion) // Remove if already selected
        : [...prev.allowedExpansions, expansion]; // Add if not selected
      return { ...prev, allowedExpansions: updatedExpansions };
    });
  };

  const updateAllowedTypes = (type: string) => {
    setSettings((prev) => {
      const isSelected = prev.allowedTypes.includes(type);
      const updatedTypes = isSelected ? prev.allowedTypes.filter((t) => t !== type) : [...prev.allowedTypes, type];
      return {...prev, allowedTypes: updatedTypes};
    });
  };

  const startDraft = () => {
    if (settings.allowedExpansions.length === 0) {
      alert('No expansions selected.');
      console.log('No expansions selected.');
    } else {
      if (!cards) {
        console.error('Card data is not available.');
        return;
      }

      // Filter by energy
      let cardPool = getCardsByTypes(cards, settings.allowedTypes);
      let trainerCards = getAllTrainerCards(cards);
      cardPool = [...cardPool, ...trainerCards];
      cardPool = getCardsByPackIds(cardPool, settings.allowedExpansions);
      

      if (settings.shopCardsEnabled && !settings.allowedExpansions.includes('P-A')) {
        let shopCards = getCardsByTag(cards, 'shop');
        cardPool = [...shopCards, ...cardPool];
      }

      if (settings.excludeTrainerCards) {
        let pokemonCards = getCardsByCardType(cards, 'Pokemon');
        let filteredPokemon = getCardsByPackIds(pokemonCards, settings.allowedExpansions);
        cardPool = [...filteredPokemon, ...trainerCards];
      }
      
      if (!settings.coinFlipsEnabled) {
        cardPool = getCardsWithoutTag(cardPool, 'coin flips');
      }
      if (!settings.energyGenerationEnabled) {
        cardPool = getCardsWithoutTag(cardPool, 'energy generation');
      }
      if (!settings.exsEnabled) {
        cardPool = getCardsWithoutTag(cardPool, 'ex');
      }
      
      if (cardPool == undefined || cardPool?.length * 2 < players.length * 30) {
        alert('Not enough cards were available with your selected settings.');
        console.log('Not enough cards were available.');
        return;
      }
      const randomCards = getRandomPokemonCards(cardPool, players.length * 30);
      if (randomCards.length < players.length * 30) {
        alert('Not enough cards were available with your selected settings.');
        console.log('Not enough cards were available.');
        return;
      }
      socket.emit('start-draft', roomId, randomCards);
    }
  };

  const handleCardPick = (cardIndex: number) => {
    setCurrentPack((prevPack) => prevPack.filter((_, index) => index !== cardIndex));
  };

  if (isDraftStarted) {
    // Render the Draft component when the draft starts
    return (
        <Draft
          settings={settings}
          players={players}
          socket={socket}
          roomId={roomId || ''}
          currentPack={currentPack} // Pass the pack as a prop
          setCurrentPack={setCurrentPack}
          onCardPick={handleCardPick} // Pass the callback
          waitingForPack={waitingForPack} // Pass the waiting state
          setWaitingForPack={setWaitingForPack} // Pass the setter function
        />
    );
  }

  return (
    <main className="room-container">
      {/* Render SettingsPanel only if the current user is the host */}
      {username === players[0]?.name && (
        <SettingsPanel
          settings={settings}
          toggleSetting={toggleSetting}
          updateAllowedExpansions={updateAllowedExpansions}
          updateAllowedTypes={updateAllowedTypes}
        />
      )}

      <section className="room-info">
        <h2>
          Room ID: <code>{roomId}</code>
          <button className="copy-button" onClick={copyToClipboard}>
            <ClipboardIcon />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </h2>

        <h3>Players:</h3>
        <ul>
          {players.map((p) => (
            <li key={p.id || `${p.name}`}>
              <span>{p.name}</span>
            </li>
          ))}
        </ul>

        <p>Waiting for more players to join...</p>

        {/* Only show Start button to the host */}
        {username === players[0]?.name && (
          <button onClick={startDraft}>Start Draft</button>
        )}
      </section>
    </main>
  );
};

export default Room;
