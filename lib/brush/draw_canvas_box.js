/*var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    rect = {},
    drag = false;*/

var canvas = document.getElementById('canvas'), rect = {}, drag = false;
var ctx_box = canvas.getContext('2d')


function draw() {
  /*ctx_box.beginPath();
  ctx_box.globalAlpha = 0.2;
  ctx_box.fillRect(rect.startX, rect.startY, rect.w, rect.h);*/
  //ctx_box.fillStyle = 'rgba(195, 210, 235, 0.4)'
  //ctx_box.fill();
  /*ctx_box.lineWidth = 2;
  ctx_box.strokeStyle = 'black';
  ctx_box.stroke();  */


/*ctx_box.save();
ctx_box.beginPath();
ctx_box.moveTo(100, 200);
ctx_box.lineTo(100, 300);
ctx_box.lineWidth = 2;
ctx_box.strokeStyle = '#e23fa9';
ctx_box.stroke();
ctx_box.restore();  */
  

}

function mouseDown(e) {
  //ctx_box.clearRect(0,0,canvas.width,canvas.height);
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop;
  drag = true;

}

function mouseUp() {
  drag = false;
  var positon = {x1: rect.startX, y1: rect.startY, x2: rect.w, y2: rect.h}
  console.log(positon)  
}

function mouseMove(e) {
  if (drag) {
    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
    rect.h = (e.pageY - this.offsetTop) - rect.startY ;
    //ctx_box.clearRect(0,0,canvas.width,canvas.height);
    draw();
  }
}

function init() {
  canvas.addEventListener('mousedown', mouseDown, false);
  canvas.addEventListener('mouseup', mouseUp, false);
  canvas.addEventListener('mousemove', mouseMove, false);
}

init();
