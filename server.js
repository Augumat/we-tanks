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
var state = {
  players: {}
};
io.on('connect', socket => {
  handleConnectEvent(socket);
  handleClientIntent(socket);
  //handleDisconnectEvent(socket);
});

setInterval(() => {
  io.sockets.emit('state', state);
}, 1000 / 60);




//New connection handler
function handleConnectEvent(socket) {
  socket.on('newPlayer', () => {
    console.log('new player with ID ' + socket.id);
    state.players[socket.id] = {
      x: 300, //x coord
      y: 300, //y coord
      th: 0,  //tank heading
      gh: 0   //gun heading
    };
  });
}

//Handle client intent
function handleClientIntent(socket) {
  socket.on('clientData', data => {
    //console.log('movement recorded: ' + JSON.stringify(data));
    var player = state.players[socket.id] || {};

    //Handle turning
    if (data.intent.left) {
      player.th += TAU / cfg.player.turnIncrement;
      (player.th >= TAU) ? player.th -= TAU : {};
    }
    if (data.intent.right) {
      player.th -= TAU / cfg.player.turnIncrement;
      (player.th < 0) ? player.th += TAU : {};
    }

    //Handle throttle
    if (data.intent.forward) {
      if (!data.intent.right && !data.intent.left) {
        player.x += cfg.player.speed * Math.sin(player.th);
        player.y += cfg.player.speed * Math.cos(player.th);
      } else {
        player.x += cfg.player.speedTurning * Math.sin(player.th);
        player.y += cfg.player.speedTurning * Math.cos(player.th);
      }
    }

    //Handle aiming
    //player.gh = 4 * Math.atan(data.mousePos.x - player.x) / (data.mousePos.y - player.y);\
    player.gh = Math.atan2(data.mousePos.x - player.x, data.mousePos.y - player.y);

    //Handle firing
    //todo

    //Handle placing a bomb
    //todo

    //BELOW IS TEMP, REMOVE AFTER TESTING
    if (player.x < 0 || player.x >= cfg.window.width || player.y < 0 || player.y >= cfg.window.height) {
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
