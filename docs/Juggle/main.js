title = `
 Juggle 
`;

description = `

Click To Juggle 
`;

characters = [
	`
   `


];

options = {};

const G = {
	WIDTH: 200,
	HEIGHT: 250,

	SLIDING_X_BUFFER: 25,

	SHOOTING_Y_LIMIT: 150,
	
	LINE_SPEED: 4,
	CHAR_SPEED: .5
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2,
    seed: 1,
    isPlayingBgm: false,
    isReplayEnabled: true,
	isDrawingParticleFront: true,
    theme: "simple"
};

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector
 * }} Can
 */

/**
 * @typedef { Can }
 */
let cans;

let charDirection = G.CHAR_SPEED;
let charPos = vec(100, 243);
let lineDirection = G.LINE_SPEED;
let lineEnd = vec(100, 0);
let slope;
let b;
let colors = ["green", "purple", "blue"];
let bullets = [];
cans = [];

function update() {
	if (!ticks) {
		
	}
	//draw character
	color("cyan");
	box(charPos.x, charPos.y, 10, 10);

	color("red");
	line(charPos.x, charPos.y, lineEnd.x, lineEnd.y, 1);

	//stops movement if key is held
	if(input.isPressed){
		lineDirection *= 0;
		charDirection *= 0;
	}

	if(input.isJustReleased){
		//sets both the direction of the firing line and the character to left or right randomly
		Math.floor(Math.random() * 2) == 0 ? lineDirection = G.LINE_SPEED * -1: lineDirection = G.LINE_SPEED;
		Math.floor(Math.random() * 2) == 0 ? charDirection = G.CHAR_SPEED * -1: charDirection = G.CHAR_SPEED;

		//create a new instance of bullet object and add to array
		bullets[bullets.length] = new Bullet(charPos, lineEnd);
	}

	if(charPos.x == G.SLIDING_X_BUFFER  && charDirection < 0|| (charPos.x == G.WIDTH - G.SLIDING_X_BUFFER && charDirection > 0))  charDirection *= -1; //changes direction if character reaches the end of set bounds 
	charPos.x += charDirection; //moves the character in whichever direction

	//find y=mx+b form of the shooting line
	slope = (lineEnd.y - charPos.y)/(lineEnd.x - charPos.x);
	b = lineEnd.y - slope * lineEnd.x;
	//changes the direction in which the line is moving when it intersects or passes the points (0, 125) or (200,125);
	if((solveY(0, slope,b) <= G.SHOOTING_Y_LIMIT && solveY(0, slope,b) >= G.SHOOTING_Y_LIMIT - 15 && lineDirection < 0) || (solveY(200, slope,b) <= G.SHOOTING_Y_LIMIT && solveY(200, slope, b) >= G.SHOOTING_Y_LIMIT - 15 && lineDirection > 0)){
		lineDirection *= -1;
	}

	for(let j = 0; j < bullets.length; j++){
		//color(colors[Math.floor(Math.random() * colors.length)]);
		color("purple");
		box(bullets[j].current.x, bullets[j].current.y, 3, 3);
	}

	lineEnd.x += lineDirection; //move the shooting line in whichever direction
}

//function to find y when given slope x and y-int
function solveY(x, m, b){
	return(m*x + b); 
}

//create a bullet object
function Bullet(c, d){
	this.current = c;
	this.destination = d;
	//this.x_movement = slope(current.x, );
}


