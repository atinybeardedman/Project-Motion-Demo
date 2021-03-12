const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const resetButton = document.querySelector('#reset');
const trailCheckbox = document.querySelector('#showTrail');

canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointermove', handlePointerMove);
resetButton.addEventListener('click', reset);
trailCheckbox.addEventListener('input', toggleTrail);

// set up for the ball
const startPosition = {
    x: 100,
    y: 400,
    vx: 0,
    vy: 0
};

let ball = {
   ...startPosition,
    radius: 10,
    color: 'black'
};

const release = {
    x: 0,
    y: 0,
    vy: 0
};

// acceleration of "gravity", due to scale needs to be larger than earth's
const a = 50;

// check if we're currently dragging
let isDown = false;

// track the time elapsed
let animationStart;

// helpers for the trail
let showTrail = false;
let isMoving = false;
let points = [];
 
const background = 'lightgray';

// drawing functions

function clearCanvas(){
    ctx.clearRect(0,0,500,500);
    ctx.fillStyle = background;
    ctx.fillRect(0,0,500,500);
}

function drawBall(){
    clearCanvas();
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

function drawTrail(){
    if(points.length > 0){
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const first = points[0];
        ctx.moveTo(first.x, first.y);
        for(const point of points){
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.closePath();
    }
}

function drawVector(start, end){
    // arrow body
    ctx.strokeStyle = 'red';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
    
    // arrow head
    const transformMatrix = ctx.getTransform();
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.translate(end.x, end.y);
    ctx.rotate(angle);
    ctx.beginPath()
    ctx.moveTo(-5, -5);
    ctx.lineTo(0,0);
    ctx.lineTo(-5,5);
    ctx.stroke()
    ctx.closePath();
    ctx.setTransform(transformMatrix);

}

// animation loop

function runAnimation(timestamp){
    if(!animationStart){
        animationStart = timestamp;
    }

    const dt = (timestamp - animationStart) / 1000;

    ball.x = release.x + ball.vx * dt;
    ball.y = release.y + ball.vy * dt + 0.5 * a * dt * dt;

    ball.vy = release.vy + a * dt; // no need for vx unless adding drag
    
    points.push({x: ball.x, y: ball.y});

    drawBall();

    if(showTrail){
        drawTrail()
    }

    if(ball.x + ball.radius > 500 || ball.y + ball.radius > 500){
        // I didn't address the edge case here regarding if you pull it off screen to begin with
        isMoving = false;
        return
    }

    requestAnimationFrame(runAnimation)
}

// ui bound functions

function toggleTrail(event){
    showTrail = event.target.checked;
    if(!isMoving){
        drawBall();
        if(showTrail){
            drawTrail();
        }
    }
}

function reset(){
    ball = {...ball, ...startPosition};
    drawBall();
    animationStart = null;
    points = [];
}

function getDistance(pointa, pointb) {
    return Math.sqrt(
        Math.pow(pointa.x - pointb.x, 2) + Math.pow(pointa.y - pointb.y, 2)
    )
}

function handlePointerDown(event){
    const clickPoint = {
        x: event.offsetX, 
        y: event.offsetY
    };
    const distance = getDistance(clickPoint, ball);
    if(distance <= ball.radius){
        isDown = true;
    } else {
        isDown = false;
    }
}

function handlePointerMove(event){
    if(isDown){
        ball.x = event.offsetX;
        ball.y = event.offsetY;
        drawBall();
        drawVector(ball, startPosition);
    }
}

function handlePointerUp(event){
    if(isDown){
        // Scaling these velocities to allow the ball to move faster
        ball.vx =  5 * (startPosition.x - ball.x);
        ball.vy =  5 * (startPosition.y - ball.y); 

        isDown = false;
        isMoving = true;

        release.x = ball.x;
        release.y = ball.y;
        release.vy = ball.vy;

        runAnimation();
    }

}


drawBall();