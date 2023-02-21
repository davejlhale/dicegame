

/****************************
*                           *
*     global defines        *
*                           *
****************************/
let mainMenu = document.getElementById('main-menu');
let gameScreen = document.getElementById('game-action-container');
let playableDice = document.getElementById(`playable-dice`);
let playerSelectRefs = document.querySelectorAll('[class*="btn-player-choice"]');


let animationsOn = true;

let debug = (msg) => { console.debug(msg); };
let log = (msg) => { console.log(msg); };
/****/


/*
    end of gloabl defines 
*/


/****************************
*                           *
*     event listnters       *
*                           *
****************************/

//add click event listnter to playable dice
// playableDice.addEventListener('click', () => {
//   console.log(`spun a `, spinDice(playableDice));
// });

document.getElementById('btn-restart').addEventListener('click', () => {
  gameRef.resetPlayers()
})

document.getElementById('btn-menu').addEventListener('click', () => {
  console.debug("Menu button clicked");
  mainMenu.style.display = "flex";
  gameScreen.style.display = "none"
  playableDice.style.display = "none"
  animationsOn = true;
  animateDice();
})

function addMainMenuEvents() {
  //for each potential player
  let numberOfPlayers = 0;
  playerSelectRefs.forEach(playerBtn => {
    playerBtn.innerHTML = ++numberOfPlayers + " Player"
    playerBtn.numberOfPlayers = numberOfPlayers;
    //add the menu button click evenlistner
    playerBtn.addEventListener('click', (evt) => {
      numberOfPlayers = playerBtn.numberOfPlayers;
      console.debug(`Number of players selected to play ${numberOfPlayers}`);
      mainMenu.style.display = "none";
      gameScreen.style.display = "flex"
      playableDice.style.display = "flex"
      animationsOn = false;
      gameRef.start(numberOfPlayers);
    });
  });
}


/********************************\
*                                *
*   player class declarations    *
*                                *
\********************************/
class Player {

  static #count = 0;

  constructor(maxScore) {
    this.totalScore = 0;
    this.currentScore = 0;
    this.active = false;
    this.hadTurn = false;
    this.gamesWon = 0;
    this.panel = false;
    this.index = Player.#count++;
    this.maxScore = maxScore
  }
  resetPlayer() {
    console.debug("player.resetPlayer", this)
    this.totalScore = 0;
    this.currentScore = 0;
    this.hadTurn = false;
    this.active = false;
    this.gamesWon = 0;
    this.rollBtn = this.panel.getElementsByClassName('fn-roll')[0];
    this.holdBtn = this.panel.getElementsByClassName('fn-hold')[0];
    this.showButtons(false);
    this.display();
  }

  display() {
    console.debug("panel", this.panel);
    this.panel.querySelector('#player-score').innerHTML = this.totalScore;
    this.panel.querySelector('#player-dice-total').innerHTML = this.currentScore;
  }
  setActive(status) {
    console.debug("setActive", this)
    this.active = status;
    this.showButtons(true);
    this.addRollButtonEvent();
    this.addHoldButtonEvent();
  }

  showButtons(status) {
    if (status) {
      this.rollBtn.style.visibility = "visible";
      this.holdBtn.style.visibility = "visible";
    } else {
      this.rollBtn.style.visibility = "hidden";
      this.holdBtn.style.visibility = "hidden";
    }
  }
  addHoldButtonEvent() {
    if (this.evtHoldButtonAdded) return;
    this.evtRollButtonAdded = true;
    this.holdBtn.addEventListener("click", () => {
      console.log(`player ${this.index + 1} holds `);
      this.hadTurn = true;
      this.active = false;
      this.showButtons(false);
    });
  }

  addRollButtonEvent() {
    if (this.evtRollButtonAdded) return;
    this.evtRollButtonAdded = true;
    this.rollBtn.addEventListener("click", () => {
      let score = spinDice(playableDice);
      console.log(`player ${this.index + 1} scored `, score)
      this.currentScore += score;
      this.display();
      if (this.currentScore >= this.maxScore) {
        this.hadTurn = true;
        this.active = false;
        this.showButtons(false)
      }
    });
  }
  static get COUNT() {
    return Player.#count;
  }
}

/********************************\
*                                *
*    game class declarations     *
*                                *
\********************************/
class game {
  constructor(scoreToReach = 21) {
    this.numplayers;
    this.scoreToReach = scoreToReach;
    this.players = [];
    this.activePlayer;
  }
  start(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers
    debug("game.start");
    this.initPlayers();
    this.displayPlayerPanels();

    this.resetPlayers();
    this.getStartingPlayer();
    this.setHelpPopup();
    this.watchPlayers();
  }
  /* end of start */

