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

function animate() {
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Date.now() - lastTime;
    lastTime = Date.now();
    if (elapsedTime == 0) return;

    // handle beat 1
    if (beatDistance[0] >= userCircleRadius[0]) {
        //console.log("COLLISION 1");
        shake = SHAKE_AMOUNT[0];
        sampler.triggerAttackRelease(NOTES[0], Tone.context.currentTime);
        beatDistance[0] = 0;
        beatVelocity[0] = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 - beatDistance[0],4,4);
    beatDistance[0] += beatVelocity[0] * (elapsedTime)

    // handle beat 2
    if (beatDistance[1] >= userCircleRadius[1]) {
        //console.log("COLLISION 2");
        shake = SHAKE_AMOUNT[1];
        sampler.triggerAttackRelease(NOTES[1], Tone.context.currentTime);
        beatDistance[1] = 0;
        beatVelocity[1] = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2 + beatDistance[1],canvas.height/2-2,4,4);
    beatDistance[1] += beatVelocity[1] * (elapsedTime)

    // handle beat 3
    if (beatDistance[2] >= userCircleRadius[2]) {
        //console.log("COLLISION 3");
        shake = SHAKE_AMOUNT[2];
        sampler.triggerAttackRelease(NOTES[2], Tone.context.currentTime);
        beatDistance[2] = 0;
        beatVelocity[2] = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2,canvas.height/2-2 + beatDistance[2],4,4);
    beatDistance[2] += beatVelocity[2] * (elapsedTime)

    // handle beat 4
    if (beatDistance[3] >= userCircleRadius[3]) {
        //console.log("COLLISION 4");
        shake = SHAKE_AMOUNT[3];
        sampler.triggerAttackRelease(NOTES[3], Tone.context.currentTime);
        beatDistance[3] = 0;
        beatVelocity[3] = 0
    }
    ctx.beginPath();
    ctx.fillRect(canvas.width/2-2 - beatDistance[3],canvas.height/2-2,4,4);
    beatDistance[3] += beatVelocity[3] * (elapsedTime)

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

function stopPainting(){
    console.log("stopPainting, calculating user circle radius");
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

        const xOffset = canvas.width/2;
        const yOffset = canvas.height/2;
        if (Math.sign(point1.x - xOffset) != Math.sign(point2.x - xOffset)) {
            // 'a' has changed signs, meaning
            // we have crossed the vertical axis of the circle

            setAB(point1, xOffset, yOffset);
            setAB(point2, xOffset, yOffset);

            // calculate Y-intercept == radius
            M = (point1.b - point2.b) / (point1.a - point2.a);
            R = Math.abs(point1.b - M * point1.a);

            // if b is pos, this is beat 1. if b is neg, this is beat 3
            if (point1.b > 0) {
                if (userCircleRadius[0] == -1) {
                    console.log("setting top radius first time R=" + R);
                    userCircleRadius[0] = R;
                } else {
                    console.log("setting top radius as min R=" + R + "userCircleRadius=" + userCircleRadius[0]);
                    userCircleRadius[0] = Math.min(userCircleRadius[0], R);
                }
            } else if (point1.b < 0) {
                console.log("setting bottom radius R=" + R);
                if (userCircleRadius[2] == -1) {
                    userCircleRadius[2] = R;
                } else {
                    userCircleRadius[2] = Math.min(userCircleRadius[2], R);
                }
            }
        }
        if (Math.sign(yOffset - point1.y) != Math.sign(yOffset - point2.y)) {
            // 'b' has changed signs, meaning
            // we have crossed the horizontal axis of the circle

            setAB(point1, xOffset, yOffset);
            setAB(point2, xOffset, yOffset);

            // calculate X-intercept == radius
            N = (point1.a - point2.a) / (point1.b - point2.b);
            R = Math.abs(point1.a - N * point1.b);

            // if a is pos, this is beat 2. if a is neg, this is beat 4
            if (point1.a > 0) {
                console.log("setting right radius R=" + R);
                if (userCircleRadius[1] == -1) {
                    userCircleRadius[1] = R;
                } else {
                    userCircleRadius[1] = Math.min(userCircleRadius[1], R);
                }
            } else if (point1.a < 0) {
                console.log("setting left radius R=" + R);
                if (userCircleRadius[3] == -1) {
                    userCircleRadius[3] = R;
                } else {
                    userCircleRadius[3] = Math.min(userCircleRadius[3], R);
                }
            }
        }
    }

    for (let i = 0; i < 4; i++) {
        if (userCircleRadius[i] == -1) {
            console.log("No radius " + i + ", using default");
            userCircleRadius[i] = templateRadius;
        }
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
