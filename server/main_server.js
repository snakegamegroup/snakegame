//constants 
const io = require('socket.io')(); 
const { initGame, gameLoop, getUpdatedVelocity } = require('./game_server'); // use the game.js file

//create game state as soon as they join the game --> start sending the information

const { FRAME_RATE } = 10;
const { makeid } = createID(5)

const state = {};
const clientRooms = {}; //allows us to look up the room name using a code, maps client.id to room name



//allows us to communicate to the client everytime they join
io.on('connection', client => {
  //client size action handlers
  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  //function to handle joining the room
  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers; //create variable all users to keep track of users 
    if (room) {
      allUsers = room.sockets; //current users in the room, key is the client id
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length; //grabbing an array of all the keys and getting the length aka clients
    }
    //if we pass these conditionals then there is exactly one player waiting
    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) { //only a two player game
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    //start game after two players based on the game code
    startGameInterval(roomName);
  }

//create a socket.io route when a new game is created
//game code
  function handleNewGame() {
    let roomName = makeid(5); //5 becasue we are generating a 5 character id
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName); //get the name/code of the game that was created

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  //function to handle a keydown 
  function handleKeydown(keyCode) {
    //get the room name from the possibe client rooms 
    const roomName = clientRooms[client.id];
    //if it doesn't exist leave
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);//get the keycode 
    } catch(e) {
      console.error(e);
      return;
    }
    //convert keycode to velocity 
    const vel = getUpdatedVelocity(keyCode);
    
    //deal with the velocity 
    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

  /* Function to randomize and create a game code */
  
  function createID(size) {
    //set the result string to empty
    var result           = '';
    //set of possible characters
    var chars      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charLength = chars.size;//get the characters length 
    
    //for the length given make a game id that long 
    for ( var i = 0; i < size; i++ ) {
       result += chars.charAt(Math.floor(Math.random() * charLength)); //selects random characters to generate an id
    }
 
    //return id
    return result;
 }

//use set internal for our frame rate, easier to reset the interval
//if we want to stop sending game data 

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner); //reset state if game is over
      state[roomName] = null; 
      clearInterval(intervalId);
    }
    //1000 ms divided frames/second = number of seconds to wait for each frame
  }, 1000 / FRAME_RATE); 
}

//function used to deal with the game state in the room selected
function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}
//emit all clients in the room name 
function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

//what port to listen to in
io.listen(process.env.PORT || 3000);
