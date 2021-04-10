const { GRID_SIZE } = require('./constants');


module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

// function to initialze the game 
function initGame() {
  //call function to create the game state 
  const state = createGameState()
  //call random food to pick a random location
  randomFood(state); 
  //return the current state of the game
  return state;
}

//accepts keycode and changes snake position 
//based on arrow keys pressed 
function getUpdatedVelocity(keyCode) {
  //using switch case to handle seperate actions
  switch (keyCode) {
    case 37: { // left
      return { x: -1, y: 0 };
    }
    case 38: { // down
      return { x: 0, y: -1 };
    }
    case 39: { // right
      return { x: 1, y: 0 };
    }
    case 40: { // up
      return { x: 0, y: 1 };
    }
  }
}

//function to create the game state
function createGameState() {
  return {
    //players creation
    players: [{
      //starting postitions
      pos: {
        x: 3,
        y: 10,
      },
      //starting velocity
      vel: {
        x: 1,
        y: 0,
      },
      //snake block sizes 
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
    }, 
    //player 2
    {
      //set position
      pos: {
        x: 18,
        y: 10,
      },
      //set velocity 
      vel: {
        x: -1,
        y: 0,
      },
      //snake blocks 
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},
        {x: 18, y: 10},
      ],
    }],
    //food var
    food: {},
    gridsize: GRID_SIZE,//get grid size 
  };
}

//function to create the game loop 
function gameLoop(state) {
  if (!state) { //if not given a state just return 
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  //update player position based on velocity 
  //move the x and y positions accordingly 
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;


  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;
  //make sure position is within the size of the canvas
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    return 2; //if player one goes off the canvas --> player two has won
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1;
  }
  //check if the food position = player1 head position, if true we have eaten the food
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    //if food eaten the snake 1 will be one bigger 
    playerOne.snake.push({ ...playerOne.pos });
    //increment the posistion to include added snake size 
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    //since foos is eaten must add another piece of food
    randomFood(state);
  }

  //check if the food position = player1 head position, if true we have eaten the food
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
     //if food eaten the snake 2 will be one bigger 
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  //make sure snake 1 is moving before we move it around
  //snake shouldn't bump into itself
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      //if any head position is the same as a body position
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }
    
    //snake body is one longer
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}

function randomFood(state) {
  food = {
    //random number between 0 and gridsize
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    //make sure food position is not on top of snake 1 body  
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
      //keep returning until food is a good position 
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}
