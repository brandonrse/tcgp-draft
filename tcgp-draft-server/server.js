const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e6,
  allowEIO3: false,
  cors: {
    origin: 'https://tcgp-draft-client.onrender.com', // Replace with frontend URL
    methods: ['GET', 'POST'],
  },
});

console.log('Base path:', basePath);

fs.readdir(basePath, (err, files) => {
  if (err) {
    console.error('Error reading base path:', err);
  } else {
    console.log('Files and folders in base path:', files);
  }
});

const frontendPath = path.join(__dirname, '..', 'tcgp-draft-frontend');
fs.readdir(frontendPath, (err, files) => {
  if (err) {
    console.error('Error reading frontend path:', err);
  } else {
    console.log('Frontend folder contents:', files);
  }
});

console.log('Working directory:', process.cwd());

const rateLimit = new Map();

app.use(cors());
app.use(express.static(distPath));
app.use(express.json());


// In-memory storage for rooms and players
const rooms = {};

// Helper function to shuffle an array
function shuffle(array) {
  if (!Array.isArray(array)) {
    console.error('shuffle: Expected an array but got:', array);
    return [];
  }

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


// API to create a new room
app.post('/host', (req, res) => {
  console.log('host');
  const { username, roomPassword } = req.body;

  const roomId = uuidv4();

  rooms[roomId] = {
    roomId,
    host: username,
    players: [{ id: null, name: username, status: 'online' }],
    roomPassword,
    createdAt: Date.now(),
    packQueue: {}, // Add this to manage packs for each player
  };

  res.status(200).json({ message: 'Room created', roomId });
});

// API to join an existing room
app.post('/join', (req, res) => {
  const { username, roomId, roomPassword } = req.body;

  const room = rooms[roomId];
  console.log('room', JSON.stringify(room));
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.roomPassword !== roomPassword) {
    return res.status(403).json({ error: 'Incorrect room password' });
  }

  if (room.players.some((player) => player.name === username.trim())) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  // Add the player with a placeholder for socket.id
  room.players.push({ name: username, status: 'online' });
  res.status(200).json({ message: 'Joined room' });

  // Emit the updated players list to the room
  io.to(roomId).emit('update-players', room.players);

  if (room.draftStarted && !room.draftState.packQueue) {
    console.log('No pack queue');
    room.players.forEach((player) => {
      const packs = playerPacks[player.id];
      room.draftState.packQueue[player.id] = [packs[0]];
      room.draftState.packsRemaining[player.id] = [packs[1], packs[2]];
      room.draftState.playerDecks[player.id] = [];

      io.to(player.id).emit('receive-pack', packs[0]);
    });
  }
});

