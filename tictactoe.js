/*============
player factory
============*/

const Player = (tic = 'X') => {
  return { tic, score: 0 };
}

/*=====
modules
=====*/


const gameBoard = (() => {

  const board = document.getElementById('gameBoard');
  const boardCells = document.querySelectorAll('.cell');
  const gameArray = [];
  
  const handleCellClick = (event) => {
    let turn = gameState.getTurn();
    displayController.renderBoard(event.currentTarget, turn);
    gameState.endGame();
    gameState.switchTurns();
  }
  
  const clickEvents = (cells) => cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick, { once: true });
    gameArray.push(cell);
  });
  
  const killEvents = (cells) => cells.forEach(cell => {
    if (cell.classList.contains('x') || cell.classList.contains('o')) cell.removeEventListener('click', handleCellClick);
  });

  const clearArray = () => gameArray.length = 0; //revisit this
  
  const newGameBoard = () => {
    clearArray();
    //console.log(gameArray);
    killEvents(boardCells);
    clickEvents(boardCells);
  }

  // const xButton = document.getElementById('xButton');
  // const oButton = document.getElementById('oButton');

  const getBoardState = () => gameArray;
  const getGameBoard = () => board;
  
  return {
    getBoardState,
    getGameBoard,
    newGameBoard
  };

})();

const displayController = (() => {

  const boardCells = document.querySelectorAll('.cell');

  const newGameDisplay = () => {
    boardCells.forEach(cell => cell.classList.remove('x'));
    boardCells.forEach(cell => cell.classList.remove('o'));
    gameOverModal.classList.remove('show');
    boardCells.forEach(cell => cell.classList.remove('modal-active'));
  }

  const setMark = (turn, cell) => {
    turn ? cell.classList.add('x') : cell.classList.add('o');
  }
  
  const setHover = (turn) => {
    gameBoard.getGameBoard().classList.remove('x');
    gameBoard.getGameBoard().classList.remove('o');
    let hover = gameBoard.getGameBoard().classList;
    turn ? hover.add('x') : hover.add('o');
  }
  
  const renderBoard = (cell, turn) => {
    setMark(turn, cell);
    setHover(!turn);
  }

  const gameOverMessage = document.querySelector('[data-game-over]');
  const setGameOverMessage = (turn, endState) => {
    let winner;
    turn ? winner = 'X' : winner = 'O';
    endState === 'win' ? gameOverMessage.textContent = `${winner} wins` : gameOverMessage.textContent = `tie`;
  }

  const gameOverModal = document.getElementById('gameOverModal');
  const gameOverDisplay = (turn, endState) => {
    setGameOverMessage(turn, endState);
    gameOverModal.classList.add('show');
    boardCells.forEach(cell => cell.classList.add('modal-active'));
  }

  return {
    renderBoard,
    setHover,
    gameOverDisplay,
    newGameDisplay
  }
})();

const gameState = (() => {

  let playerOne = Player();
  let xTurn = false;
  const newGameButton = document.getElementById('newGameButton');

  const winners = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  //const bestMove = 

  //const chooseTic = (e) => playerOne.tic = e;
  
  const initNewGame = () => {
    displayController.newGameDisplay();
    xTurn = false;
    displayController.setHover(xTurn);
    gameBoard.newGameBoard();
    newGameButton.addEventListener('click', gameState.initNewGame, {once: true}); 
  }
  
  const getTurn = () => xTurn;

  const switchTurns = () => xTurn = !xTurn;

  const checkWin = () => {
    let state = gameBoard.getBoardState();
    let turn;
    xTurn ? turn = 'x' : turn = 'o';
    return winners.some(combo => {
      return combo.every(i => {
        return state[i].classList.contains(turn);
      })
    })
  }

  const checkTie = () => {
    let state = gameBoard.getBoardState();
    return state.every(i => {
      return (i.classList.contains('x') || i.classList.contains('o'));
    });
  }

  const endGame = () => {
    if (checkWin()) return displayController.gameOverDisplay(xTurn, 'win');
    if (checkTie()) return displayController.gameOverDisplay(xTurn, 'tie');
  }

  return {
    getTurn,
    switchTurns,
    endGame,
    initNewGame
  }
})();

gameState.initNewGame();