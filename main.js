// wait for the content of the window element
// to load, then performs the operations.
// This is considered best practice.
window.addEventListener('load', ()=>{
		
	resize(); // Resizes the canvas once the window loads
	window.addEventListener('resize', resize);

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

const RADIUS = 220;

// Context for the canvas for 2 dimensional operations
const ctx = canvas.getContext('2d');

canvas.onmousedown = startPainting;
canvas.onmouseup = stopPainting;
canvas.onmousemove = sketch;
	
// Resizes the canvas to the available size of the window.
function resize(){
    ctx.canvas.width = window.innerWidth-100;
    ctx.canvas.height = window.innerHeight-300;
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
    userTopBottom = []
    userLeftRight = []

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
// all loops start until the Transport is started


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
        shake = 40;
        sampler.triggerAttackRelease("A2");
        beat1y = 0;
        beat1velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 - beat1y,4,4);
    beat1y += beat1velocity * (elapsedTime)

    // handle beat 2
    if (beat2x >= userCircleRightRadius) {
        shake = 10;
        sampler.triggerAttackRelease("C5");
        beat2x = 0;
        beat2velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2 + beat2x,canvas.height/2-2,4,4);
    beat2x += beat2velocity * (elapsedTime)

    // handle beat 3
    if (beat3y >= userCircleBottomRadius) {
        shake = 20;
        sampler.triggerAttackRelease("C4");
        beat3y = 0;
        beat3velocity = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 + beat3y,4,4);
    beat3y += beat3velocity * (elapsedTime)

    // handle beat 4
    if (beat4x >= userCircleLeftRadius) {
        shake = 10;
        sampler.triggerAttackRelease("C5");
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
    if (shake > 1) {
        ctx.arc(x, y, RADIUS+shake, 0, 2 * Math.PI, true);

        shake = Math.pow(shake, elapsedTime * 0.05);
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
userTopBottom = []
userLeftRight = []

// Updates the coordianates of the cursor when
// an event e is triggered to the coordinates where
// the said event is triggered.
function getPosition(event){
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
}

// The following functions toggle the flag to start
// and stop drawing
function startPainting(event){
    paint = true;
    getPosition(event);
    clearCanvas()
    stopAnimation();
}
userCircleTopRadius = RADIUS;
userCircleBottomRadius = RADIUS;
userCircleRightRadius = RADIUS;
userCircleLeftRadius = RADIUS;
lowestVal = 1000;
highestVal = -1;
function stopPainting(){
    paint = false;
    startAnimation()

    
    userCircleTopRadius = RADIUS;
    userCircleRightRadius = RADIUS;
    userCircleLeftRadius = RADIUS;
    userCircleBottomRadius = RADIUS;
    lowestVal = 1000;
    highestVal = -1;
    rightestVal = -1;
    leftestVal = 1000;
    // handle top and bottom radius
    for (let point of userTopBottom) {
        if (point.y < lowestVal && point.y < canvas.height/2)
            lowestVal = point.y 
        if (point.y > highestVal && point.y > canvas.height/2)
            highestVal = point.y
    }
    if (lowestVal != 1000) {
        userCircleTopRadius = canvas.height/2 - lowestVal;
    }
    if (highestVal != -1) {
        userCircleBottomRadius = highestVal - canvas.height/2;
    }

    // handle left and right radius
    for (let point of userLeftRight) {
        if (point.x > rightestVal && point.x > canvas.width/2)
            rightestVal = point.x;
        if (point.x < leftestVal && point.x < canvas.width/2)
            leftestVal = point.x;
    }
    if (rightestVal != -1) {
        userCircleRightRadius = rightestVal - canvas.width/2;
    }
    if (leftestVal != 1000 ) {
        userCircleLeftRadius = canvas.width/2 - leftestVal;
    }

    userTopBottom = []
    userLeftRight = []
}


function sketch(event){
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
    getPosition(event);

    // A line is traced from start
    // coordinate to this coordinate
    ctx.lineTo(coord.x , coord.y);

    const BUFFER = 15

    savedCoord = {x:coord.x , y:coord.y};
    userCircle.push(savedCoord);
    if (savedCoord.x < canvas.width/2 + BUFFER) {
        if (savedCoord.x > canvas.width/2 - BUFFER){
            userTopBottom.push(savedCoord);
        }
    }
    if (savedCoord.y < canvas.height/2 + BUFFER) {
        if (savedCoord.y > canvas.height/2 - BUFFER) {
            userLeftRight.push(savedCoord);
        }
    }

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
