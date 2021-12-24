let rad = 20; // Width of the shape
let xpos, ypos; // Starting position of shape

let xspeed = 10; // Speed of the shape
let yspeed = 2.2; // Speed of the shape

let xdirection = 1; // Left or Right
let ydirection = 1; // Top to Bottom

function setup() {
  createCanvas(720, 400);
  noStroke();
  frameRate(30);
  ellipseMode(RADIUS);
  // Set the starting position of the shape
  xpos = width / 2;
  ypos = height / 2;
}

function draw() {
  background(0);

  // Update the position of the shape
  xpos = xpos + xspeed * xdirection;
  ypos = ypos + yspeed * ydirection;

  // Test to see if the shape exceeds the boundaries of the screen
  // If it does, reverse its direction by multiplying by -1
  if (xpos > p5.width - rad || xpos < rad) {
    xdirection *= -1;
  }
  if (ypos > p5.height - rad || ypos < rad) {
    ydirection *= -1;
  }
  
  if (abs(xpos - mouseX) < 30 && abs(ypos - mouseY) < 70) {
    print("test")
    xdirection *= -1;
  }

  // Draw the shape
  ellipse(xpos, ypos, rad, rad);
  
  push()
  fill(155, 89, 182);   
  rect(mouseX - 5, mouseY - 25, 10, 50, 10)
  pop()
  
}
