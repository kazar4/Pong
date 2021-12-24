import React, { useEffect, useState } from "react";
import Sketch from "react-p5";
import './App.css';

	let x = 50;
	let y = 50;

  let rad = 20; // Width of the shape
  let xpos, ypos; // Starting position of shape

  let xspeed = 10; // Speed of the shape
  let yspeed = 2.2; // Speed of the shape

  let xdirection = 1; // Left or Right
  let ydirection = 1; // Top to Bottom

  let frameDiff = 0

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

    console.log(windowDimensions)
  
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


export default (props) => {

  //TODO: FIGURE OUT HOW TO SET STATE TIED WITH SCREEN SIZE (AND RECORD proprties of ball to adjust correctly)
  const { width, height } = useWindowDimensions();
  let h = height;
  let w = width;

	const setup = (p5, canvasParentRef) => {

		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)
		p5.createCanvas(w - w*.3, h - h*.3).parent(canvasParentRef);
    p5.noStroke();
    p5.frameRate(60);
    p5.ellipseMode(p5.RADIUS);
    // Set the starting position of the shape
    xpos = p5.width / 2;
    ypos = p5.height / 2;
	};

	const draw = (p5) => {
		
    p5.background(0);

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

    //(p5.abs(xpos - p5.mouseX) < 30 && p5.abs(ypos - p5.mouseY) < 70)
    let touching = RectCircleCollide(p5, p5.mouseX - 5, p5.mouseY - 25, 10, 50, xpos, ypos, rad*2)
    
    if (touching && frameDiff > 30) {
      p5.print("test")
      xdirection *= -1;
      frameDiff = 0
    }

    // Draw the shape
    p5.ellipse(xpos, ypos, rad, rad);
    
    p5.push()
    p5.fill(155, 89, 182);   
    p5.rect(p5.mouseX - 5, p5.mouseY - 25, 10, 50, 10)
    p5.pop()
    
    frameDiff++;

	};

	return <Sketch setup={setup} draw={draw} className="Game"/>;
};