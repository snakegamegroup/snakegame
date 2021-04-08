//Colours used in the game window
const BG_COLOUR = '#000000';
const SNAKE_COLOUR = '#357CF8'
const SNAKE_COLOUR1 = '#AF10DA'
const FOOD_COLOUR = '#871E10';

//socket
const socket = io(' https://sleepy-falls-52998.herokuapp.com/');


//When the socket is used handle all possible outcomes 
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleT);
//Constants for screens and other elements 
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

//game buttons 
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


//function to create a new game by calling init
function newGame() {
  socket.emit('newGame');
  init();
}

//function to join a game using the code given
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

//declare variables  used 
let canvas, ctx;
let playerNumber;
let gameActive = false;

//init function on creation of new game
function init() {
  //change displays
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  //get the canvas and set it to a 2d 
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  //make the canvas 600 pixels high
  canvas.width = canvas.height = 600;

  //set the canvas background to black
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  //add and event listener for keydowns
  document.addEventListener('keydown', keydown);
  gameActive = true;
}

//fucntion to handle keydowns
function keydown(e) {
  socket.emit('keydown', e.keyCode);//send the key stroke to the server
}

//function to paint the game
function paintGame(state) {
  //fill the background
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //constants used for food, grid, and size
  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  //fill the food with the colour and fill the rectangle
  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  //paint the players 
  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, SNAKE_COLOUR1);
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win');
  } else {
    alert('You have Lost ');
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Game Code Invalid')
}

function handleTooManyPlayers() {
  reset();
  alert('Game in Progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
