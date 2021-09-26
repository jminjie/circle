// wait for the content of the window element
// to load, then performs the operations.
// This is considered best practice.
window.addEventListener('load', ()=>{
		
	resize(); // Resizes the canvas once the window loads
	window.addEventListener('resize', resize);


    const canvas = document.querySelector('#canvas');
    canvas.addEventListener("touchstart", startPaintingTouch, false);
    canvas.addEventListener("touchend", stopPainting, false);
    canvas.addEventListener("touchmove", sketchTouch, false);


    clearCanvas();
    startAnimation();
});

function startAnimation() {
	console.log("START");
    Tone.Transport.start()
    Tone.start();
    animate();
    beat1y = 0;
    beat3y = 0;
    beat2x = 0;
    beat4x = 0;
	document.getElementById("stopButton").style.display = "inline";
	document.getElementById("startButton").style.display = "none";

}

function stopAnimation() {
    console.log("STOP")
    Tone.Transport.stop()
	document.getElementById("stopButton").style.display = "none";
	document.getElementById("startButton").style.display = "inline";
}
	
const canvas = document.querySelector('#canvas');

// Context for the canvas for 2 dimensional operations
const ctx = canvas.getContext('2d');

canvas.onmousedown = startPaintingMouse;
canvas.onmouseup = stopPainting;
canvas.onmousemove = sketchMouse;
	
// Resizes the canvas to the available size of the window.
function resize(){
    canvas.width = window.innerWidth-100;
    canvas.height = window.innerHeight-300;
    let limitingDim = Math.min(canvas.height, canvas.width);
    setRadius(Math.min(220, limitingDim / 2 - 40));
}

var RADIUS = 220;
var userCircleTopRadius = RADIUS;
var userCircleBottomRadius = RADIUS;
var userCircleRightRadius = RADIUS;
var userCircleLeftRadius = RADIUS;

function setRadius(rad) {
    console.log("setRadius called from resize");
    RADIUS = rad;
    userCircleTopRadius = RADIUS;
    userCircleBottomRadius = RADIUS;
    userCircleRightRadius = RADIUS;
    userCircleLeftRadius = RADIUS;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f4b55'
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2,4,4);

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ce2960'
    ctx.setLineDash([5, 8]);
    x = canvas.width/2;
    y = canvas.height/2;

    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, 2 * Math.PI, true);
    ctx.stroke();
    userCircle = []

}

// Stores the initial position of the cursor
let coord = {x:0 , y:0};

// This is the flag that we are going to use to
// trigger drawing
let paint = false;

beat1y = 0;
beat3y = 0;
beat2x = 0;
beat4x = 0;

lastTime = 0

const sampler = new Tone.Sampler({
	urls: {
		"A3": "A3.mp3",
		"C3": "C3.mp3",
		"C4": "C4.mp3",
		"C5": "C5.mp3",
		"D5": "D5.mp3",
	},
	release: 1,
	baseUrl: "https://jminjie.github.io/samples/drum/",
}).toDestination();

beat1velocity = 0;
beat2velocity = 0;
beat3velocity = 0;
beat4velocity = 0;

const loopA = new Tone.Loop(time => {
    beat1velocity = 0.3;
}, "1m").start(0);
const loopB = new Tone.Loop(time => {
    beat3velocity = 0.3
}, "1m").start("2n");
const loopC = new Tone.Loop(time => {
    beat2velocity = 0.3
}, "1m").start("4n");
const loopD = new Tone.Loop(time => {
    beat4velocity = 0.3
}, "1m").start("2n.");


var shake = 0;
var elapsedTime = 1;

