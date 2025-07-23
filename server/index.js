const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let players = [];
let currentTurn = 'circle';
let board = Array(3).fill(null).map(() => Array(3).fill(null));

function checkWinner() {
  const lines = [
    // linhas
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // colunas
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // diagonais
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }

  return null;
}

io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  if (players.length < 2) {
    players.push(socket.id);
    socket.emit('player-assigned', players.length === 1 ? 'circle' : 'cross');
  } else {
    socket.emit('room-full');
    socket.disconnect();
    return;
  }

  socket.on('make-move', ({ row, col, player }) => {
    if (player !== currentTurn || board[row][col]) return;

    board[row][col] = player;
    currentTurn = currentTurn === 'circle' ? 'cross' : 'circle';

    const winner = checkWinner();
    io.emit('move-made', { row, col, player });

    if (winner) {
      io.emit('game-won', winner);
    } else {
      io.emit('turn-changed', currentTurn);
    }
  });

  socket.on('reset-game', () => {
    board = Array(3).fill(null).map(() => Array(3).fill(null));
    currentTurn = 'circle';
    io.emit('game-reset');
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);
    players = players.filter(id => id !== socket.id);
    board = Array(3).fill(null).map(() => Array(3).fill(null));
    currentTurn = 'circle';
    io.emit('player-left');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
