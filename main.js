/*
 * Constant variables
 */
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
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

/**
 * Time signature and beat configuration. These are mostly constant but can be reconfigured.
 * If the value of any changes, the value of all should be updated
 */
Tone.Transport.timeSignature = [4, 4];
var NUM_BEATS = 4;
var LOOP_START_DELAY = ['0', '0.5', '1', '1.5'];
var SHAKE_AMOUNT = [40, 10, 20, 10];
var NOTES = ['A2', 'C5', 'C4', 'C5'];
var theta = [0, Math.PI/2, Math.PI, 3*Math.PI/2];

var loops = [];
for (let i = 0; i < NUM_BEATS; i++) {
    loops.push(new Tone.Loop(time => {
        beatVelocity[i] = 0.3;
    }, '1m'));
}

// Calculate tan/sin/cos of the values in theta in advance
var tanTheta = [];
for (let i = 0; i < theta.length; i++) {
    tanTheta.push(Math.tan(theta[i]));
}
var sinTheta = [];
for (let i = 0; i < theta.length; i++) {
    sinTheta.push(Math.sin(theta[i]));
}
var cosTheta = [];
for (let i = 0; i < theta.length; i++) {
    cosTheta.push(Math.cos(theta[i]));
}

/**
 * Animation variables
 */
var templateRadius = 220;
var userCircleRadius = new Array(NUM_BEATS).fill(templateRadius);
var beatDistance = new Array(NUM_BEATS).fill(0);
var beatVelocity = new Array(NUM_BEATS).fill(0);

var userCircle = [];
var shake = 0;
var lastTimeInFrame = 0
var elapsedTimeBetweenFrames = 1;
var coord = {x:0 , y:0};
var paint = false;

window.addEventListener('load', ()=>{
	resize(); // Resizes the canvas once the window loads
	window.addEventListener('resize', resize);

    const canvas = document.querySelector('#canvas');
    canvas.addEventListener("touchstart", startPaintingTouch, false);
    canvas.addEventListener("touchend", stopPainting, false);
    canvas.addEventListener("touchmove", sketchTouch, false);
    canvas.onmousedown = startPaintingMouse;
    canvas.onmouseup = stopPainting;
    canvas.onmousemove = sketchMouse;

    clearUserCircle();
    startAnimation();
});

function resize(){
    canvas.width = window.innerWidth-100;
    canvas.height = window.innerHeight-300;
    let limitingDim = Math.min(canvas.height, canvas.width);
    setRadius(Math.min(220, limitingDim / 2 - 40));

    stopAnimation();
}

function setSixEight() {
    Tone.Transport.stop();
    stopAnimation();

    Tone.Transport.timeSignature = [6, 4];
    NUM_BEATS = 6;
    LOOP_START_DELAY = ['0', '0.5', '1', '1.5', '2', '2.5'];
    SHAKE_AMOUNT = [40, 10, 10, 20, 10, 10];
    NOTES = ['A2', 'C5', 'C5', 'C4', 'C5', 'C5'];
    theta = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3];

    resetHelperVars();
}

function setFourFour() {
    Tone.Transport.stop();
    stopAnimation();

    Tone.Transport.timeSignature = [4, 4];
    NUM_BEATS = 4;
    LOOP_START_DELAY = ['0', '0.5', '1', '1.5'];
    SHAKE_AMOUNT = [40, 10, 20, 10];
    NOTES = ['A2', 'C5', 'C4', 'C5'];
    theta = [0, Math.PI/2, Math.PI, 3*Math.PI/2];

    resetHelperVars();
}

function toggleTimeSignature() {
    if (NUM_BEATS == 4) {
        document.querySelector('#settings').innerText = "Switch to 4/4";
        setSixEight();
    } else if (NUM_BEATS == 6) {
        document.querySelector('#settings').innerText = "Switch to 6/8";
        setFourFour();
    }
}

