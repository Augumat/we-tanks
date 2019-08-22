var socket = io();

//Handle a new player joining
socket.emit('newPlayer');
setInterval(() => {
  //console.log(JSON.stringify(clientData));
  socket.emit('clientData', clientData);
}, 1000 / 60);




//Template for packets sent to the Server
var clientData = {
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
};

//Handle key presses
document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 65: // A
      clientData.intent.left = true;
      break;
    case 87: // W
      clientData.intent.forward = true;
      break;
    case 68: // D
      clientData.intent.right = true;
      break;
    case 32: // [space]
      clientData.intent.space = true;
      break;
  }
});
//Handle key releases
document.addEventListener('keyup', event => {
  switch (event.keyCode) {
    case 65: // A
      clientData.intent.left = false;
      break;
    case 87: // W
      clientData.intent.forward = false;
      break;
    case 68: // D
      clientData.intent.right = false;
      break;
    case 32: // [space]
      clientData.intent.space = false;
      break;
  }
});

//Handle mouse presses
document.addEventListener('mousedown', evt => {
  onMouseUpdate(evt);
  clientData.intent.mouse = true;
});
//Handle mouse releases
document.addEventListener('mouseup', evt => {
  onMouseUpdate(evt);
  clientData.intent.mouse = false;
});

//Updates the mouse position when moved within the window
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);
function onMouseUpdate(evt) {
  let rect = canvas.getBoundingClientRect();
  clientData.mousePos.x = evt.pageX - rect.left;
  clientData.mousePos.y = evt.pageY - rect.top;
}




//Set hooks TEMP
var canvas = document.getElementById('canvas');
canvas.width = 1280;
canvas.height = 720;

var tankBase = document.getElementById('tankBase');
var tankGun = document.getElementById('tankGun');

var context = canvas.getContext('2d');
socket.on('state', state => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var id in state.players) {
    let player = state.players[id];

    //Draw the player's tank base with the correct heading
    context.beginPath();
    context.translate(player.x, player.y);
    context.rotate(-player.th);
    context.drawImage(
      tankBase,
      -(tankBase.width / 2),
      -(tankBase.height / 2),
      tankBase.width,
      tankBase.height
    );
    context.rotate(player.th);
    context.translate(-player.x, -player.y);

    //Draw the player's gun with the correct heading
    context.beginPath();
    context.translate(player.x, player.y);
    context.rotate(-player.gh);
    context.drawImage(
      tankGun,
      -(tankBase.width / 2),
      -(tankBase.height / 2),
      tankBase.width,
      tankBase.height
    );
    context.rotate(player.gh);
    context.translate(-player.x, -player.y);
  }
});
