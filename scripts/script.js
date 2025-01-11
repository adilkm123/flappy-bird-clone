//board

let board;
let boardHeight=640;
let boardWidth= 360;
let context;

let birdHeight = 24;
let birdWidth = 34;

let birdX = boardWidth/8;
let birdY = boardHeight/2;

let birdImg;

let score = 0;

let bird = {
  x : birdX,
  y : birdY,
  width : birdWidth,
  height : birdHeight
}
// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

//physics 
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4

let gameOver = false;

let topPipeImg;
let bottomPipeImg;

let bgm = new Audio('/sound_fx/background-music.m4a');
bgm.loop = true;
let hitSound = new Audio('/sound_fx/sfx_hit.wav');
let wingSound = new Audio('/sound_fx/sfx_wing.wav');
let pointSound = new Audio('/sound_fx/sfx_point.wav');

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    
    
  /*  
    context.fillStyle = "green";
    context.fillRect(bird.x, bird.y, bird.width, bird.height)
    */
    
    
    birdImg = new Image();
    birdImg.src = '/images/flappybird.png';
    
    birdImg.onload = function() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    
    topPipeImg = new Image();
    topPipeImg.src = '/images/toppipe.png';
    
    bottomPipeImg = new Image();
    bottomPipeImg.src = '/images/bottompipe.png';
    
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    
    document.addEventListener("click",moveBird);
    document.getElementById("div").addEventListener("click",moveBird);
}

function update() {
  requestAnimationFrame(update);
  if(gameOver){
    return;
  }
  context.clearRect(0,0, board.width, board.height);
  
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY ,0);//either gravity velocity or at the top of the canvas (to limit the jumping height)
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
  
  if(bird.y > board.height){
    gameOver = true;
  }
  
  for(let i = 0; i < pipeArray.length; i++){
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    
    if(!pipe.passed && bird.x > pipe.x + pipe.width){
      pointSound.play();
      score += 0.5;// bevy its checking for the top and bottom pipes, so 0.5 + 0.5 = 1
      pipe.passed = true;
    }
    
    if(detectCollision(bird, pipe)){
      gameOver = true;
    }
  }
  
  while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
    pipeArray.shift();
  }
 
  
  if(gameOver){
    context.fillText("Game over", 75, boardHeight/2);
    hitSound.play();
    bgm.pause();
    bgm.currentTime = 0
  }
 
 
  context.fillStyle = "yellow";
  context.font = "45px san-serif";
  context.fillText(score, 5 , 45);
  
}
  
function placePipes(){
  if(gameOver){
    return;
  }
  let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
  let openingSpace = board.height/4;
  
  let topPipe = {
    img : topPipeImg,
    x : pipeX,
    y : randomPipeY,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
  }
  pipeArray.push(topPipe);
  
  let bottomPipe = {
    img : bottomPipeImg,
    x : pipeX,
    y : randomPipeY + pipeHeight + openingSpace,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
  }
  pipeArray.push(bottomPipe);
}

function moveBird(e){
  
  if(bgm.paused){
    bgm.play();
  }
  
  wingSound.play();
  velocityY = -6;
  
  if(gameOver){
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    
  }
}

function detectCollision(a,b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
  
}