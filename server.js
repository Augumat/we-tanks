//Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

//Set the port and path
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

//Start the server
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});
server.listen(5000, () => {
  console.log('Starting server on port 5000');
});




//Handle a new connection
var players = {};
io.on('connect', socket => {
  handleConnectEvent(socket);
  handleClientIntent(socket);
  //handleDisconnectEvent(socket);
});

setInterval(() => {
  console.log(JSON.stringify(players));
  io.sockets.emit('state', players);
}, 1000 / 60);




//New connection handler
function handleConnectEvent(socket) {
  socket.on('newPlayer', () => {
    console.log('new player with ID ' + socket.id);
    players[socket.id] = {
      x: 300, //x coord
      y: 300, //y coord
      h: 0    //heading
    };
  });
}

//Handle client intent
function handleClientIntent(socket) {
  socket.on('intent', data => {
    //console.log('movement recorded: ' + JSON.stringify(data));
    var player = players[socket.id] || {};
    if (data.left) {
      player.h -= Math.PI / 30;
      (player.h < 0) ? player.h += 2 * Math.PI : {};
    }
    if (data.right) {
      player.h += Math.PI / 30;
      (player.h >= 2 * Math.PI) ? player.h -= 2 * Math.PI : {};
    }
    if (data.forward) {
      if (!data.right && !data.left) {
        player.x += 2.5 * Math.sin(player.h);
        player.y += 2.5 * Math.cos(player.h);
      } else {
        player.x += 1.5 * Math.sin(player.h);
        player.y += 1.5 * Math.cos(player.h);
      }
    }
    if (player.x < 0 || player.x >= 800 || player.y < 0 || player.y >= 600) {
      player.x = 300;
      player.y = 300;
    }
  });
}

//Connection closed handler
// function handleDisconnectEvent(socket) {
//   socket.on('disconnect', () => {
//     console.log('player with ID ' + socket.id + ' disconnected');
//     delete players[socket.id];
//   });
