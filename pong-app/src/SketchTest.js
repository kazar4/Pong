import React, { useEffect, useState, useRef } from "react";
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
	if (cx < rx) {
		testX = rx       // left edge
	} else if (cx > rx + rw) { testX = rx + rw }   // right edge

	if (cy < ry) {
		testY = ry       // top edge
	} else if (cy > ry + rh) { testY = ry + rh }   // bottom edge

	// // get distance from closest edges
	var distance = p5.dist(cx, cy, testX, testY)

	// if the distance is less than the radius, collision!
	if (distance <= diameter / 2) {
		return true;
	}
	return false;
};

let player = 1;
let oppponentPos = 50;

let oppoBallPosX = 100;
let oppoBallPosY = 100;

let exampleSocket = "test";

let startScreen = false;

let p1Score = 0;
let p2Score = 0;

let lastScored = 1;

let speedToggle = false;

export default (props) => {

	const loadedOnce = useRef({
		loadedOnce: false
	})

	function startConnection(pin) {
		exampleSocket = new WebSocket("ws://kazar4:13254");
	
		exampleSocket.onmessage = function (e) {
			//console.log("Retrived Message")
	
			var server_message = e.data;
			//console.log(server_message);
			//console.log("got here");
	
			if (server_message.startsWith("PLAYER: ")) {
				player = parseInt(server_message.slice(8, server_message.length))
			} else if (server_message.startsWith("MOVE: ")) {
				oppponentPos = parseFloat(server_message.slice(6, server_message.length))
			} else if (server_message.startsWith("READY")) {
				console.log("READY TO START")
				startScreen = true;
			} else if (server_message.startsWith("BALLX: ")) {
				oppoBallPosX = parseFloat(server_message.slice(7, server_message.length))
			} else if (server_message.startsWith("BALLY: ")) {
				oppoBallPosY = parseFloat(server_message.slice(7, server_message.length))
			}
		}
	
		exampleSocket.onopen = function(e) {
			console.log("Socket Opened!")
			exampleSocket.send("PIN: " + pin);
			loadedOnce.current.loadedOnce = true;
			socketOpen = true;
		}
	}

	if (props.sendData && !loadedOnce.current.loadedOnce) {
		console.log(props.inputText)
		startConnection(props.inputText)
	}

	//props.setStatus("Connecting to Room 1...")

	//TODO: FIGURE OUT HOW TO SET STATE TIED WITH SCREEN SIZE (AND RECORD proprties of ball to adjust correctly)
	const { width, height } = useWindowDimensions();
	let h = height - height * .3;
	let w = width - width * .3;

	h = parseInt(h - (h % 3))
	w = parseInt((3 / 2) * h)

	let timer = 3

	let coolFont;

	let link = 'https://fonts.googleapis.com/css?family=VT323'

	const preload = (p5) => {
		//coolFont = p5.loadFont('coolFont.css')
	}

	const setup = (p5, canvasParentRef) => {

		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)

		//coolFont = p5.loadFont(link)

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

		if (startScreen) {

			p5.push();
			//p5.textFont(coolFont)
			p5.fill(255,255,255)
			p5.textSize(p5.height*.15);
			p5.text(timer, p5.width/2.15, p5.height/3.5)
			p5.pop();

			p5.print(timer)
			if (p5.frameCount % 60 == 0 && timer > 0) {
				timer --;
			} else if (timer == 0 && p5.frameCount % 60 == 0) {
				startScreen = false;
				ready = true;
			}
		}

		p5.push();
		//p5.textFont(coolFont)
		p5.fill(255,255,255)
		p5.textSize(p5.height*.05);
		p5.text(p1Score + " : " + p2Score, p5.width/2.15, p5.height/9)
		p5.pop();

		//console.log(ready)

		if (p5.frameCount % 60 == 0) {
			console.log(ready)
		}

		if (!ready) {
			pause = 0
			if (socketOpen) {
				props.setStatus("1/2 Players Connected, Waiting for Opponent!")
			}
		} else {
			props.setStatus("2/2 Players Connected, Game Started!")
			pause = 1
		}

		let pWidth = p5.height * 0.012
		let pHeight = p5.height * 0.065

		let xspeed = p5.width * 0.01; // Speed of the shape
		let yspeed = p5.height * 0.002; // Speed of the shape

		if (speedToggle) {
			xspeed = xspeed * 1.5
		} else {
			xspeed = p5.width * 0.01; // Speed of the shape
		}

		let rad = p5.height * 0.027; // Width of the shape

		// Update the position of the shape
		if (player == 1) {
			xpos = xpos + xspeed * (xdirection * lastScored) * pause;
			ypos = ypos + yspeed * ydirection * pause;
		} else {
			if (!ready) {
				xpos = xpos
				ypos = ypos
			} else {
				xpos = oppoBallPosX * p5.height
				ypos = oppoBallPosY * p5.height
			}
		}

		// Draw the shape
		p5.ellipse(xpos, ypos, rad, rad);
		//console.log(xpos)

		let p1_command = p5.mouseY
		let p2_command = p5.height / 2

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
			exampleSocket.send("MOVE: " + moveSend / p5.height);

			if (player == 1) {
				exampleSocket.send("BALLX: " + xpos / p5.height);
				exampleSocket.send("BALLY: " + ypos / p5.height);
			}
		}

		// Test to see if the shape exceeds the boundaries of the screen
		// If it does, reverse its direction by multiplying by -1
		if (xpos > p5.width - rad || xpos < rad) {
			//xdirection *= -1;
			if (xpos > p5.width - rad) {
				p1Score = p1Score + 1;
				lastScored = 1
			} else if (xpos < rad) {
				p2Score = p2Score + 1;
				lastScored = -1
			}

			xpos = p5.width / 2;
			ypos = p5.height / 2;

			ready = false;
			startScreen = true;
		}
		if (ypos > p5.height - rad || ypos < rad) {
			ydirection *= -1;
		}

		//(p5.abs(xpos - p5.mouseX) < 30 && p5.abs(ypos - p5.mouseY) < 70)
		let touchingP1 = RectCircleCollide(p5, 60 - pWidth / 2, p1_command - pHeight / 2, pWidth*3, pHeight, xpos, ypos, rad * 2)
		let touchingP2 = RectCircleCollide(p5, p5.width - 60 - pWidth / 2 - pWidth*3, p2_command - pHeight / 2, pWidth*3, pHeight, xpos, ypos, rad * 2)

		if ((touchingP1 || touchingP2) && frameDiff > 30) {
			p5.print("test")
			xdirection *= -1;
			frameDiff = 0
		}

		let distanceFromWall = p5.height * 0.12

		p5.push()
		//p5.fill(155, 89, 182);   
		p5.fill(0, 200, 0);
		//p5.rect(p5.mouseX - 5, p5.mouseY - 25, 10, 50, 10)
		p5.rect(distanceFromWall, p5.constrain(p1_command - pHeight / 2, 0, p5.height - pHeight), pWidth, pHeight, 10)
		p5.pop()

		p5.push()
		p5.fill(0, 200, 0);
		p5.rect(p5.width - distanceFromWall, p5.constrain(p2_command - pHeight / 2, 0, p5.height - pHeight), pWidth, pHeight, 10)
		p5.pop()

		frameDiff++;

	};

	const keyPressed = (p5) => {
		if (p5.keyCode === p5.LEFT_ARROW) {
			p5.print("TOGGLE ON")
			speedToggle = true;
		} else if (p5.keyCode === p5.RIGHT_ARROW) {
			speedToggle = false;
		}
	}

	return <Sketch preload={preload} setup={setup} draw={draw} keyPressed={keyPressed} className="Game" />;
};