import React, { useEffect, useState } from "react";
import Sketch from "react-p5";
import './App.css';

let xpos, ypos; // Starting position of shape

let xdirection = 1; // Left or Right
let ydirection = 1; // Top to Bottom

let frameDiff = 0

let ready = false;

let socketOpen = false;

let pause = 0

function getWindowDimensions() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //console.log(windowDimensions)

  return windowDimensions;
};

// Rect to circle collision in 2D. Assumes rectMode(CORNER) && ellipseMode(CENTER);
function RectCircleCollide(p5, rx, ry, rw, rh, cx, cy, diameter) {
  //2d
  // temporary variables to set edges for testing
  var testX = cx;
  var testY = cy;

  // which edge is closest?
  if (cx < rx){         testX = rx       // left edge
  }else if (cx > rx+rw){ testX = rx+rw  }   // right edge

  if (cy < ry){         testY = ry       // top edge
  } else if (cy > ry+rh){ testY = ry+rh }   // bottom edge

  // // get distance from closest edges
  var distance = p5.dist(cx,cy,testX,testY)

  // if the distance is less than the radius, collision!
  if (distance <= diameter/2) {
    return true;
  }
  return false;
};

let player = 1;
let oppponentPos = 50;

let oppoBallPosX = 0
let oppoBallPosY = 0

export default (props) => {

  let exampleSocket = new WebSocket("ws://localhost:13254");

  exampleSocket.onmessage = function(e){
    var server_message = e.data;
    console.log(server_message);
    console.log("got here");

    if (server_message.startsWith("PLAYER: ")) {
      player = parseInt(server_message.slice(8,server_message.length))
    } else if (server_message.startsWith("MOVE: ")) {
      oppponentPos = parseFloat(server_message.slice(6,server_message.length))
    } else if (server_message.startsWith("READY")) {
      console.log("READY TO START")
      ready = true;
    } else if (server_message.startsWith("BALLX: ")) {
      oppoBallPosX = parseFloat(server_message.slice(7,server_message.length))
    } else if (server_message.startsWith("BALLY: ")) {
      oppoBallPosY = parseFloat(server_message.slice(7,server_message.length))
    }
  }

  exampleSocket.onopen = function(e) {
    exampleSocket.send("PIN: 1");
    socketOpen = true;
  }

  //props.setStatus("Connecting to Room 1...")

  //TODO: FIGURE OUT HOW TO SET STATE TIED WITH SCREEN SIZE (AND RECORD proprties of ball to adjust correctly)
  const { width, height } = useWindowDimensions();
  let h = height - height*.3;
  let w = width - width*.3;

  h = parseInt(h - (h % 3))
  w = parseInt((3/2) * h)

	const setup = (p5, canvasParentRef) => {

		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)
		p5.createCanvas(w, h).parent(canvasParentRef);
    p5.noStroke();
    p5.frameRate(60);
    p5.ellipseMode(p5.RADIUS);
    // Set the starting position of the shape
    xpos = p5.width / 2;
    ypos = p5.height / 2;
	};

	const draw = (p5) => {
		
    p5.background(0);

    console.log(ready)
    if (!ready) {
      pause = 0
      if (socketOpen) {
        props.setStatus("1/2 Players Connected, Waiting for Opponent!")
      }
    } else {
      props.setStatus("2/2 Players Connected, Game Started!")
      pause = 1
    }

    let pWidth = p5.height*0.012
    let pHeight = p5.height*0.065

    let xspeed = p5.width*0.01; // Speed of the shape
    let yspeed = p5.height*0.002; // Speed of the shape

    let rad = p5.height*0.027; // Width of the shape

    // Update the position of the shape
    if (player == 1) {
      xpos = xpos + xspeed * xdirection * pause;
      ypos = ypos + yspeed * ydirection * pause;
    } else {
      xpos = oppoBallPosX * p5.height
      ypos = oppoBallPosY * p5.height
      if (!ready) {
        xpos = xpos
        ypos = ypos
      }
    }

    // Test to see if the shape exceeds the boundaries of the screen
    // If it does, reverse its direction by multiplying by -1
    if (xpos > p5.width - rad || xpos < rad) {
      xdirection *= -1;
    }
    if (ypos > p5.height - rad || ypos < rad) {
      ydirection *= -1;
    }

    // Draw the shape
    p5.ellipse(xpos, ypos, rad, rad);
    //console.log(xpos)

    let p1_command = p5.mouseY
    let p2_command = p5.height/2

    if (player == 1) {
      p1_command = p5.mouseY
      p2_command = oppponentPos * p5.height
    } else {
      p1_command = oppponentPos * p5.height
      p2_command = p5.mouseY
    }

    if (socketOpen) {
      let moveSend = p5.mouseY
      //p5.constrain(p5.mouseY - pHeight/2, 0, p5.height - pHeight)
      exampleSocket.send("MOVE: " + moveSend/p5.height);

      if (player == 1) {
      exampleSocket.send("BALLX: " + xpos/p5.height);
      exampleSocket.send("BALLY: " + ypos/p5.height);
      }
    }
    
    //(p5.abs(xpos - p5.mouseX) < 30 && p5.abs(ypos - p5.mouseY) < 70)
    let touching = RectCircleCollide(p5, 60 - pWidth/2, p1_command - pHeight/2, pWidth, pHeight, xpos, ypos, rad*2)
    touching = touching || RectCircleCollide(p5, p5.width - 60 - pWidth/2, p2_command - pHeight/2, pWidth, pHeight, xpos, ypos, rad*2)
    
    if (touching && frameDiff > 30) {
      p5.print("test")
      xdirection *= -1;
      frameDiff = 0
    }

    let distanceFromWall = p5.height * 0.12
    
    p5.push()
    //p5.fill(155, 89, 182);   
    p5.fill(0, 200, 0);  
    //p5.rect(p5.mouseX - 5, p5.mouseY - 25, 10, 50, 10)
    p5.rect(distanceFromWall, p5.constrain(p1_command - pHeight/2, 0, p5.height - pHeight), pWidth, pHeight, 10)
    p5.pop()

    p5.push()
    p5.fill(0, 200, 0);  
    p5.rect(p5.width - distanceFromWall, p5.constrain(p2_command - pHeight/2, 0, p5.height - pHeight), pWidth, pHeight, 10)
    p5.pop()
    
    frameDiff++;

	};

	return <Sketch setup={setup} draw={draw} className="Game"/>;
};