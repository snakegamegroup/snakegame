module.exports = {
    makeid,
  }
  /* Function to randomize and create a game code */
  
  function makeid(length) {
     //set the result string to empty
     var result           = '';
     //set of possible characters
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
     var charactersLength = characters.length;//get the characters length 
     
     //for the length given make a game id that long 
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength)); //selects random characters to generate an id
     }
  
     //return id
     return result;
  }
  