  watchPlayers() {
    let winner = -1;
    let draw = 0;
    let largest = 0;
    let id = setTimeout(() => {
      clearTimeout(id);
      this.activePlayer = null;
      for (let i = 0; i < this.numberOfPlayers; i++) {
        if (this.players[i].active === true) {
          this.activePlayer = this.players[i]
        }
      }
      if (!this.activePlayer) {
        console.log("checking if players still to play")
        for (let i = 0; i < this.numberOfPlayers; i++) {
          if (this.players[i].hadTurn === false) {
            this.activePlayer = this.players[i]
            this.activePlayer.setActive(true);
            break;
          }
        }
      }
      //if no active players
      if (!this.activePlayer) {
        for (let i = 0; i < this.numberOfPlayers; i++) {
          if (largest < this.players[i].currentScore && this.players[i].currentScore <= this.scoreToReach) {
            largest = this.players[i].currentScore;
            winner = i;
          }
        }

        for (let c = 0; c < this.numberOfPlayers; c++) {
          if (largest == this.players[c].currentScore) {
            draw += 1;
          }
        }

        if (winner != -1 && draw <= 1) {
          //player winner
          console.log(`playyer ${winner} won with a score of ${largest}`)
          this.players[winner].totalScore += largest;
          this.players[winner].gamesWon++;
          this.updateGamesWon();
        } else if (draw > 1) {
          console.log("a draw")
        } else {
          console.log("both bust")
        }


        for (let i = 0; i < this.numberOfPlayers; i++) {
          this.players[i].hadTurn = false;
          this.players[i].currentScore = 0;
          this.players[i].display();
          this.players[i].showButtons(false);
          console.log("round over for player", i+1)
        }
        this.setStartingPlayer()
      }
      this.watchPlayers();
    }, 100);
  }

  setStartingPlayer() {
    let startPlayer = Math.floor((Math.random() * this.numberOfPlayers));
    console.log("starting with player ", startPlayer+1)
        
    this.players[startPlayer].setActive(true);
    this.activePlayer = this.players[startPlayer]

  }
  updateGamesWon() {
    let elem = document.getElementsByClassName("games-won");
    for (let i = 0; i < this.numberOfPlayers; i++) {
      elem[i].innerHTML = this.players[i].gamesWon;
    }
  }

  getActivePlayer() {
    this.activePlayer = Array.from(this.players).filter(prop => prop.active == true);
    console.debug(this.activePlayer);
  }

  //and picks one to be active
  resetPlayers() {
    let elem = document.getElementsByClassName("games-won");
    for (let i = 0; i < elem.length; i++) {
      elem[i].innerHTML = 0;
    }
    for (let i = 0; i < this.numberOfPlayers; i++) {
      this.players[i].resetPlayer();
    }
  }

  getStartingPlayer() {
    let startPlayer = Math.floor((Math.random() * this.numberOfPlayers));
    this.players[startPlayer].setActive(true);
    this.activePlayer = this.players[startPlayer];
  }

  initPlayers() {
    console.debug("game.initPlayers", this.numberOfPlayers)
    if (Player.COUNT >= this.numberOfPlayers) {
      console.debug("enough player instances already : ", Player.COUNT)
    } else {
      while (Player.COUNT < this.numberOfPlayers)
        this.players.push(new Player(this.scoreToReach));
      console.debug(`inititialised player `, Player.COUNT);
    }
  }

  displayPlayerPanels() {
    debug("turning on " + this.numberOfPlayers + " panels")
    let elems = document.getElementsByClassName("player-panel");
    let pnum = 1;
    Array.from(elems).forEach(panel => {
      panel.style.display = 'none';
      panel.id = "player" + pnum++;
    });
    for (let i = 0; i < this.numberOfPlayers; i++) {
      debug(`panel ${i + 1} on`)
      elems[i].style.display = 'flex';
      this.players[i].panel = elems[i];
    };
  }


  setHelpPopup() {
    console.log(document)
    let helpPopupRef = document.getElementById('btn-ingame-help')
    helpPopupRef.addEventListener('click', (m) => {
      if (this.numberOfPlayers == 1) {
        helpPopupRef.href = "#one-player-help"
      } else {
        helpPopupRef.href = "#two-player-help"
      }
    })
  }
}

/********************************\
*                                *
*  function declarations         *
*                                *
\********************************/

//copy html dice into shortened html placeholder tags
function replaceDicePlaceholders() {
  let placeHolders = document.getElementsByClassName('dice-placeholder');
  for (i = 0; i < placeHolders.length; i++) {
    const clone = document.getElementById(`playable-dice`).cloneNode(true);
    clone.id = "";
    placeHolders[i].appendChild(clone);
  }
}

function animateDice() {
  Array.from(document.getElementsByClassName(`dice`)).forEach(die => {
    if (die.id != 'playable-dice') {
      function aniateRolls() {
        let randomInterval = Math.floor(Math.random() * (4000 - 500 + 1)) + 500;
        let id = setTimeout(function () {
          if (animationsOn) {
            clearTimeout(id);
            spinDice(die);
            aniateRolls();
          }
        }, randomInterval);
      }
      aniateRolls();
    }
  });
}



function spinDice(die) {
  let dicePoints = Math.floor((Math.random() * 6) + 1);
  console.log("spinning die")
  for (let i = 1; i <= 6; i++) {
    die.classList.remove('show-' + i);
    if (dicePoints === i) {
      die.classList.add('show-' + i);
    }
  }
  return dicePoints;
}

replaceDicePlaceholders();
animateDice();
gameRef = new game(21);
addMainMenuEvents();