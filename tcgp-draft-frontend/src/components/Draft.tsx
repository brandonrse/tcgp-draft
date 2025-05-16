import React, { useState, useEffect } from 'react';
import './Draft.css';
import { useCardData } from '../hooks/useCardData';
import { getCardImageUrl } from '../services/CardService';
import type { Card } from '../interfaces/Card';
import type { Socket } from 'socket.io-client';

interface DraftProps {
  settings: {
    allowedExpansions: string[];
    coinFlipsEnabled: boolean;
    energyGenerationEnabled: boolean;
    exsEnabled: boolean;
  };
  players: { id: string; name: string }[];
  roomId: string;
  socket: Socket;
  currentPack: Card[];
  setCurrentPack: React.Dispatch<React.SetStateAction<Card[]>>;
  onCardPick: (cardIndex: number) => void;
  waitingForPack: boolean;
  setWaitingForPack: React.Dispatch<React.SetStateAction<boolean>>; // Add this prop
}

const Draft: React.FC<DraftProps> = ({
  players,
  roomId,
  socket,
  currentPack,
  setCurrentPack,
  onCardPick,
  waitingForPack,
  setWaitingForPack,
}) => {
  const { cards, loading } = useCardData();
  const [clickedCards, setClickedCards] = useState<Set<number>>(new Set());
  const [playerDecks, setPlayerDecks] = useState<{ [playerId: string]: Card[] }>({});
  const [clickLocked, setClickLocked] = useState(false);
  const [draftComplete, setDraftComplete] = useState(false);
  const [animatingCardIndex, setAnimatingCardIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  useEffect(() => {
    // If we are not waiting and there is no pack, request one
    if (!waitingForPack && !currentPack) {
      console.log('No cards in current pack. Requesting new pack from server...');
      socket.emit('request-pack', roomId);
      setWaitingForPack(true); // Prevent repeated requests
    }
  }, [currentPack, waitingForPack, socket, roomId, setWaitingForPack]);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('client-ready-for-pack', roomId);
    }
    
  }, [socket, roomId]);

  useEffect(() => {
    const handleReceivePack = (pack: Card[]) => {
      setCurrentPack(pack);
      setClickedCards(new Set()); 
      setWaitingForPack(false); 
      setClickLocked(false);
    }
    socket.on('receive-pack', handleReceivePack);

    socket.on('draft-complete', () => {
      setWaitingForPack(false);
      setDraftComplete(true);
    });

    return () => {
      socket.off('receive-pack', handleReceivePack);
    };
  }, [socket, setWaitingForPack, setCurrentPack]);

  const handleCardClick = (cardIndex: number) => {
    if (clickedCards.has(cardIndex) || clickLocked) {
      return;
    }

    setClickLocked(true);
    setAnimatingCardIndex(cardIndex);

    const selectedCard = currentPack[cardIndex];

    setPlayerDecks((prevDecks) => {
      const playerId = players[0]?.id;
      const updatedDeck = [...(prevDecks[playerId] || []), selectedCard];
      return {
        ...prevDecks,
        [playerId]: updatedDeck,
      };
    });

    setClickedCards((prevClicked) => new Set(prevClicked).add(cardIndex));

    setTimeout(() => {
      onCardPick(cardIndex);
      socket.emit('pick-card', roomId, cardIndex);

      // Set waiting state
      setWaitingForPack(true);
        setAnimatingCardIndex(null);
    }, 1000);
  };

  const sortDeck = (playerId: string) => {
    setPlayerDecks((prevDecks) => {
      const sortedDeck = [...(prevDecks[playerId] || [])].sort((a, b) => {
        if (a.type === b.type) {
          return (a.cardName || '').localeCompare(b.cardName || '');
        }
        return a.type.localeCompare(b.type);
      });
      return {
        ...prevDecks,
        [playerId]: sortedDeck,
      };
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!cards) return <div>No cards available</div>;

  return (
    <>
    <div>
      {draftComplete ? (<h2 className='header'>Drafting finished! Take a screenshot!</h2>) : (<h2 className='header'>Draft in Progress</h2>)}
      </div>
    <div className="draft-container">
      {/* Players List Sidebar */}
      <div className="player-container">
        <h3>Players:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
        <div className="deck-container">
          <button className="sort-button" onClick={() => sortDeck(players[0]?.id)}>
            Sort Deck
          </button>
          <div className='deck-stats'>
            <p>Cards: {playerDecks[players[0]?.id]?.length}/30</p>
            <p><b>Pokémon: {playerDecks[players[0]?.id]?.filter((c) => c.cardType === 'Pokemon').length}</b> | Basics: {playerDecks[players[0]?.id]?.filter((c) => c.stage === 'Basic').length} | Stage 1: {playerDecks[players[0]?.id]?.filter((c) => c.stage === '1').length} | Stage 2: {playerDecks[players[0]?.id]?.filter((c) => c.stage === '2').length}</p>
            <p><b>Trainers: {playerDecks[players[0]?.id]?.filter((c) => c.cardType !== 'Pokemon').length}</b> | Supporters: {playerDecks[players[0]?.id]?.filter((c) => c.cardType === 'Supporter').length} | Items: {playerDecks[players[0]?.id]?.filter((c) => c.cardType === 'Item').length} | Tools: {playerDecks[players[0]?.id]?.filter((c) => c.cardType === 'Tool').length} | Stadiums: {playerDecks[players[0]?.id]?.filter((c) => c.cardType === 'Stadium').length}</p>
          </div>
          <div className="deck-cards">
            {playerDecks[players[0]?.id]?.map((card, index) => (
              <img
                key={`${card.cardNum}-${index}`}
                src={getCardImageUrl(card, 'EN')}
                alt={card.cardName}
                className="deck-card"
                onMouseEnter={() => setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pack-container">
        {hoveredCard && (
          <div className='hovered-card'>
            <img src={getCardImageUrl(hoveredCard, 'EN')} alt={hoveredCard.cardName}></img>
          </div>
        )}
        {waitingForPack ? (
          <p>Waiting for your next pack...</p> 
        ) : currentPack ? (
          currentPack.map((card, index) => (
            <img
              key={index}
              src={getCardImageUrl(card, 'EN')}
              alt={card.cardName}
              onClick={() => handleCardClick(index)}
              className={`card ${clickedCards.has(index) ? 'disabled' : ''} ${animatingCardIndex === index ? 'animate-to-deck' : ''}`}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
            />
          ))
        ) : <p>No cards available</p>
        }
      </div>
    </div>
    </>
  );
};

export default Draft;

