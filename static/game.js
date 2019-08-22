var socket = io();

//Handle a new player joining
socket.emit('newPlayer');
setInterval(() => {
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
document.addEventListener('mousedown', event => {
  clientData.intent.mouse = true;
});
//Handle mouse releases
document.addEventListener('mouseup', event => {
  clientData.intent.mouse = false;
});




//Set hooks TEMP
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', players => {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();

    context.moveTo(player.x, player.y);
    context.lineTo(mousePos.x, mousePos.y);
  }
});

//https://stackoverflow.com/a/17130415
function updateCursor(event) {
  let rect = canvas.getBoundingClientRect();
  mousePos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}