// called when changing time signature
function resetHelperVars() {
    loops = [];
    for (let i = 0; i < NUM_BEATS; i++) {
        loops.push(new Tone.Loop(time => {
            beatVelocity[i] = 0.3;
        }, '1m'));
    }

    // Calculate tan/sin/cos of the values in theta in advance
    tanTheta = [];
    for (let i = 0; i < theta.length; i++) {
        tanTheta.push(Math.tan(theta[i]));
    }
    sinTheta = [];
    for (let i = 0; i < theta.length; i++) {
        sinTheta.push(Math.sin(theta[i]));
    }
    cosTheta = [];
    for (let i = 0; i < theta.length; i++) {
        cosTheta.push(Math.cos(theta[i]));
    }

    userCircleRadius = new Array(NUM_BEATS).fill(templateRadius);
    beatDistance = new Array(NUM_BEATS).fill(0);
    beatVelocity = new Array(NUM_BEATS).fill(0);
}

function setRadius(rad) {
    console.log("setRadius called from resize");
    templateRadius = rad;
    userCircleRadius.fill(templateRadius);
}

function clearUserCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTemplateCircle(templateRadius);
    userCircle = []
}

function drawTemplateCircle(r) {
    ctx.fillStyle = '#0f4b55'
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2,4,4);

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ce2960'
    ctx.setLineDash([5, 8]);
    x = canvas.width/2;
    y = canvas.height/2;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, true);
    ctx.stroke();
}

function startAnimation() {
	console.log("START");
	document.getElementById("stopButton").style.display = "inline";
	document.getElementById("startButton").style.display = "none";

    Tone.Transport.start()
    for (let i = 0; i < loops.length; i++) {
        loops[i].start(LOOP_START_DELAY[i]);
    }
    Tone.start();
    animate();
    beatDistance.fill(0);
}

function stopAnimation() {
    console.log("STOP")
	document.getElementById("stopButton").style.display = "none";
	document.getElementById("startButton").style.display = "inline";

    Tone.Transport.stop()
    for (let i = 0; i < loops.length; i++) {
        loops[i].stop();
    }
}

function getPosition(i) {
    var pos = {x: canvas.width/2 - 2, y: canvas.height/2 - 2};
    pos.x += beatDistance[i] * sinTheta[i];
    pos.y -= beatDistance[i] * cosTheta[i];
    return pos;
}