function animate() {
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Date.now() - lastTime;
    lastTime = Date.now();
    if (elapsedTime == 0) return;

    // handle beat 1
    if (beat1y >= userCircleTopRadius) {
        //console.log("COLLISION 1");
        shake = 40;
        sampler.triggerAttackRelease("A2", Tone.context.currentTime);
        beat1y = 0;
        beat1velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 - beat1y,4,4);
    beat1y += beat1velocity * (elapsedTime)

    // handle beat 2
    if (beat2x >= userCircleRightRadius) {
        //console.log("COLLISION 2");
        shake = 10;
        sampler.triggerAttackRelease("C5", Tone.context.currentTime);
        beat2x = 0;
        beat2velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2 + beat2x,canvas.height/2-2,4,4);
    beat2x += beat2velocity * (elapsedTime)

    // handle beat 3
    if (beat3y >= userCircleBottomRadius) {
        //console.log("COLLISION 3");
        shake = 20;
        sampler.triggerAttackRelease("C4", Tone.context.currentTime);
        beat3y = 0;
        beat3velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 + beat3y,4,4);
    beat3y += beat3velocity * (elapsedTime)

    // handle beat 4
    if (beat4x >= userCircleLeftRadius) {
        //console.log("COLLISION 4");
        shake = 10;
        sampler.triggerAttackRelease("C5", Tone.context.currentTime);
        beat4x = 0;
        beat4velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2 - beat4x,canvas.height/2-2,4,4);
    beat4x += beat4velocity * (elapsedTime)

    // draw other things
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2,4,4);

    ctx.lineWidth = 1;
    ctx.setLineDash([5, 8]);
    x = canvas.width/2;
    y = canvas.height/2;

    ctx.beginPath();
    if (shake > 1.5) {
        ctx.arc(x, y, RADIUS+shake, 0, 2 * Math.PI, true);

        shake = Math.pow(shake, elapsedTime * 0.055);
        //shake =  shake / (elapsedTime/7)
    } else {
        ctx.arc(x, y, RADIUS, 0, 2 * Math.PI, true);
    }
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    for (const [index, savedCoord] of userCircle.entries()) {
        if (index != 0) {
            ctx.beginPath();
            let lastPoint = userCircle[index-1];
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(savedCoord.x , savedCoord.y);
            ctx.stroke();
        }
    }
    ctx.restore()

    window.requestAnimationFrame(animate);
}

userCircle = []

// Updates the coordianates of the cursor when
// an event e is triggered to the coordinates where
// the said event is triggered.
function getPositionMouse(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
}

function getPositionTouch(event) {
    coord.x = event.touches[0].clientX - canvas.offsetLeft;
    coord.y = event.touches[0].clientY - canvas.offsetTop;
}

// The following functions toggle the flag to start
// and stop drawing
function startPaintingMouse(event) { startPainting(event, false); }
function startPaintingTouch(event) { startPainting(event, true); }
function startPainting(event, touch){
    paint = true;
    if (touch) {
        getPositionTouch(event);
    } else {
        getPositionMouse(event);
    }
    clearCanvas()
    stopAnimation();
}

