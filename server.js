//Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

//Grab config
const cfg = require('./config.json');
const TAU = Math.PI * 2;

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
  //console.log(players.splice(0));
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
  socket.on('clientData', data => {
    //console.log('movement recorded: ' + JSON.stringify(data));
    var player = players[socket.id] || {};
    if (data.intent.left) {
      player.h -= TAU / cfg.player.turnIncrement;
      (player.h < 0) ? player.h += TAU : {};
    }
    if (data.intent.right) {
      player.h += TAU / cfg.player.turnIncrement;
      (player.h >= TAU) ? player.h -= TAU : {};
    }
    if (data.intent.forward) {
      if (!data.intent.right && !data.intent.left) {
        player.x += cfg.player.speed * Math.sin(player.h);
        player.y += cfg.player.speed * Math.cos(player.h);
      } else {
        player.x += cfg.player.speedTurning * Math.sin(player.h);
        player.y += cfg.player.speedTurning * Math.cos(player.h);
      }
    }
    //BELOW IS TEMP, REMOVE AFTER TESTING
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
