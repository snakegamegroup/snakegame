//constants and initialization for index.js

//colours for snake, gamebackground and snake food
const BG_COLOUR = '#000000';
const SNAKE_COLOUR = '#E6A218';
const SNAKE_COLOUR1 = '#AF10DA';
const FOOD_COLOUR = '#EE1818';

const socket = io('https://hidden-headland-31336.herokuapp.com/');

//Socket initialization 
socket.on('init', handleInit);
socket.on('gameState', handleGameState); 
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

//Creating the buttons for each event
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

//These are buttons to start the game, the click handlers
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
loserHomeScreenBtn.addEventListener('click', home);
homeScreenBtn.addEventListener('click', home);


//initializing variables used 
let canvas, ctx;
let playerNumber;
let gameActive = false;


//Functions 

//new game function to start a new game 
function newGame() {
  socket.emit('newGame');
  init();
}

//grab hold of the game code that the user has entered
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code); //already a string coming out of the input so we dont need to change anything
  init();
}

//function to go to the home screen if called
function home(){
  reset();
}

//event listener for key strokes to prevent the keys from scrolling during gameplay
window.addEventListener("keydown", function(e) {
  // space and arrows
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
  e.preventDefault(); //prevent default cases
}
}, false);

//function that sets everything up for initialization 
function init() {
  //picking which screen to show
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  gameOverScreen.style.display = "none";
  winnerScreen.style.display = "none";

  //get the game canvas 
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  //set the canvas size 
  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR; //use the background colour at the top 


  //completely fill the canvas with background colour
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  //add an event listener for keystrokes
  document.addEventListener('keydown', keydown);

  //set variable for the game being active to true
  gameActive = true;
}

//event listener for keys
function keydown(e) {
  socket.emit('keydown', e.keyCode);
  //numerical value that represents key pressed
}


//function to paint the current state of the game 
function paintGame(state) {
  //fil the ctx with the size of the canvas and the background colour 
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  //get the constant for the foods current state 
  const food = state.food;
  //set the current grid size 
  const gridsize = state.gridsize; 
  //calculates the pixel size per game space
  const size = canvas.width / gridsize; 
  ctx.fillStyle = FOOD_COLOUR;  //set the food colour 
  //must convert the game space coordinates to pixel 
  ctx.fillRect(food.x * size, food.y * size, size, size);

  //call paint player function
  paintPlayer(state.players[0], size, SNAKE_COLOUR); 
  paintPlayer(state.players[1], size, SNAKE_COLOUR1);
}

//function to paint the player 
function paintPlayer(playerState, size, colour) {
  //get the current state of the player 
  const snake = playerState.snake;
  //set colour 
  ctx.fillStyle = colour;
  //for each cell in the snake convert to pixel size
  for (let cell of snake) { 
    //fill the snake 
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

//handle an initialization function 
function handleInit(number) {
  //sets the players number 
  playerNumber = number;
}

//recieve game state from the server
function handleGameState(gameState) { 
  //if the game is finished
  if (!gameActive) {
    return;
  }
  //if not get the new game state by requesting the new frame 
  gameState = JSON.parse(gameState);
  //everytime server sends a game state msg browser will recieve it and create the game
  requestAnimationFrame(() => paintGame(gameState));
}

//handle what happens when the game is over 
function handleGameOver(data) {
  //if its not over leave
  if (!gameActive) {
    return;
  }
  
  //get the data
  data = JSON.parse(data);

  //set active to false 
  gameActive = false;


  //call the winner and loser functions 
  if (data.winner === playerNumber) {
    winner();
  } else {
    gameOver();
  }
}


//handle the game code given
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

//handle the incorrect code 
function handleUnknownCode() {
  reset();
  alert('Unknown Game Code: Try Again') // if the code is invalid 
}

//handle a third player trying to join 
function handleTooManyPlayers() {
  reset();
  alert('That game is already in progress');
}

//function to reset the game to the start screen 
function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  winnerScreen.style.display = "none";
}

//game over function for losing player
function gameOver(){
  gameScreen.style.display = "none"; //turn off the game screeen
  gameOverScreen.style.display = "block"; //turn on the game over screen
}

//winner function for the winning player 
function winner(){
  gameScreen.style.display = "none"; //turn off the game screen 
  winnerScreen.style.display = "block";// turn on the winner screen
}

 