app.get('/rooms', (req, res) => {
  const roomList = Object.values(rooms).map(({ roomId, host, players, draftState }) => ({
    roomId,
    host,
    playerCount: players.filter((player) => player.status === 'online').length, // Count only online players,
    draftInProgress: !!draftState,
  }));
  res.json(roomList);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // Handle joining a room
  socket.on('join-room', (roomId, username) => {
    const now = Date.now();
    const last = rateLimit.get(socket.id) || 0;
    if (now - last < 1000) {
      return;
    }
    rateLimit.set(socket.id, now);

    console.log(`${username} is attempting to join room: ${roomId}`);
    const room = rooms[roomId];

    if (room) {
      // Check if the user is already in the room)
      const existingPlayer = room.players.find((player) => player.name === username);

      if (existingPlayer) {
        // Update the player's socket ID and status
        existingPlayer.id = socket.id;
        existingPlayer.status = 'online';
        console.log(`User ${username} - ${socket.id} rejoined room ${roomId}`);
      } else {
        // Add the new player if they don't already exist
        room.players.push({ id: socket.id, name: username, status: 'online' });
        console.log(`User ${username} - ${socket.id} joined room ${roomId}`);
      }
      console.log('existing player', existingPlayer);

      // Join the socket to the room
      socket.join(roomId);

      // Notify all clients in the room about the updated players list
      io.to(roomId).emit('update-players', room.players);
    } else {
      console.error(`Room ${roomId} not found`);
      socket.emit('redirect-home');
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('start-draft', (roomId, cardPool) => {
    const room = rooms[roomId];
    if (!room) {
      console.error(`Room ${roomId} not found`);
      socket.emit('redirect-home');
      return;
    }

    const unreadyPlayers = room.players.filter(p => !p.id);
    if (unreadyPlayers.length > 0) {
      console.error('Cannot start draft: Some players are missing socket IDs', unreadyPlayers);
      socket.emit('draft-error', 'Some players are not fully connected yet.');
      return;
    }

    room.packQueue = {}; // Initialize pack queues for each player

    room.draftState = {
      round: 0,
      playerDecks: {},
      packsRemaining: {},
      packQueue: {},
      readyPlayers: new Set(),
      cardPool: cardPool
    };

    // Emit the 'draft-started' event to notify all players
    io.to(roomId).emit('draft-started');
    room.draftStarted = true;
    
    console.log(`Draft started for room ${roomId}`);
  });

  socket.on('request-pack', (roomId) => {
    const room = rooms[roomId];
    room.players.forEach((player) => {
      io.to(player.id).emit('receive-pack', room.draftState.packQueue[player.id]);
    });
  });

  socket.on('client-ready-for-pack', (roomId) => {
    const room = rooms[roomId];
    if (!room || !room.draftStarted) { return; }

    const playerId = socket.id;
    room.draftState.readyPlayers.add(playerId);
    
    const playerPacks = generatePlayerPacks(room.draftState.cardPool, room.players)
    // Send the first pack to each player
    room.players.forEach((player) => {
      const packs = playerPacks[player.id];
      room.draftState.packQueue[player.id] = [packs[0]];
      room.draftState.packsRemaining[player.id] = [packs[1], packs[2]];
      room.draftState.playerDecks[player.id] = [];
      
      io.to(player.id).emit('receive-pack', packs[0]);
    });

  })

  socket.on('pick-card', (roomId, cardIndex) => {
    const playerId = socket.id;
    const room = rooms[roomId];

    if (!room || !room.draftState) {
      socket.emit('redirect-home');
      return;
    }

    const {
      playerDecks,
      packsRemaining,
      packQueue,
      pendingPasses = {} // new: store pending passes
    } = room.draftState;

    const queue = packQueue[playerId];
    if (!queue || queue.length === 0) {
      console.warn(`${playerId} tried to pick but has no pack`);
      return;
    }

    const currentPack = queue[0];
    const pickedCard = currentPack.splice(cardIndex, 1)[0];
    playerDecks[playerId].push(pickedCard);

    // Prepare the pack to pass
    const currentIndex = room.players.findIndex((p) => p.id === playerId);
    const nextIndex = (currentIndex + 1) % room.players.length;
    const nextPlayerId = room.players[nextIndex].id;

    const packToPass = structuredClone(currentPack);
    queue.shift(); // Remove the pack that was picked from queue

    // Try to pass the pack
    if (packToPass.length > 0) {
      if (!packQueue[nextPlayerId] || packQueue[nextPlayerId].length === 0) {
        packQueue[nextPlayerId] = [packToPass];
        io.to(nextPlayerId).emit('receive-pack', packToPass);
      } else {
        pendingPasses[nextPlayerId] ??= [];
        pendingPasses[nextPlayerId].push(packToPass);
      }
    }

    // Check for pending passes for this player (who just picked)
    if (pendingPasses[playerId] && pendingPasses[playerId].length > 0 && packQueue[playerId].length === 0) {
      const nextPending = pendingPasses[playerId].shift();
      packQueue[playerId].push(nextPending);
      io.to(playerId).emit('receive-pack', nextPending);
    }

    // Save pending passes back into the draft state
    room.draftState.pendingPasses = pendingPasses;

    // Check if everyone is done with the current round
    const everyoneDone = room.players.every((p) => packQueue[p.id]?.length === 0);
    if (everyoneDone) {
      const nextRound = room.draftState.round + 1;
      if (nextRound < 3) {
        room.draftState.round = nextRound;

        room.players.forEach(player => {
          const nextPack = packsRemaining[player.id].shift();
          if (nextPack) {
            packQueue[player.id] = [nextPack];
            io.to(player.id).emit('receive-pack', nextPack);
          }
        });

        room.draftState.pendingPasses = {}; // Reset pending passes for the new round
      } else {
        console.log(`Room ${roomId} draft finished and will be deleted.`);
        delete rooms[roomId];
        io.to(roomId).emit('draft-complete', playerDecks);
      }
    }
  });



  // Handle updating the pack queue
  socket.on('update-pack-queue', (roomId, updatedQueue) => {
    io.to(roomId).emit('update-pack-queue', updatedQueue);
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    // Find the room the player was in
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        // Remove the player from the room
        const disconnectedPlayer = room.players.splice(playerIndex, 1)[0];
        console.log(`Player ${disconnectedPlayer.name} removed from room ${roomId}`);

        // Notify other players in the room
        io.to(roomId).emit('update-players', room.players);

        // If the room is empty or undefined, delete it
        if (!room.players?.length) {
          console.log(`Room ${roomId} is empty and will be deleted.`);
          delete rooms[roomId];
        }

        break;
      }
    }
  });

  // Handle leaving a room
  socket.on('leave-room', (roomId, username) => {
    console.log(`User ${socket.id} left the room`);
    // Remove them from the room logic
    const room = rooms[roomId];
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      socket.leave(room.id);
    }
    if (room.players.length === 0) {
      console.log(`Room ${roomId} is empty. Starting deletion timer.`);
      setTimeout(() => {
        // Check if the room is still empty before deleting
        if (rooms[roomId] && rooms[roomId].players.length === 0) {
          console.log(`Room ${roomId} is being deleted.`);
          delete rooms[roomId];
        }
      }, 5 * 60 * 1000); // 5-minute grace period
    }
  });
});

