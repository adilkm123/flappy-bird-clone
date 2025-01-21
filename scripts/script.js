//board
let board;

let boardHeight = 640;
let boardWidth = 360;


//let boardWidth = window.innerWidth;
//let boardHeight = window.innerHeight;

let context;

//bird
let birdHeight = 24;
let birdWidth = 34;

let birdX = boardWidth/8;
let birdY = boardHeight/2;

let birdImg;
//bird object for easy access 
let bird = {
  x : birdX,
  y : birdY,
  width : birdWidth,
  height : birdHeight
}

//initialise score 
let score = 0;
let highScore = 0;


// pipes
let pipeArray = [];//to store the pipes
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics 
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4

let gameOver = false;


//sound effects 
let bgm = new Audio('/sound_fx/background-music.m4a');
bgm.loop = true;
let hitSound = new Audio('/sound_fx/sfx_hit.wav');
let wingSound = new Audio('/sound_fx/sfx_wing.wav');
let pointSound = new Audio('/sound_fx/sfx_point.wav');

//on game loaded 
window.onload = function() {
  
  highScore = parseInt(localStorage.getItem("highScore")) || 0;
  //get the canvas 
  board = document.getElementById("board");
  //setting dimensions 
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");
  
  
  //loading bird image 
  birdImg = new Image();
  birdImg.src = '/images/flappybird.png';
  
  
  //drawing bird on the canvas on image loaded
  birdImg.onload = function() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  }
  
  //loading top pipe image
  topPipeImg = new Image();
  topPipeImg.src = '/images/toppipe.png';
  //loading bottom pipe image
  bottomPipeImg = new Image();
  bottomPipeImg.src = '/images/bottompipe.png';
  
  //to make animation on browser 
  requestAnimationFrame(update);
  
  //place pipes on every 1.5 seconds
  setInterval(placePipes, 1500);
  
  //make the bird jump when clicking on the screen 
  document.addEventListener("click",moveBird);
  document.addEventListener("keypress",moveBird);
}


//animation frames
function update() {
  //to make animation on browser 
  requestAnimationFrame(update);
  

  //stops the game when game over 
  if(gameOver){
    return;
  }
  
  //clear the screen before drawing next frame 
  context.clearRect(0,0, board.width, board.height);
  
  //making the bird falls by increasing the gravity 
  velocityY += gravity;
  
  //to limit the jumping height by setting limit on y axis 
  bird.y = Math.max(bird.y + velocityY ,0);//either gravity velocity or at the top of the canvas
  
  //drawing the bird on the canvas 
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
  
  //game over when the bird's position is less than the height of the canvas, ie. game over when bird falls down to the bottom 
  if(bird.y > board.height){
    gameOver = true;
  }
  
  //for inserting new pipes
  for(let i = 0; i < pipeArray.length; i++){
    let pipe = pipeArray[i];
    
    //to move the pipes from right to left
    pipe.x += velocityX;
    
    //drawing the pipes on the canvas 
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    
    //to check if bird passed pipe
    if(!pipe.passed && bird.x > pipe.x + pipe.width){
      pointSound.play();
      //updating score 
      score += 0.5;// because its checking for the top and bottom pipes, so 0.5 + 0.5 = 1
      
      pipe.passed = true;
    }
    
    //game over when brid collide with the pipe
    if(detectCollision(bird, pipe)){
      
      gameOver = true;
    }
  }
  
  //removing pipes when the pipes are moved out of the screen to minimise the memory
  while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
    pipeArray.shift();
  }
 
  
  if(gameOver){
    //Game over text when game over is true 
    context.fillText("Game over", 75,boardHeight/2);
    
    //play sound effect, pause the background music and reset the music timeline to the beginning 
    hitSound.play();
    bgm.pause();
    bgm.currentTime = 0
  }
 
 //initialising the text styles
  context.fillStyle = "yellow";
  context.font = "45px san-serif";
  
  //score text position 
  context.fillText(score, 5 , 45);
  context.fillText(highScore,5, 95);
  
}
  
  
// to place the pipes in the camvas
function placePipes(){
  //stop adding pipes when game over 
  if(gameOver){
    return;
  }
  //to randomise the pipe y axis 
  let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
  
  //setting the opening space between yop amd bottom pipe
  let openingSpace = board.height/4;
  
  //object for top pipe
  let topPipe = {
    img : topPipeImg,
    x : pipeX,
    y : randomPipeY,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
  }
  pipeArray.push(topPipe);//adding top pipe to the pipe array
  
  //object for bottom pipe
  let bottomPipe = {
    img : bottomPipeImg,
    x : pipeX,
    y : randomPipeY + pipeHeight + openingSpace,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
  }
  pipeArray.push(bottomPipe);//adding bottom pipe to the pipe array
}


//to jump the bird
function moveBird(e){
  
  //play background music when restart the game by jumping 
  if(bgm.paused){
    bgm.play();
  }
  //sound effects for clicking 
  wingSound.play();
  
  //to make the bird falls back when jump
  velocityY = -6;
  
  //resetting the properties when game over 
  if(gameOver){
    
      //local storage for high score 
      
      
     if(score>highScore){
       localStorage.setItem("highScore", score);
       highScore = score;
     }
  
    
    bird.y = birdY//reset the birds position 
    pipeArray = [];//clear the pipes stored
    score = 0;//reset score
    gameOver = false;
    
  }
}

//for checking collision of bird with pipes
function detectCollision(a,b) {
  
  
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}