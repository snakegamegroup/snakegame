const BG_COLOUR = '#000000';
const SNAKE_COLOUR = '#E6A218';
const SNAKE_COLOUR1 = '#AF10DA';
const FOOD_COLOUR = '#EE1818';

const socket = io('https://sheltered-island-91254.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameOverScreen = document.getElementById('gameOverScreen');
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const winnerScreen = document.getElementById('winnerScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const loserHomeScreenBtn = document.getElementById('loserHomeScreenButton');
const homeScreenBtn = document.getElementById('homeScreenButton');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
loserHomeScreenBtn.addEventListener('click', home);
homeScreenBtn.addEventListener('click', home);

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

function home(){
  reset();
}


let canvas, ctx;
let playerNumber;
let gameActive = false;

window.addEventListener("keydown", function(e) {
  // space and arrow keys
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
  e.preventDefault();
}
}, false);
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  gameOverScreen.style.display = "none";
  winnerScreen.style.display = "none";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

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
    winner();
  } else {
    gameOver();
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  winnerScreen.style.display = "none";
}

function gameOver(){
  gameScreen.style.display = "none";
  gameOverScreen.style.display = "block";
}

function winner(){
  gameScreen.style.display = "none";
  winnerScreen.style.display = "block";
}