function animate() {
    elapsedTimeBetweenFrames = Date.now() - lastTimeInFrame;
    lastTimeInFrame = Date.now();
    if (elapsedTimeBetweenFrames == 0) return;

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw beats
    for (let i = 0; i < NUM_BEATS; i++) {
        if (beatDistance[i] >= userCircleRadius[i]) {
            //console.log("COLLISION " + i);
            shake = SHAKE_AMOUNT[i];
            sampler.triggerAttackRelease(NOTES[i], Tone.context.currentTime);
            beatDistance[i] = 0;
            beatVelocity[i] = 0
        }
        ctx.beginPath();
        let pos = getPosition(i);
        ctx.fillRect(pos.x, pos.y, 4, 4);
        beatDistance[i] += beatVelocity[i] * (elapsedTimeBetweenFrames)
    }

    // draw template circle
    if (shake > 1.5) {
        drawTemplateCircle(templateRadius+shake);
        shake = Math.pow(shake, elapsedTimeBetweenFrames * 0.055);
    } else {
        drawTemplateCircle(templateRadius);
    }

    // draw user circle
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

function getPositionMouse(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
}

function getPositionTouch(event) {
    coord.x = event.touches[0].clientX - canvas.offsetLeft;
    coord.y = event.touches[0].clientY - canvas.offsetTop;
}

function startPaintingMouse(event) { startPainting(event, false); }
function startPaintingTouch(event) { startPainting(event, true); }
function startPainting(event, touch){
    paint = true;
    if (touch) {
        getPositionTouch(event);
    } else {
        getPositionMouse(event);
    }
    clearUserCircle()
    stopAnimation();
}

function setAB(point, xOffset, yOffset) {
    // convert x,y to a,b. This flips the y axis and centers it about the circle's origin
    point.a = point.x - xOffset
    point.b = yOffset - point.y;
}

function clamp(val, max, min) {
    return Math.min(Math.max(val, min), max);
}

function getAngle(a, b) {
    if (a > 0 && b > 0) {
        return Math.atan(a/b);
    }
    if (a > 0 && b < 0) {
        return Math.PI - Math.atan(a/(-1*b));
    }
    if (a < 0 && b < 0) {
        return Math.PI + Math.atan(a/b);
    }
    if (a < 0 && b > 0) {
        return 2*Math.PI - Math.atan((-1*a)/b)
    }
    if (a == 0 && b > 0) {
        return 0;
    }
    if (a == 0 && b < 0) {
        return Math.PI;
    }
    if (a > 0 && b == 0) {
        return Math.PI/2;
    }
    if (a < 0 && b == 0) {
        return 3*Math.PI/2;
    }
    if (a == 0 && b == 0) {
        console.log("Angle at (0, 0) is 0");
        // a point on the origin. by convention we will call this angle 0
        return 0;
    }
    console.error("Unable to find angle for a=" + a + " b=" + b);
    return 0;
}

function posATan(x) {
    let val = Math.atan(x);
    if (val < 0) {
        return 2*Math.PI + val;
    }
    return val;
}

function calculateUserCircleRadius() {
    userCircleRadius.fill(-1);

    for (let i = 1; i < userCircle.length; i++) {
        let point1 = userCircle[i-1];
        let point2 = userCircle[i];

        //     a
        //    ----
        //   |
        //   |
        // b |
        //   |
        //   |
        //   |
        //   . origin of the circle, located at (xOffset, yOffset)

        const xOffset = canvas.width/2 - 2;
        const yOffset = canvas.height/2 - 2;

        setAB(point1, xOffset, yOffset);
        setAB(point2, xOffset, yOffset);

        if (Math.sign(point1.a) != Math.sign(point2.a) && point1.b > 0 && point2.b > 0) {
            // passing angle 0
            if (theta[0] != 0) {
                if (theta.includes(0)) {
                    console.error("If theta includes 0, it should be in the first position.");
                    break;
                }
            }

            // calculate Y-intercept == radius
            let m = (point1.b - point2.b) / (point1.a - point2.a);
            let r = Math.abs(point1.b - m * point1.a);

            // if b is pos, this is beat 1. if b is neg, this is beat 3
            if (userCircleRadius[0] == -1) {
                //console.log("setting top radius first time R=" + R);
                userCircleRadius[0] = r;
            } else {
                //console.log("setting top radius as min R=" + R + " userCircleRadius=" + userCircleRadius[0]);
                userCircleRadius[0] = Math.min(userCircleRadius[0], r);
            }
        } else {
            for (let j = 0; j < theta.length; j++) {
                let angle1 = getAngle(point1.a, point1.b);
                let angle2 = getAngle(point2.a, point2.b);

                if ((angle1 < theta[j] && angle2 >= theta[j])
                        || (angle1 > theta[j] && angle2 <= theta[j])) {
                    // angle has passed theta 
                    let m = (point1.b - point2.b) / (point1.a - point2.a);
                    if (m > 0) {
                        m = clamp(m, 1000000, 0.000001);
                    } else {
                        m = clamp(m, -0.0000001, -1000000);
                    }
                    let A = math.matrix([[-1 / tanTheta[j], 1], [-1*m, 1]]);
                    let B = math.matrix([[0], [point1.b - (m*point1.a)]]);
                    let X = math.multiply(math.inv(A), B);
                    let r = Math.sqrt(Math.pow(X.get([0, 0]), 2) + Math.pow(X.get([1, 0]), 2));

                    //console.log('j=' + j);
                    //console.log("point1=" + point1.a + ',' + point1.b);
                    //console.log("point2=" + point2.a + ',' + point2.b);
                    //console.log("m=" + m);
                    //console.log("A=" + A);
                    //console.log("B=" + B);
                    //console.log("X=" + X);
                    //console.log("r=" + r);

                    // set user circle radius to the closest radius so far
                    if (userCircleRadius[j] == -1) {
                        userCircleRadius[j] = r;
                    } else {
                        userCircleRadius[j] = Math.min(userCircleRadius[j], r);
                    }
                }
            }
        }
    }

    for (let i = 0; i < userCircleRadius.length; i++) {
        if (userCircleRadius[i] == -1) {
            userCircleRadius[i] = templateRadius;
        }
    }
}

function stopPainting(){
    calculateUserCircleRadius();
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
    ctx.lineCap = 'round';

    ctx.moveTo(coord.x, coord.y);
    if (touch) {
        getPositionTouch(event);
    } else {
        getPositionMouse(event);
    }
    ctx.lineTo(coord.x , coord.y);
    ctx.stroke();

    let savedCoord = {x:coord.x , y:coord.y};
    userCircle.push(savedCoord);
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
