var express = require('express');
const e = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

var players = {};
var playersInLobby = 0;
var maxPlayersPerLobby = 4;
var availPlayerNum = [0, 1, 2, 3];
var NextplayerNum = 0;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  if (playersInLobby < 4) {
    console.log('a user connected');
    var ishost = false;

    if (availPlayerNum[0] == 0) {
      ishost = true;
    }
    players[socket.id] = {
      playerId: socket.id,
      host: ishost,
      name: "Player" + Math.floor(Math.random() * 3997),
      playerNumber: availPlayerNum[0]
    };
    playersInLobby++;
    console.log(availPlayerNum[0]);
    console.log(availPlayerNum);
    availPlayerNum.shift();
    console.log(players);
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    socket.emit('FullLobby', false);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    socket.on('PlayersCards', function (cards) {
      socket.broadcast.emit('PlayersCards', cards);
      console.log('Sent to everyone!');
    });
  }
  else {
    console.log(playersInLobby);
    socket.emit('FullLobby', true);
  }
  socket.on('disconnect', function () {
    if (playersInLobby < 4) {
      availPlayerNum.push(players[socket.id].playerNumber);
    }
    sort(availPlayerNum);
    console.log('a user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    if (playersInLobby < 4) {
      io.emit('disconnect', socket.id);
      playersInLobby--;
    }
    console.log(players);
  });

});

server.listen(8082, function () {
  console.log(`Listening on ${server.address().port}`);
});

io.on('startGame', function () {

});

function sort(array) {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        var temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
  }
  return array;
}
