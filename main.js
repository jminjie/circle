const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

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
}

var templateRadius = 220;

var userCircleRadius = [templateRadius, templateRadius, templateRadius, templateRadius];
var userCircle = [];

function setRadius(rad) {
    console.log("setRadius called from resize");
    templateRadius = rad;
    userCircleRadius = [templateRadius, templateRadius, templateRadius, templateRadius];
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

var beatDistance = [0, 0, 0, 0];
var beatVelocity = [0, 0, 0, 0];

function startAnimation() {
	console.log("START");
	document.getElementById("stopButton").style.display = "inline";
	document.getElementById("startButton").style.display = "none";

    Tone.Transport.start()
    for (let i = 0; i < 4; i++) {
        loops[i].start(LOOP_START_DELAY[i]);
    }
    Tone.start();
    animate();
    beatDistance = [0, 0, 0, 0];
}

function stopAnimation() {
    console.log("STOP")
	document.getElementById("stopButton").style.display = "none";
	document.getElementById("startButton").style.display = "inline";

    Tone.Transport.stop()
    for (let i = 0; i < 4; i++) {
        loops[i].stop();
    }
}

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

const LOOP_START_DELAY = ['0', '4n', '2n', '2n.'];

var loops = [];
for (let i = 0; i < 4; i++) {
    loops.push(new Tone.Loop(time => {
        beatVelocity[i] = 0.3;
    }, '1m'));

}

var shake = 0;
var lastTime = 0
var elapsedTime = 1;

const SHAKE_AMOUNT = [40, 10, 20, 10];
const NOTES = ['A2', 'C5', 'C4', 'C5'];

function getPosition(i) {
    var pos = {x: canvas.width/2 - 2, y: canvas.height/2 - 2};
    if (i == 0) {
        pos.y -= beatDistance[i];
        return pos;
    }
    if (i == 1) {
        pos.x += beatDistance[i];
        return pos;
    }
    if (i == 2) {
        pos.y += beatDistance[i];
        return pos;
    }
    if (i == 3) {
        pos.x -= beatDistance[i];
        return pos;
    }
}

function animate() {
    elapsedTime = Date.now() - lastTime;
    lastTime = Date.now();
    if (elapsedTime == 0) return;

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw beats
    for (let i = 0; i < 4; i++) {
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
        beatDistance[i] += beatVelocity[i] * (elapsedTime)
    }

    // draw template circle
    if (shake > 1.5) {
        drawTemplateCircle(templateRadius+shake);
        shake = Math.pow(shake, elapsedTime * 0.055);
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

var coord = {x:0 , y:0};
var paint = false;

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
    clearUserCircle()
    stopAnimation();
}

function setAB(point, xOffset, yOffset) {
    // convert x,y to a,b. This flips the y axis and centers it about the circle's origin
    point.a = point.x - xOffset
    point.b = yOffset - point.y;
}


//var THETA = [Math.PI/3, 2*Math.PI/3, Math.PI/2, Math.PI, 3*Math.PI/2];
var theta = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
var tanTheta = [];
for (let i = 0; i < theta.length; i++) {
    tanTheta.push(Math.tan(theta[i]));
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
    userCircleRadius = [-1, -1, -1, -1];

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

    for (let i = 0; i < 4; i++) {
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