lowestVal = 1000;
highestVal = -1;
function stopPainting(){
    console.log("stopPainting, calculating user circle radius");
    userCircleTopRadius = -1;
    userCircleRightRadius = -1;
    userCircleLeftRadius = -1;
    userCircleBottomRadius = -1;

    const xOffset = canvas.width/2;
    const yOffset = canvas.height/2;
    for (let i = 1; i < userCircle.length; i++) {
        point1 = userCircle[i-1];
        point2 = userCircle[i];

        //     a
        //    ----
        //   |
        //   |
        // b |
        //   |
        //   |
        //   |
        //   . origin of the circle, located at (xOffset, yOffset)

        if (Math.sign(point1.x - xOffset) != Math.sign(point2.x - xOffset)) {
            // 'a' has changed signs, meaning
            // we have crossed the vertical axis of the circle

            // convert x,y to a,b. This flips the y axis and centers it about the circle's origin
            point1.a = point1.x - xOffset;
            point1.b = yOffset - point1.y;
            point2.a = point2.x - xOffset;
            point2.b = yOffset - point2.y;

            // calculate Y-intercept == radius
            M = (point1.b - point2.b) / (point1.a - point2.a);
            R = Math.abs(point1.b - M * point1.a);

            // if b is pos, this is beat 1. if b is neg, this is beat 3
            if (point1.b > 0) {
                if (userCircleTopRadius == -1) {
                    console.log("setting top radius first time R=" + R);
                    userCircleTopRadius = R;
                } else {
                    console.log("setting top radius as min R=" + R + "userCircleTopRadius=" + userCircleTopRadius);
                    userCircleTopRadius = Math.min(userCircleTopRadius, R);
                }
            } else if (point1.b < 0) {
                console.log("setting bottom radius R=" + R);
                if (userCircleBottomRadius == -1) {
                    userCircleBottomRadius = R;
                } else {
                    userCircleBottomRadius = Math.min(userCircleBottomRadius, R);
                }
            }
        }
        if (Math.sign(yOffset - point1.y) != Math.sign(yOffset - point2.y)) {
            // 'b' has changed signs, meaning
            // we have crossed the horizontal axis of the circle

            // convert x,y to a,b. This flips the y axis and centers it about the circle's origin
            point1.a = point1.x - xOffset;
            point1.b = yOffset - point1.y;
            point2.a = point2.x - xOffset;
            point2.b = yOffset - point2.y;

            // calculate X-intercept == radius
            N = (point1.a - point2.a) / (point1.b - point2.b);
            R = Math.abs(point1.a - N * point1.b);

            // if a is pos, this is beat 2. if a is neg, this is beat 4
            if (point1.a > 0) {
                console.log("setting right radius R=" + R);
                if (userCircleRightRadius == -1) {
                    userCircleRightRadius = R;
                } else {
                    userCircleRightRadius = Math.min(userCircleRightRadius, R);
                }
            } else if (point1.a < 0) {
                console.log("setting left radius R=" + R);
                if (userCircleLeftRadius == -1) {
                    userCircleLeftRadius = R;
                } else {
                    userCircleLeftRadius = Math.min(userCircleLeftRadius, R);
                }
            }
        }
    }
    if (userCircleTopRadius == -1) {
        console.log("No top radius, using default");
        userCircleTopRadius = RADIUS;
    }
    if (userCircleBottomRadius == -1) {
        console.log("No bottom radius, using default");
        userCircleBottomRadius = RADIUS;
    }
    if (userCircleLeftRadius == -1) {
        console.log("No left radius, using default");
        userCircleLeftRadius = RADIUS;
    }
    if (userCircleRightRadius == -1) {
        console.log("No right radius, using default");
        userCircleRightRadius = RADIUS;
    }

    paint = false;
    startAnimation()
}

function sketchMouse(event) { sketch(event, false); }
function sketchTouch(event) { sketch(event, true); }
function sketch(event, touch){
    if (!paint) return;
    ctx.beginPath();

    ctx.lineWidth = 5;
    ctx.setLineDash([]);

    // Sets the end of the lines drawn
    // to a round shape.
    ctx.lineCap = 'round';

    // The cursor to start drawing
    // moves to this coordinate
    ctx.moveTo(coord.x, coord.y);

    // The position of the cursor
    // gets updated as we move the
    // mouse around.
    if (touch) {
        getPositionTouch(event);
    } else {
        getPositionMouse(event);
    }

    // A line is traced from start
    // coordinate to this coordinate
    ctx.lineTo(coord.x , coord.y);


    savedCoord = {x:coord.x , y:coord.y};
    userCircle.push(savedCoord);

    // Draws the line.
    ctx.stroke();
}




// TODO do this without jquery
$(document).ready(function() {
  if (document.cookie.indexOf("cookie_soundon=") < 0) {
    $('.sound-overlay').removeClass('d-none').addClass('d-block');
  }
  $('.accept-sound').on('click', function() {
    document.cookie = "cookie_soundon=true;";
    $('.sound-overlay').removeClass('d-block').addClass('d-none');
    stopAnimation();
	Tone.start();
	startAnimation();
	});
});
