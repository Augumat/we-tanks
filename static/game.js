var socket = io();

//Handle a new player joining
socket.emit('newPlayer');
setInterval(() => {
  socket.emit('intent', intent);
}, 1000 / 60);




//Basic template for the state of client intent
var intent = {
  forward: false,
  left: false,
  right: false,
  mouse: false
}

//Bas
var mousePos = {
  x: 0,
  y: 0
}

//Handle key presses
document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 65: // A
      intent.left = true;
      break;
    case 87: // W
      intent.forward = true;
      break;
    case 68: // D
      intent.right = true;
      break;
  }
});
//Handle key releases
document.addEventListener('keyup', event => {
  switch (event.keyCode) {
    case 65: // A
      intent.left = false;
      break;
    case 87: // W
      intent.forward = false;
      break;
    case 68: // D
      intent.right = false;
      break;
  }
});

//Handle mouse presses
document.addEventListener('mousedown', event => {
  intent.mouse = true;
});
//Handle mouse releases
document.addEventListener('mouseup', event => {
  intent.mouse = false;
});




//Set hooks TEMP
socket.on('message', data => {
  console.log(data);
});

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
