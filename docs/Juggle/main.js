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
	CHAR_SPEED: .5,
	BULLET_SPEED: 8,

	SPAWN_POINT: vec(200 * 0.5, 0) //can spawn point
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2,
    seed: 1,
    isPlayingBgm: true,
    isReplayEnabled: true,
	isDrawingParticleFront: true,
    theme: "crt"
};


/*Can dadatype:
	(position, velocity, angle, direction, omega)
	*Omega = angular velocity, Direction = direction of rotation
*/
/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector,
 * ang: number,
 * dir: number,
 * ome: number,
 * hit: number
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
cans = [];											//array to store existing cans

function update() {
	if (!ticks) {
		cans.forEach((c) => {
			if(cans.length > 0)
				cans.splice(0, 1);
		});
		spawnCan();
		
		lineDirection = G.LINE_SPEED;
		charDirection = G.CHAR_SPEED;
	}
	
	//draw character
	color("cyan");
	box(charPos.x, charPos.y, 10, 10);

	color("red");
	line(charPos.x, charPos.y, lineEnd.x, lineEnd.y, 1);

	//stops movement if key is held
	if(input.isPressed && ticks > 20){
		lineDirection *= 0;
		charDirection *= 0;
	}

	if(input.isJustReleased && ticks > 20){
		//sets both the direction of the firing line and the character to left or right randomly
		Math.floor(Math.random() * 2) == 0 ? lineDirection = G.LINE_SPEED * -1: lineDirection = G.LINE_SPEED;
		Math.floor(Math.random() * 2) == 0 ? charDirection = G.CHAR_SPEED * -1: charDirection = G.CHAR_SPEED;

		//create a new instance of bullet object and add to array
		bullets[bullets.length] = new Bullet(vec(charPos.x, charPos.y), vec(lineEnd.x, lineEnd.y)); //create new vectors to avoid pass by reference which for some reason is included in this garbage library
		play("hit");
	}

	if(charPos.x == G.SLIDING_X_BUFFER  && charDirection < 0|| (charPos.x == G.WIDTH - G.SLIDING_X_BUFFER && charDirection > 0))  charDirection *= -1; //changes direction if character reaches the end of set bounds 

	//find y=mx+b form of the shooting line
	slope = (lineEnd.y - charPos.y)/(lineEnd.x - charPos.x);
	b = lineEnd.y - slope * lineEnd.x;

	//console.log("m " + slope + " b " + b);
	//changes the direction in which the line is moving when it intersects or passes the points (0, limit) or (200, limit);
	if((solveY(0, slope,b) <= G.SHOOTING_Y_LIMIT && solveY(0, slope,b) >= G.SHOOTING_Y_LIMIT - 15 && lineDirection < 0) || (solveY(200, slope,b) <= G.SHOOTING_Y_LIMIT && solveY(200, slope, b) >= G.SHOOTING_Y_LIMIT - 15 && lineDirection > 0)){
		lineDirection *= -1;
	}

	charPos.x += charDirection; //moves the character in whichever direction
	lineEnd.x += lineDirection; //move the shooting line in whichever direction

	//Destroy cans that fall off screen, end game if un-hit can falls
	cans.forEach((c) => {
		if(c.pos.y > G.HEIGHT - 10){
			play("select");
			cans.splice(cans.indexOf(c), 1);
			/*if(c.hit > 0){
				spawnCan();
			}else{*/
				end();
			//}
		}
	});
	
	//draw cans
	
	cans.forEach((c) => {
		if(c.hit == 1)
			color("green");
		else if(c.hit == 2)
			color("yellow");
		else if(c.hit >= 3)
			color("red");
		else
			color("light_black");
		
		bar(c.pos.x, c.pos.y, 12, 8, c.ang);
	});

	//draw bullets
	for(let j = 0; j < bullets.length; j++){
		color("purple");
		//draw bullet
		arc(bullets[j].current.x, bullets[j].current.y, 3, 4, 0, 2*PI);
	}

	//check can and bullet collision	
	for(let j = 0; j < bullets.length; j++){ //iterate through bullets 
		cans.forEach((c) => { //iterate through cans
		color("transparent");
			if(bar(c.pos.x, c.pos.y, 12, 8, c.ang).isColliding.rect.purple){
				
				console.log("hit");
				play("coin");

				c.hit++;

				let addedScore = 0;
				if(c.hit == 1)
					addedScore = 100;
				else if(c.hit == 2)
					addedScore = 250;
				else if(c.hit >= 3)
					addedScore = 500;
				
				if(c.hit == 1)
					color("green");
				else if(c.hit == 2)
					color("yellow");
				else if(c.hit >= 3)
					color("red");
				else
					color("light_black");
				
				particle(
					c.pos.x,
					c.pos.y,
					30,
					3,
					0,
					2*PI
				);

				addScore(addedScore, G.WIDTH * 0.5, G.HEIGHT - 25);

				//can bounce code
				c.vel.y += -3;
				c.vel.x += -1.5;
				c.ome = rnd(1);
				let direction = rnd(0.2);
				if(direction > 0.5)
					direction = 1
				else
					direction = -1;
					c.dir = direction;

				bullets.splice(j, 1);
			}
		});
	}

	for(let j = 0; j < bullets.length; j++){ //iterate through bullets 
		//change bullet position according to component of movement in x and y direction and speed
		bullets[j].current.x += bullets[j].xIter * G.BULLET_SPEED;
		bullets[j].current.y -= bullets[j].yIter * G.BULLET_SPEED;

		//remove bullets from array once they leave the screen
		if(bullets[j].current.y < -20){
			bullets.splice(j, 1);
		}
	}

	//apply can physics
	cans.forEach((c) => {
		//if the can hits a wall, reverse horizontal velocity & angular velocity.
		//this makes it look like the can is "bouncing" off the walls.
		if(c.pos.x > G.WIDTH - 6 || c.pos.x < 6){
			c.vel.x *= -1;
			c.dir *= -1;
		}
		c.pos.add(c.vel);  //update can position
		c.vel.x *= 0.99; //horizontal drag
		c.ome *= 0.99; //angular velocity drag
		c.ang += c.ome * c.dir; //update angle by adding omega
		//input.isPressed ? c.vel.y *= (1.01 * gravityMultiplier / 2) : c.vel.y *= (1.01 * gravityMultiplier) //gravity acceleration is halved when click is held 
		//c.vel.y *= 1.01;
		c.vel.y += 0.01;
		//if(c.pos.y < 10)
		//	c.vel.y = 0;
		if(c.vel.y < -1.5)
			c.vel.y = -1.5;
		//c.vel.x *= velocityMultiplier;
		c.pos.clamp(5, G.WIDTH - 5, -10000, G.HEIGHT - 5);
	});

}

