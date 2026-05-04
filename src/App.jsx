import { useState, useEffect } from "react";
import "./App.css";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const MODES = {
  SINGLE: "single",
  MULTI: "multi",
};

function getEmptyBoard() {
  return Array(9).fill(null);
}

function calculateWinner(board) {
  for (let line of WIN_LINES) {
    const [a, b, c] = line;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  if (board.every(Boolean)) {
    return { winner: "draw", line: [] };
  }

  return null;
}

function getRandomMove(board) {
  const emptyCells = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) return null;

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getWinningMove(board, player) {
  for (let line of WIN_LINES) {
    const [a, b, c] = line;
    const values = [board[a], board[b], board[c]];

    const playerCount = values.filter((value) => value === player).length;
    const emptyCount = values.filter((value) => value === null).length;

    if (playerCount === 2 && emptyCount === 1) {
      return line[values.indexOf(null)];
    }
  }

  return null;
}

function getSmartMove(board) {
  let move = getWinningMove(board, "O");
  if (move !== null) return move;

  move = getWinningMove(board, "X");
  if (move !== null) return move;

  if (board[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return getRandomMove(board);
}

function getMasterMove(board) {
  let move = getWinningMove(board, "O");
  if (move !== null) return move;

  move = getWinningMove(board, "X");
  if (move !== null) return move;

  if (board[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length > 0) return corners[0];

  return getRandomMove(board);
}

export default function App() {
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const [board, setBoard] = useState(getEmptyBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("");
  const [winLine, setWinLine] = useState([]);

  const [score, setScore] = useState({
    X: 0,
    O: 0,
    draw: 0,
  });

  const result = calculateWinner(board);
  const isComputerTurn =
    mode === MODES.SINGLE && !xIsNext && !result;

  function startSingleGame(selectedDifficulty) {
    setMode(MODES.SINGLE);
    setDifficulty(selectedDifficulty);
    resetBoard();
  }

  function startMultiGame() {
    setMode(MODES.MULTI);
    setDifficulty(null);
    resetBoard();
  }

  function resetBoard() {
    setBoard(getEmptyBoard());
    setXIsNext(true);
    setStatus("");
    setWinLine([]);
  }

  function resetScore() {
    setScore({
      X: 0,
      O: 0,
      draw: 0,
    });
  }

  function goMainMenu() {
    setMode(null);
    setDifficulty(null);
    resetBoard();
  }

  function handleClick(index) {
    if (board[index] || status) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";

    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  useEffect(() => {
    if (!isComputerTurn) return;

    let move = null;

    if (difficulty === "easy") {
      move = getRandomMove(board);
    }

    if (difficulty === "medium") {
      move = getWinningMove(board, "O");
      if (move === null) move = getRandomMove(board);
    }

    if (difficulty === "hard") {
      move = getSmartMove(board);
    }

    if (difficulty === "master") {
      move = getMasterMove(board);
    }

    if (move !== null) {
      setTimeout(() => {
        handleClick(move);
      }, 500);
    }
  }, [board, isComputerTurn, difficulty]);

  useEffect(() => {
    const winnerResult = calculateWinner(board);

    if (!winnerResult) {
      setStatus("");
      return;
    }

    if (winnerResult.winner === "draw") {
      setStatus("Beraberlik!");
      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));
    } else {
      setStatus(`Kazanan: ${winnerResult.winner}`);
      setWinLine(winnerResult.line);
      setScore((prev) => ({
        ...prev,
        [winnerResult.winner]: prev[winnerResult.winner] + 1,
      }));
    }
  }, [board]);

  if (!mode) {
    return (
      <div className="app">
        <div className="menu-card">
          <h1>XOX</h1>
          <p className="subtitle">Oyun modunu seç</p>

          <button className="big-btn" onClick={startMultiGame}>
            2 Kişi Oyna
          </button>

          <div className="difficulty-box">
            <p>Tek kişi - bilgisayara karşı</p>

            <div className="difficulty-buttons">
              <button onClick={() => startSingleGame("easy")}>Kolay</button>
              <button onClick={() => startSingleGame("medium")}>Orta</button>
              <button onClick={() => startSingleGame("hard")}>Zor</button>
              <button onClick={() => startSingleGame("master")}>Usta</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="game-card">
        <h1>XOX</h1>

        <div className="top-buttons">
          <button onClick={resetBoard}>Yeniden Başlat</button>
          <button onClick={resetScore}>Skor Sıfırla</button>
          <button onClick={goMainMenu}>Ana Menü</button>
        </div>

        <div className="info">
          <p>{status ? status : `Sıra: ${xIsNext ? "X" : "O"}`}</p>

          <p>
            Mod: {mode === MODES.SINGLE ? "Tek Kişi" : "2 Kişi"}
            {mode === MODES.SINGLE &&
              ` | Zorluk: ${
                difficulty === "easy"
                  ? "Kolay"
                  : difficulty === "medium"
                  ? "Orta"
                  : difficulty === "hard"
                  ? "Zor"
                  : "Usta"
              }`}
          </p>
        </div>

        <div className="score">
          <span>X: {score.X}</span>
          <span>O: {score.O}</span>
          <span>Beraberlik: {score.draw}</span>
        </div>

        <div className="board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${winLine.includes(index) ? "win" : ""}`}
              onClick={() => {
                if (mode === MODES.SINGLE && !xIsNext) return;
                handleClick(index);
              }}
              disabled={
                !!cell ||
                !!status ||
                (mode === MODES.SINGLE && !xIsNext)
              }
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}