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
  const boardCells = document.querySelectorAll('.cell');
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

/*===========================================================
gameState module that controls logic for creating a new game,
win conditions, stalemates, current player, etc
===========================================================*/
const gameState = (() => {

  let playerOne = Player();
  let xTurn = false; //randomize this?
  let userGridSize = 3; //user input
  let gridSize = userGridSize * userGridSize;
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
  
  const initNewGame = () => {
    displayController.newGameDisplay();
    xTurn = false;
    oMovesRemaining = oMovesRemainingCalc(gridSize);
    xMovesRemaining = gridSize - oMovesRemaining;
    winners = algoWinners(userGridSize);
    displayController.setHover(xTurn);
    gameBoard.newGameBoard();
    newGameButton.addEventListener('click', gameState.initNewGame, {once: true}); 
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

  // const checkTie = () => {
  //   let state = gameBoard.getBoardState();
  //   return state.every(i => {
  //     return (i.classList.contains('x') || i.classList.contains('o'));
  //   });
  // }

/*   const algoCheckTie = () => {
    if (xMovesRemaining < 1 && oMovesRemaining < 1) return;
    let turn;
    let otherTurn;
    xTurn ? turn = 'x' : otherTurn = 'x';
    !xTurn ? turn = 'o' : otherTurn = 'o';
    let state = gameBoard.getBoardState();
    // return winners.some(combo => {
    //   (combo.includes(index => { state[index].classList.contains(turn) })) && (combo.every(index => { !state[index].classList.contains(otherTurn)}));
    // });
    let checkState = [];
    state.forEach(element => {
      if (element.classList.contains('x')) checkState.push('x');
      if (element.classList.contains('o')) checkState.push('o');
      checkState.push('');
    })
    //console.log(checkState);
    for (let i = oMovesRemaining; i > 0; i--) {
      checkState.forEach(element => {
        if (element !== 'x' && element !== 'o') {
          checkState[element] = 'o';
        }  
      });
    }
    for (let i = xMovesRemaining; i > 0; i--) {
      checkState.forEach(element => {
        if (element !== 'x' && element !== 'o') {
          checkState[element] = 'x';
        }
      });
    }
    console.log(checkState);
    //return checkWin(checkState);
  } */
  //     winners.some(combo => {
  //     (combo.includes(index => { state[index].classList.contains(turn) })) && (combo.every(index => { !state[index].classList.contains(otherTurn)}));
  // }
    //&& !state[index].classList.contains(otherTurn)) return false;
      //check currentPlayer's boardState against win conditions n-1 space
      //Array.'at least n-1'.classList.contains('turn') ? how
    //}
    //return true;

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
    deductMove //temp
  }
})();

gameState.initNewGame();