//function to find y when given slope x and y-int
function solveY(x, m, b){
	return(m*x + b); 
}

//constructor for bullet object
function Bullet(c, d){
	//keep track of current position and desination point
	this.current = c;
	this.destination = d;

	//solve for slope y intercept and angle made with theta. Could all be useful with differne implementations and additions to the program so I just put them all here 
	this.slope = ((G.HEIGHT - c.y)- (G.HEIGHT - d.y))/(c.x-d.x); //subtract y from G.HEIGHT to simulate the origin being in the bottom right corner
	this.b = d.y - slope * d.x;
	this.theta = (Math.atan(this.slope));

	//a system of equations to ensure that the magnitude of the hypotenuse of the right triangle made by the x component and y component is always 1, therefore, regardless of the angle that the line is at, the projectile will move the same distance per frame
	//equations are slope = y/x and y^2 + x^2 = 1^2
	c.x >= d.x ? this.xIter = -1 * Math.sqrt(Math.pow(slope, 2) + 1)/ (Math.pow(slope, 2) + 1) : this.xIter = Math.sqrt(Math.pow(slope, 2) + 1)/ (Math.pow(slope, 2) + 1); //due to the fact that this is quadratic, result is ??. This conditional just determines if the line is to the left or right of the character and sets the x iterator to y or x accordingly
	this.yIter = Math.sqrt(1- Math.pow(this.xIter, 2)); 
}

//spawn cans at the fixed spawnpoint with a randomized horizontal velocity
function spawnCan(){
	//for some reason, the cons G.SPAWN_POINT breaks the spawn code? Using vec(100, 0) instead
	let direction = rnd(1);
	if(direction > 0.5)
		direction = 1
	else
		direction = -1;
	cans.push( {pos: vec(100, 0), vel: vec( rnd(6) - 3, 0.1), ang: rnd(PI), dir: direction, ome: rnd(0.5), hit: 0} );
}


