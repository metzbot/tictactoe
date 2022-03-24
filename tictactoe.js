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
  
  const handleCellClick = (e, turn) => {
    displayController.renderBoard(e, turn);
    if (gameState.checkWin()) console.log('victory');
    //check for draw
    gameState.switchTurns();
    //displayController.setHover();
  }

  boardCells.forEach(e => {
    e.addEventListener('click', () => handleCellClick(e, gameState.getTurn()), { once: true });
    gameArray.push(e);
  });

  const xButton = document.getElementById('xButton');
  const oButton = document.getElementById('oButton');
  const newGameButton = document.getElementById('newGameButton');

  const getBoardState = () => gameArray;
  const getGameBoard = () => board;
  
  return {
    getBoardState,
    getGameBoard
  };
})();

const displayController = (() => {

  const setMark = (turn, e) => {
    turn ? e.classList.add('x') : e.classList.add('o');
  }
  
  const setHover = (turn) => {
    gameBoard.getGameBoard().classList.remove('x');
    gameBoard.getGameBoard().classList.remove('o');
    let hover = gameBoard.getGameBoard().classList;
    turn ? hover.add('x') : hover.add('o');
  }
  
  const renderBoard = (e, turn) => {
    setMark(turn, e);
    setHover(!turn);
  }

  return {
    renderBoard,
    setHover
  }
})();

const gameState = (() => {

  let playerOne = Player();
  let xTurn = false;
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

  const chooseTic = (e) => playerOne.tic = e;
  const initNewGame = () => {

  }

  const getTurn = () => xTurn;

  // const checkWin = (turn) => {
  //   if (turn) {
  //     if (gameBoard.getBoardState()[0,1,2])
  //   }
  // }

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

  return {
    getTurn,
    switchTurns,
    checkWin
  }
})();