// socket.on('leave-room', (roomId, username) => {
//     console.log(`Received leave-room event for user ${username} in room ${roomId}`);
//     console.log(`User ${username} is leaving room: ${roomId}`);
//     const room = rooms[roomId];

//     if (room) {
//       // Find the player in the room
//       const playerIndex = room.players.findIndex((player) => player.name === username);

//       if (playerIndex !== -1) {
//         // Remove the player from the room
//         const leavingPlayer = room.players.splice(playerIndex, 1)[0];
//         console.log(`Player ${leavingPlayer.name} removed from room ${roomId}`);

//         // Notify other players in the room
//         io.to(roomId).emit('update-players', room.players);

//         // If the room is empty, start a timer to delete it
//         if (room.players.length === 0) {
//           console.log(`Room ${roomId} is empty. Starting deletion timer.`);
//           setTimeout(() => {
//             // Check if the room is still empty before deleting
//             if (rooms[roomId] && rooms[roomId].players.length === 0) {
//               console.log(`Room ${roomId} is being deleted.`);
//               delete rooms[roomId];
//             }
//           }, 5 * 60 * 1000); // 5-minute grace period
//         }
//       }
//     } else {
//       console.error(`Room ${roomId} not found`);
//     }
//   });


app.get(/(.*)/, (req,res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Generate player packs for the draft
function generatePlayerPacks(cardPool, players) {
  if (!Array.isArray(cardPool) || cardPool.length === 0) {
    console.error('generatePlayerPacks: Invalid cardPool:', cardPool);
    return {};
  }

  const randomCards = shuffle(cardPool);
  const playerPacks = {};

  players.forEach((player, index) => {
    const playerCards = randomCards.slice(index * 30, (index + 1) * 30);
    playerPacks[player.id] = [
      playerCards.slice(0, 10),
      playerCards.slice(10, 20),
      playerCards.slice(20, 30),
    ];
  });

  return playerPacks;
}

// Run a cleanup task every hour
setInterval(() => {
  const now = Date.now();
  const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (now - room.createdAt > twelveHours && room.players.length === 0) {
      console.log(`Deleting room ${roomId} due to expiration.`);
      delete rooms[roomId];
    }
  }
}, 60 * 60 * 1000); // Run every hour

const PORT = process.env.PORT || 3001;
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
