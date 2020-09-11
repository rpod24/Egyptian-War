
var playerCardLocations = [[window.innerWidth / 2, window.innerHeight * 4 / 5], [window.innerWidth / 2, window.innerHeight * 1 / 5], [window.innerWidth * 4 / 5, window.innerHeight / 2], [window.innerWidth * 1 / 5, window.innerHeight / 2]];
var playerNameLocations = [[0, -0.2], [0, 0.2], [0, 0.2], [0, 0.2]];
var cardHeight = 1056;
var screenHeight = 1000;
var cardScale = (window.innerHeight / cardHeight) * .225;
var gameStarted = false;

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scaleMode: 5,
  autoRound: false,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
var fps;
var isHost = false;
var Players = [];
var PlayersGraphics = [];
var graphics;
var playerNum = 0;
var CurrentPlayerNum = -1;
var fullLobby = false;
var pointerRect;
var rect;
var pointer;
const game = new Phaser.Game(config);
var playersCards = [[],[],[],[]];
var deck = [[0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [2, 12], [2, 13], [2, 14], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [3, 9], [3, 10], [3, 11], [3, 12], [3, 13], [3, 14]];
var PlayersNumbers = [0,0,0,0];


function preload() {
  this.load.image('CardBack', 'images/Cards/blue_back.png');
  this.load.image('CardPlace', 'images/Cards/cardPlace.png');

}

var dealCardsButton;
var dealCardsText;

function create() {
  startTime = new Date();
  var self = this;
  this.socket = io();
  graphics = this.add.graphics();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        isHost = players[id].host;
        console.log(isHost);
        addMainPlayer(self, players[id]);
        CurrentPlayerNum = players[id].playerNumber;
        PlayersNumbers[CurrentPlayerNum] = 1;
      } else {
        addOtherPlayers(self, players[id]);
        PlayersNumbers[players[id].playerNumber] = 1;
      }
    });
  });
  this.socket.on('FullLobby', function (state) {
    console.log(state);
    fullLobby = state;

    if (fullLobby) {
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(0, 0, window.innerWidth, window.innerHeight);
      var GetWidth = self.add.text(screen.availWidth / 2, screen.availHeight / 2, "Full Lobby!", { font: "bold 32px Arial", fill: "#ffffff" });
      self.add.text(screen.availWidth / 2 - GetWidth.width / 2, screen.availHeight / 2, "Full Lobby!", { font: "bold 32px Arial", fill: "#ffffff" });
      GetWidth.destroy();
    }
    else {
      graphics.fillStyle(0x178a36, 1);
      graphics.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
  });
  graphics.fillStyle(0x000000, 1);
  rect = new Phaser.Geom.Rectangle(1, 1, 1, 1);
  pointerRect = new Phaser.Geom.Rectangle(450, 350, 1, 1);
  //dealCardsButton
  this.input.on('pointermove', function (pointer) {

    pointerRect = Phaser.Geom.Rectangle.CenterOn(pointerRect, pointer.x, pointer.y);

  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  // this.socket.on('PlayersCards', function (cards){
  //   test();
  //   playersCards = cards;
  // });
  // playerNum = Players.length;
  console.log(Players.length);


  this.socket.on('disconnect', function (player) {
    //PlayersNumbers[player.playerNumber] = 0;
    var playerPos = -1;
    clearGraphics();
    for (let i = Players.length - 1; i >= 0; i--) {
      if (Players[i][0] == player) {
        Players.splice(i, 1);
        playerPos = i;
      }
      else if (playerPos != -1 && i > playerPos) {
        ++i;
      }
    }
    drawAllPlayers(self);
  });
  pointer = self.input.activePointer;
  //fps = self.add.text(100,100,'fps: ');
}
var buttonDown = false;
var cycle = 0;
var startTime, endTime;

function update() {
  
  //this.socket = io();
  //cycle++;
  var self = this;
  // endTime = new Date();
  // console.log(startTime-endTime);
  // if (startTime-endTime <= -1000) {
    
  //   graphics.fillStyle(0xff0000, 1);
    
  //   fps.destroy();
  //   fps = self.add.text(100,100,'fps: '+cycle);
  //   startTime = new Date();
  //   cycle = 0;
  // }
  drawAllPlayers(self);
  if (Phaser.Geom.Intersects.RectangleToRectangle(rect, pointerRect) && buttonDown == false && pointer.isDown) {
    dealCards(this.socket);
  }

  if (pointer.isDown) {
    buttonDown = true;
  }
  else {
    buttonDown = false;
  }
}

function test() {
  console.log("Test");
}


function addMainPlayer(self, playerInfo) {
  var playerNumb = playerInfo.playerNumber;
  var id = playerInfo.playerId;
  var name = playerInfo.name;
  console.log(id);
  CurrentPlayerNum = playerInfo.playerNumber;
  var player = [id, name, playerNumb];
  Players[Players.length] = player;
  if (isHost) {
    console.log("Drawing Button!");
    drawHostButton(self);
  }
}


function addOtherPlayers(self, playerInfo) {
  var playerNumb = playerInfo.playerNumber;
  var id = playerInfo.playerId;
  var name = playerInfo.name;
  console.log(id);
  var player = [id, name, playerNumb];
  Players[Players.length] = player;
  PlayersNumbers[playerNumb] = 1;
  console.log(Players);
}

function drawPlayer(self, x, y, name, direction) {
  var Person = self.add.image(x, y, 'CardBack').setScale(cardScale);
  var GetWidth = self.add.text(x, y, name, { font: "bold 32px Arial", fill: "#ffffff" });
  if (direction == 1) {
    var PersonName = self.add.text(x - GetWidth.width / 2, y + (cardHeight * cardScale) * 9 / 16, name, { font: "bold 32px Arial", fill: "#ffffff" });
  }
  else {
    var PersonName = self.add.text(x - GetWidth.width / 2, y - (cardHeight * cardScale) * 3 / 4, name, { font: "bold 32px Arial", fill: "#ffffff" });
  }
  GetWidth.destroy();
  return [PersonName, Person];
}

function drawAllPlayers(self) {
  if (CurrentPlayerNum != -1) {
    clearGraphics();
    PlayersGraphics[playerNum] = drawPlayer(self, playerCardLocations[0][0], playerCardLocations[0][1], Players[CurrentPlayerNum][1], 1);
    var PlayerDarwing = CurrentPlayerNum;
    for (let i = 0; i < Players.length; i++) {
      if (PlayerDarwing < 3 && PlayerDarwing != CurrentPlayerNum && Players[PlayerDarwing] != undefined) {
        PlayersGraphics[PlayerDarwing] = drawPlayer(self, playerCardLocations[i][0], playerCardLocations[i][1], Players[PlayerDarwing][1], -1);
        PlayerDarwing++;
      }
      else if (PlayerDarwing != CurrentPlayerNum) {
        PlayerDarwing = 0;
        PlayersGraphics[PlayerDarwing] = drawPlayer(self, playerCardLocations[i][0], playerCardLocations[i][1], Players[PlayerDarwing][1], -1);
      }
      else {
        if (PlayerDarwing > 3) {
          PlayerDarwing = 0;
        }
        else {
          PlayerDarwing++;
        }
      }
    }
  }
}

function drawHostButton(self) {
  var buttonGraphics = self.add.graphics();
  var metr = self.add.text(playerCardLocations[0][0] + screen.availWidth / 20, playerCardLocations[0][1] - 10, 'Deal Cards', { font: "bold 26px Arial" });
  dealCardsText = self.add.text(playerCardLocations[0][0] + screen.availWidth / 20, playerCardLocations[0][1] - metr.width / 8, 'Deal Cards', { font: "bold 26px Arial" });
  buttonGraphics.fillStyle(0xff0000, 1);
  dealCardsButton = buttonGraphics.fillRoundedRect(playerCardLocations[0][0] + screen.availWidth / 20 - 10, playerCardLocations[0][1] - dealCardsText.height / 2 - 12, dealCardsText.width + 20, dealCardsText.height + 20, 10);
  metr.destroy();
  rect = new Phaser.Geom.Rectangle(playerCardLocations[0][0] + screen.availWidth / 20 - 10, playerCardLocations[0][1] - dealCardsText.height / 2 - 12, dealCardsText.width + 20, dealCardsText.height + 20);
  dealCardsButton.setInteractive();

}

function dealCards(io) {
  playerNum = Players.length;
  if (playerNum > 1) {
    dealCardsButton.destroy();
    dealCardsText.destroy();
    randomizeDeck();
    dealPlayersCards(playerNum, io);
  }
  else {
    alert("You must have 2 or more players to play!");
  }
}

function clearGraphics() {
  for (let i = 0; i < PlayersGraphics.length; i++) {
    if (PlayersGraphics[i] != null && PlayersGraphics[i] != undefined) {
      PlayersGraphics[i][0].destroy();
      PlayersGraphics[i][1].destroy();
    }
  }
  PlayersGraphics = [];
}

function randomizeDeck() {
  for (let i = 0; i < deck.length; i++) {
    var rand = Math.floor(Math.random() * 52);
    let x = deck[i];
    deck[i] = deck[rand];
    deck[rand] = x;
  }
  console.log(deck);
}

function dealPlayersCards(numberOfPlayers, io) {
  var deckToBeSent = [];
  if (numberOfPlayers == 2) {
    for (let i = 0; i < deck.length; i++) {
      if (i % 2 == 0) {
        if(deckToBeSent[0] != undefined){
          deckToBeSent[0][deckToBeSent[0].length] = deck[i];
        }
        else{
          deckToBeSent[0] = [deck[i]];
        }
      }
      else {
        if(deckToBeSent[1]!=undefined){
          deckToBeSent[1][deckToBeSent[1].length] = deck[i];
        }
        else{
          deckToBeSent[1] = [deck[i]];
        }
      }
    }
  }
  console.log(playersCards);
  var playersSentCards = 0;
  for (let i = 0; i < PlayersNumbers.length; i++) {
    if(PlayersNumbers[i] == 1&&playersSentCards<numberOfPlayers){
      playersCards[i] = deckToBeSent[i];
      playersSentCards++;
    }
  }
  io.emit('PlayersCards', playersCards);
}
