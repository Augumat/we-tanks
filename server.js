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




//
const PLAYER_TEMPLATE = {
  client: {
    intent: {
      forward: false,
      left: false,
      right: false,
      space: false,
      mouse: false
    },
    mousePos: {
      x: 0,
      y: 0
    }
  },
  x: 64, //x coord
  y: 64, //y coord
  th: 0, //tank heading
  gh: 0, //gun heading
  gc: 0  //gun cooldown
};
const BULLET_TEMPLATE = {};

//Define state
var currentBulletId;
var state = {
  players: {},
  bullets: {}
};

//Handle a new connection
io.on('connect', socket => {
  handleConnectEvent(socket);
  handleClientData(socket);
  //handleDisconnectEvent(socket);
});

//The game loop, executed at a constant 60fps
setInterval(() => {
  //Handle player cooldowns and intents
  for (var id in state.players) {
    var player = state.players[id] || {};

    //Handle turning
    if (player.client.intent.left) {
      player.th += TAU / cfg.player.turnIncrement;
      (player.th >= TAU) ? player.th -= TAU : {};
    }
    if (player.client.intent.right) {
      player.th -= TAU / cfg.player.turnIncrement;
      (player.th < 0) ? player.th += TAU : {};
    }

    //Handle throttle
    if (player.client.intent.forward) {
      if (!player.client.intent.right && !player.client.intent.left) {
        player.x += cfg.player.speed * Math.sin(player.th);
        player.y += cfg.player.speed * Math.cos(player.th);
      } else {
        player.x += cfg.player.speedTurning * Math.sin(player.th);
        player.y += cfg.player.speedTurning * Math.cos(player.th);
      }
    }

    //Handle aiming
    //player.gh = 4 * Math.atan(data.mousePos.x - player.x) / (data.mousePos.y - player.y);\
    player.gh = Math.atan2(player.client.mousePos.x - player.x, player.client.mousePos.y - player.y);

    //Handle firing
    console.log(player.gc);
    if (player.gc > 0) {
      player.gc--;
    } else if (player.client.intent.mouse) {
      //Set the firing delay
      player.gc = cfg.player.fireIncrement;
      //Create the bullet
      state.bullets[currentBulletId++] = {
        x: player.x, //x coord
        y: player.y, //y coord
        h: player.gh //heading
      }
    }

    //Handle placing a bomb
    //todo

    //BELOW IS TEMP, REMOVE AFTER TESTING
    if (player.x < 0 || player.x >= cfg.window.width || player.y < 0 || player.y >= cfg.window.height) {
      player.x = 300;
      player.y = 300;
    }
  }

  //Handle bullet movement
  for (var id in state.bullets) {
    var bullet = state.bullets[id] || {};

    //Update position


    //Handle collision

  }

  //Send the game's state to the client afterwards
  io.sockets.emit('state', state);
}, 1000 / 60);




//New connection handler
function handleConnectEvent(socket) {
  socket.on('newPlayer', () => {
    console.log('new player with ID ' + socket.id);
    state.players[socket.id] = PLAYER_TEMPLATE;
  });
}

//Handle client input data
function handleClientData(socket) {
  socket.on('clientData', data => {
    //console.log('movement recorded: ' + JSON.stringify(data));
     state.players[socket.id] ? state.players[socket.id].client = data : {};
  });
}

//Connection closed handler
// function handleDisconnectEvent(socket) {
//   socket.on('disconnect', () => {
//     console.log('player with ID ' + socket.id + ' disconnected');
//     delete players[socket.id];
//   });
