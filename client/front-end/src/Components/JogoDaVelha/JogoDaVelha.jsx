import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Row from "../Row";
import circle_icon from "../Assets/circle.png";
import cross_icon from "../Assets/cross.png";
import "./JogoDaVelha.css";

const socket = io("http://localhost:4000");

const JogoDaVelha = () => {
  const emptyBoard = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  const [board, setBoard] = useState(emptyBoard);
  const [player, setPlayer] = useState(null);
  const [turn, setTurn] = useState("circle");
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on("player-assigned", (assignedPlayer) => {
      setPlayer(assignedPlayer);
    });

    socket.on("move-made", ({ row, col, player: movePlayer }) => {
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((r, i) =>
          r.map((cell, j) =>
            i === row && j === col ? (movePlayer === "circle" ? circle_icon : cross_icon) : cell
          )
        );

        // Verificação de vitória com o board atualizado
        const winnerPlayer = checkWinner(newBoard);
        if (winnerPlayer) {
          setWinner(winnerPlayer);
          setGameOver(true);
        } else {
          const isBoardFull = newBoard.every((row) => row.every((cell) => cell !== null));
          if (isBoardFull) {
            setIsDraw(true);
            setGameOver(true);
          }
        }

        return newBoard;
      });
    });

    socket.on("turn-changed", (newTurn) => {
      setTurn(newTurn);
    });

    socket.on("game-reset", () => {
      setBoard(emptyBoard);
      setWinner(null);
      setIsDraw(false);
      setTurn("circle");
      setGameOver(false);
    });

    socket.on("player-left", () => {
      alert("O outro jogador saiu da partida.");
      setGameOver(true);
    });

    return () => {
      socket.off("player-assigned");
      socket.off("move-made");
      socket.off("turn-changed");
      socket.off("game-reset");
      socket.off("player-left");
    };
  }, []);

  function checkWinner(board) {
    const lines = [
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
    ];

    for (let line of lines) {
      const [[a, b], [c, d], [e, f]] = line;
      if (
        board[a][b] &&
        board[a][b] === board[c][d] &&
        board[a][b] === board[e][f]
      ) {
        return board[a][b];
      }
    }
    return null;
  }

  const handleClick = (row, col) => {
    if (gameOver) return;
    if (board[row][col]) return;
    if (player !== turn) {
      alert("Espere sua vez!");
      return;
    }

    socket.emit("make-move", { row, col, player });
  };

  const resetGame = () => {
    socket.emit("reset-game");
  };

  return (
    <div>
      <div className="board">
        {board.map((row, i) => (
          <Row key={i} row={row} rowIndex={i} handleClick={handleClick} />
        ))}
      </div>
      {winner && (
        <h2 className="message">
          Vitória do {winner === circle_icon ? "Círculo" : "X"}! 🎉
        </h2>
      )}
      {isDraw && !winner && <h2 className="message">Empate! 🤝</h2>}
      {!player && <p>Aguardando jogador...</p>}
      <button className="reset" onClick={resetGame} disabled={!player}>
        Jogar novamente
      </button>
    </div>
  );
};

export default JogoDaVelha;
