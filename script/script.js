function clear(context) {
  context.beginPath();
  context.fillStyle = '#fff';
  context.rect(0,0,1000,1000);
  context.fill();
}
function drawPolygon(context, x, y, ...args) {
  context.moveTo(x, y);
  for (let i = 0; i < args.length; i += 2) {
    context.lineTo(args[i], args[i+1]);
  }
}

function navigateTo() {
  window.location.href = 'main.html';
}

function aDrawPolygon(context, color, fill, stroke, ...args) {
  context.beginPath();
  context.fillStyle = color;
  drawPolygon(context, ...args);
  if (fill)
    context.fill();
  if (stroke)
    context.stroke();
}
function continuousPolygon(x, y, ...args) {
  let m = [x, y];
  for (let i = 0; i < args.length; i+=2) {
    x += args[i];
    y += args[i+1];
    m.push( x, y );
  }
  return m;
}
function rotatePolygon(alpha, ...args) {
  for (let i = 0; i < args.length; i += 2) {
    x = args[i];
    y = args[i+1];
    args[i]   = x * Math.cos(alpha) - y * Math.sin(alpha);
    args[i+1] = x * Math.sin(alpha) + y * Math.cos(alpha);
  }
  return args;
}
function translatePolygon(x, y, ...args) {
  for (let i = 0; i < args.length; i += 2) {
    args[i]   += x;
    args[i+1] += y;
  }
  return args;
}
//---------------------------------------------------------------

// x, y - pozitia, angle - orietarea, E - intensitatea (relativa [0, 1])
function Q(x, y, q, f) {
  this.x = x;
  this.y = y;
  this.q = q;
  f = f || {};
  this.f = {
    angle: f.angle || 0,
    mod: f.mod || 0
  }
}

// q - alta sarcina
Q.prototype.recalcForce = function(q) {
  if (q instanceof Q) {
    this.f.angle = Math.atan2(q.y - this.y, q.x - this.x);
    this.f.mod = (q.q * this.q) / (Math.pow(this.x - q.x, 2) + Math.pow(this.y - q.y, 2)) ; 
  }
  else {
    // this.f.angle = 0;
    this.f.mod = 0;
  }
}

//---------------------------------------------------------------

function Space(qList, context) {
  this.qList = qList;
  this.context = context;
}

Space.ARR_MAX_DIM = 5;


Space.prototype.draw = function(q) {
  clear(this.context);
  for (let i = 0; i < this.qList.length; ++i) {
    let qd = this.qList[i];
    qd.recalcForce(q);

    let arr = Space.getPolygonFromQ(qd);
    if (arr) {
      // Force exists: draw arraw
      aDrawPolygon(
        this.context, '#000', true, false, ...arr
      );
    }
    else {
      
      // No force: draw a circle
      this.context.beginPath();
      this.context.arc(qd.x, qd.y, 10, 0, 2 * Math.PI);
      this.context.fillStyle = '#000';
      this.context.fill();
    }
  }
}

Space.getPolygonFromQ = function(q) {
  if (!q.f.mod) return false;

  let arr = [
    -4, -0.5,
    8, 0,
    0, -1,
    2, 1.5,
    -2, 1.5,
    0, -1,
    -8, 0,
    0, -1
  ];

  
  const int = Space.ARR_MAX_DIM * (q.f.mod > 1 ? 1 : q.f.mod);
  return translatePolygon(
    q.x, q.y, 
    ...rotatePolygon(
      q.f.angle, ...continuousPolygon(
        ...arr.map((c) =>  c * int )
      )
    )
  );
};

//---------------------------------------------------------------

function main() {
  const DIM = 50;  // Lungimea unei sageti
  const VPR = 0.6; // pozitia centrului de rotatie fata de virf;
  let canvas = document.getElementById('display');
  let context = canvas.getContext('2d');
  let arrows = [];
  let H = canvas.height;
  let W = canvas.width;
  
  for (let i = 0; i < W / 50; ++i) {
    for (let j = 0; j < H / 50; ++j) {
      arrows.push(
        new Q(
          (i + 1) * DIM, (j + 1) * DIM, 1000, { angle: 0, mod: 0 }
        )
      );
    }
  }
  
  let s = new Space(arrows, context);
  
  s.draw();
  
  canvas.addEventListener('mousemove', function(event) {
    s.draw( 
      new Q(event.offsetX, event.offsetY, 50) 
    );
  });
  // asdfasdf();
}

//---------------------------------------------------------------

main();
