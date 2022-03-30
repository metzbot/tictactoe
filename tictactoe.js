/*============
player factory
============*/

const Player = (tic = 'X') => {
  return { tic, score: 0 };
}

/*=======
<MODULES>
=======*/

/*=============================================
gameBoard module for managing the current state
of the cell grid, and click events etc
=============================================*/
const gameBoard = (() => {

  const board = document.getElementById('gameBoard');
  const gameArray = [];
  
  const handleCellClick = (event) => {
    let turn = gameState.getTurn();
    displayController.renderBoard(event.currentTarget, turn);
    gameState.deductMove();
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
    const boardCells = document.querySelectorAll('.cell');
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

/*=================================================
displayController module for managing DOM rendering
=================================================*/
const displayController = (() => {

  const boardCells = document.querySelectorAll('.cell');
  const newSheet = document.styleSheets.item(0);

  const newGameDisplay = (grid) => {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    for (i = 0; i < (grid * grid); i++) {
      gameBoard.innerHTML += `<div class='cell' data-cell></div>`;
    }
    gameBoard.style.gridTemplateColumns = `repeat(${grid}, auto)`;
    console.log(newSheet.cssRules[0]);
    if (newSheet.cssRules[0].cssText !== "*, ::after, ::before { box-sizing: border-box; }") {
      console.log('fuck');
      removeStyle();
    }

    styleBoard(grid);
    boardCells.forEach(cell => cell.classList.remove('x'));
    boardCells.forEach(cell => cell.classList.remove('o'));
    gameOverModal.classList.remove('show');
    boardCells.forEach(cell => cell.classList.remove('modal-active'));
  }

  const styleBoard = (n) => {
    let topBorder = `.cell:first-child, .cell:nth-child(`;
    for (let i = 2; i <= n; i++) {
      if (i !== n) topBorder += `${i}), .cell:nth-child(`;
      if (i === n) topBorder += `${i})`;
    }
    topBorder += ' { border-top: none }';

    let leftBorder = `.cell:nth-child(${n}n + 1) { border-left: none }`;
    
    let rightBorder = `.cell:nth-child(${n}n + ${n}) { border-right: none }`;
    
    let bottomBorder = `.cell:last-child, .cell:nth-child(`;
    let totalCells = n * n;
    for (let i = totalCells - 1; i > totalCells - n; i--) {
      if (i !== totalCells - n + 1) bottomBorder += `${i}), .cell:nth-child(`;
      else bottomBorder += `${i})`;
    }
    bottomBorder += ' { border-bottom: none }';

    newSheet.insertRule(topBorder, 0);
    newSheet.insertRule(leftBorder, 0);
    newSheet.insertRule(rightBorder, 0);
    newSheet.insertRule(bottomBorder, 0);

    return {
      bottomBorder
    }
  }

  const removeStyle = () => {
    for (let i = 0; i < 4; i++) {
      newSheet.deleteRule(0);
    }
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
    newGameDisplay,
    styleBoard
  }
})();

/*===========================================================
gameState module that controls logic for creating a new game,
win conditions, stalemates, current player, etc
===========================================================*/
const gameState = (() => {

  //let playerOne = Player();
  let xTurn = false; //randomize this?
  let userGridSize = 0; //user input
  let gridSize = 0;
  let oMovesRemaining = 0;
  let xMovesRemaining= 0;

  const newGameButton = document.getElementById('newGameButton');

  const oMovesRemainingCalc = (n) => { //called on newGameInit only, deducted later
    if (xTurn) return Math.floor(n / 2);
    else return Math.ceil(n / 2);
  }

  const deductMove = () => {
    xTurn ? xMovesRemaining-- : oMovesRemaining--;
  }

  /*algorithmic win condition (on n*n grid):
  rows are 0+
  columns are 0, 0+n, ...
  forward diagonal is n, n+4, ...
  backward diagonal n, n+2, ...
  */
 
  let winners = [];

  const algoWinners = (n) => {
    let totalCells = n * n;
    const wins = [];
    let tempWins = [];
    
    for (let i = 0; i < totalCells; i++) { //row combos
      tempWins.push(i);
      if (tempWins.length === n) {
        wins.push(tempWins);
        tempWins = [];
      }
    }
    
    for (let i = 0; i < n; i++) { //column combos
      let k = 0;
      for (let j = i; j <= wins[n - 1][k]; j += n) {
        tempWins.push(j);
        if (tempWins.length === n) {
          wins.push(tempWins);
          tempWins = [];
        }
        k++;
      }
    }

    for (let i = 0; i <= wins[n - 1][n - 1]; i += (n + 1)) { //forward diag combo
      tempWins.push(i);
      if (tempWins.length === n) {
        wins.push(tempWins);
        tempWins = [];
      }
    }

    for (let i = (n - 1); i <= wins[n - 1][0]; i += (n - 1)) { //backward diag combo
      tempWins.push(i);
      if (tempWins.length === n) {
        wins.push(tempWins);
        tempWins = [];
      }
    }
    return wins;
  }

  //const bestMove = 

  //const chooseTic = (e) => playerOne.tic = e;

  const pageLoad = () => {
    newGameButton.addEventListener('click', () => {
      gameState.initNewGame(document.getElementById('gridSize').value)
    }, { once: true });
  }
  
  const initNewGame = (grid) => {
    grid = parseInt(grid, 10);
    userGridSize = grid;
    gridSize = userGridSize * userGridSize;
    displayController.newGameDisplay(userGridSize);
    xTurn = false;
    oMovesRemaining = oMovesRemainingCalc(gridSize);
    xMovesRemaining = gridSize - oMovesRemaining;
    winners = algoWinners(userGridSize);
    displayController.setHover(xTurn);
    gameBoard.newGameBoard();
    newGameButton.addEventListener('click', () => {
      gameState.initNewGame(document.getElementById('gridSize').value)
    }, { once: true });
  }
  
  const getTurn = () => xTurn;

  const switchTurns = () => xTurn = !xTurn;

  const checkWin = (state) => {
    let turn;
    xTurn ? turn = 'x' : turn = 'o';
    return winners.some(combo => {
      return combo.every(index => {
        return state[index].classList.contains(turn);
      });
    });
  }

  const algoCheckTie = (state) => {
    if (xMovesRemaining < 1 && oMovesRemaining < 1) return;
    let turn;
    let otherTurn;
    xTurn ? turn = 'x' : otherTurn = 'x';
    !xTurn ? turn = 'o' : otherTurn = 'o';
    
    return winners.every(combo => {
      return combo.some(index => {
        return (state[index].classList.contains(turn) && !state[index].classList.contains(otherTurn));
      });
    });
  }

  const endGame = () => {
    if (checkWin(gameBoard.getBoardState())) return displayController.gameOverDisplay(xTurn, 'win');
    if (algoCheckTie(gameBoard.getBoardState())) return displayController.gameOverDisplay(xTurn, 'tie');
  }

  return {
    getTurn,
    switchTurns,
    endGame,
    initNewGame,
    deductMove,
    pageLoad
  }
})();

gameState.pageLoad();