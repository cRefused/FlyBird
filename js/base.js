var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// состояние игры
var game = {};
game.state = false;
game.stepScoreDefault = 15; // приращение очков для смены уровня 
game.stageDefault = 1; // уровень (начальное значение)

// состояние кнопок
var key = {};
key.right = false;
key.left = false;
key.up = false;
key.down = false;

// сообщения
var msg = {};
msg.gameTitle = '<span style="color: #777">FlyBird</span>'; 
msg.gameOver = '<span style="color: red">GAME OVER</span>'; 
msg.newGame = 'Нажмите "Пробел", чтобы начать игру';
msg.control = 'Управление уткой: клавиши "Вверх", "Вниз"';


var bg = {}; // для фона
var beam = {}; // для брёвен
var bird = {}; // для утки

beam.emptySpaceDefault = Math.floor(canvas.height/3); // начальное окно для утки

// координаты фона
bg.x1 = 0;
bg.x2 = 0;

// спрайты
bg.img = new Image();
beam.img = new Image();
bird.img = new Image();

// Старт игры
function startGame(){
  bg.img.src = './img/background.jpg'; // спрайт фона
  beam.img.src = './img/beam.png'; // спрайт бревен
  bird.img.src = './img/bird.png'; // спрайт утки

  // координаты спрайта утки
  bird.srcX = 0; 
  bird.srcY = 0; 
  bird.srcWidth = 200; 
  bird.srcHeight = 144; 

  // анимация махания
  bird.qlFrames = 4; // кадров утки в строке спрайта
  bird.lineFrames = 2; // строк с кадрами утки
  bird.allFrames = bird.qlFrames * bird.lineFrames; // кадров в спрайте утки (всего)
  bird.currentFrame = 1; // начальный кадр
  bird.speedFrame = 0.7; // скорость смены кадра

  // размер утки
  bird.height = Math.floor(canvas.height/15);
  bird.width = Math.floor(bird.height*1.5);

  // количество бревен
  beam.max = 3;

  // высота и ширина бревен
  beam.height = canvas.height;
  beam.widthDefault = Math.floor(canvas.width/15);
  beam.width = [];

  // координаты брёвен
  beam.x = [];
  beam.yDown = [];
  beam.yUp =  []; 

  // скорость
  beam.speedDefault = 4; 
  beam.speedFactor = 1; 
  beam.speed = beam.speedDefault; 
  bg.speed = beam.speed;
  bg.dx = 3; // дельта скорости фона относительно переднего плана (чем больше значение, тем медленнее)

  beam.emptySpace = beam.emptySpaceDefault; // окно для утки
  beam.emptySpaceDx = 0.5; // дельта уменьшения окна с каждым уровнем

  // координаты появления утки
  bird.x =  Math.floor(bird.width + canvas.height/7);
  bird.y =  Math.floor(bird.width + canvas.height/7);

  // дельта смещения утки
  bird.dx = 10; // смещение влево/вправо при нажатии
  bird.dyUpDown = 12; // смещение вверх/вниз при нажатии
  bird.dyDownPermanent = 0; // постоянное падение

  game.stage = game.stageDefault; // уровень
  game.score = 0; // очки
  game.travelDistance = 0; // пройденное расстояние
  game.stepScore = game.stepScoreDefault; // приращение очков для смены уровня

  clearMsg();
  initBeam();
  showScore();
  startTimer();
}

// рисование фона
function drawBg(i){
  bg.speed = beam.speed - bg.dx;
  bg.speed = (bg.speed < 0 ? 0 : bg.speed);

  bg.x1 -= bg.speed;
  bg.x2 -= bg.speed;

  if(bg.x1 < 0){
    bg.x2 = bg.x1 + canvas.width;
  } 
  if(bg.x2 < 0){
    bg.x1 = bg.x2 + canvas.width;
  }
  bg.img.onload = ctx.drawImage(bg.img, 0, 0, bg.img.width, bg.img.height, bg.x1, 0, canvas.width, canvas.height);
  bg.img.onload = ctx.drawImage(bg.img, 0, 0, bg.img.width, bg.img.height, bg.x2, 0, canvas.width, canvas.height);
}

// инициализация первых брёвен
function initBeam() {
  for(var i = 0; i < beam.max; i++){
    beam.width[i] = beam.widthDefault;
    if(i == 0){
      beam.x[i] = (canvas.width + beam.width[i]); 
    } else {
      beam.prev = i - 1;
      beam.x[i] = Math.floor(Math.random() * ((beam.x[beam.prev] + (canvas.width/1.5)) - (beam.x[beam.prev] + (canvas.width/3))) + (beam.x[beam.prev] + (canvas.width/3))); 
    } 
    beam.yDown[i] = Math.floor(Math.random() * ((beam.height - beam.height/15) - (beam.emptySpace+beam.height/15)) + (beam.emptySpace+beam.height/15));
    beam.yUp[i] =  Math.floor(beam.yDown[i] - (beam.height + beam.emptySpace));
  }
}

// рисование брёвен
function drawBeam(i) {
  beam.x[i] -= beam.speed;
  beam.prev = ((i == 0) ? (beam.max - 1) : (i - 1))
 
  if(beam.x[i] < -(beam.width[i] * 1.5)){
    beam.x[i] = Math.floor(Math.random() * ((beam.x[beam.prev] + (canvas.width/1.5)) - (beam.x[beam.prev] + (canvas.width/3))) + (beam.x[beam.prev] + (canvas.width/3))); 
    beam.yDown[i] = Math.floor(Math.random() * ((beam.height - beam.height/15) - (beam.emptySpace+beam.height/15)) + (beam.emptySpace+beam.height/15));
    beam.yUp[i] =  Math.floor(beam.yDown[i] - (beam.height + beam.emptySpace));
  
    game.score++;
    beam.emptySpace = beam.emptySpaceDefault - game.score * beam.emptySpaceDx;
    showScore();
  }
  beam.img.onload = ctx.drawImage(beam.img, 0, 0, beam.img.width, beam.img.height, beam.x[i], beam.yUp[i], beam.width[i], beam.height);
  beam.img.onload = ctx.drawImage(beam.img, 0, 0, beam.img.width, beam.img.height, beam.x[i], beam.yDown[i], beam.width[i], beam.height);
}

// рисование утки
function drawBird() {
  // при пройгрыше рисуем конкретный спрайт, в ином случае идет анимация махания
  if(game.state == false){
    bird.img.onload = ctx.drawImage(bird.img, bird.srcX, bird.srcY, bird.srcWidth, bird.srcHeight, bird.x, bird.y, bird.width, bird.height);
  } else {
    bird.animSrcX = (Math.floor(bird.currentFrame/bird.lineFrames) * bird.srcWidth) + bird.srcX; // координаты спрайта по X
    bird.currentFrameY = (Math.ceil(bird.currentFrame/bird.qlFrames) > 0 ? Math.ceil(bird.currentFrame/4) : 1); 
    bird.animSrcY = ((bird.currentFrameY - 1) * bird.srcHeight) + bird.srcY; // координаты спрайта по Y
    bird.img.onload = ctx.drawImage(bird.img, bird.animSrcX, bird.animSrcY, bird.srcWidth, bird.srcHeight, bird.x, bird.y, bird.width, bird.height);
    bird.currentFrame = (bird.currentFrame + bird.speedFrame) % bird.allFrames;
  }
}

// определение коллизии утки спрепятствием
function birdCollision(i){ 
  if(((bird.x + bird.width) > (beam.x[i]+(beam.width[i]/5))) && (bird.x < ((beam.x[i]-(beam.width[i]/5)) + beam.width[i]))){
    if(((bird.y + bird.height/2) < (beam.yUp[i] + beam.height)) || ((bird.y + bird.height/2) > (beam.yDown[i]))){
      game.state = false;
      bird.srcX = 0; 
      bird.srcY = 298; 
      bird.srcHeight = 199; 
      endGame(msg.gameOver, msg.newGame);
      return;
    }
  } else if(bird.y > canvas.height - bird.height*1.5){
    game.state = false;
    bird.srcX = 0; 
    bird.srcY = 298; 
    bird.srcHeight = 120; 
    endGame(msg.gameOver, msg.newGame);
    return;
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBg();

  for(var i = 0; i < beam.max; i++){
    drawBeam(i);
    birdCollision(i);
  }
  drawBird();

  if(key.right && bird.x < canvas.width - bird.width) {
    bird.x += bird.dx;
  }
  else if(key.left && bird.x > 0) {
    bird.x -= bird.dx;
  }
  else if(key.down && bird.y < canvas.height - bird.width) {
    bird.y += bird.dyUpDown + game.stage;
  }
  else if(key.up && bird.y > 0) {
    bird.y -= bird.dyUpDown + game.stage;
  } else {
    bird.y += bird.dyDownPermanent;
  }
}
  

// слушаем события нажатия на клафиши
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// функция, вызываемая при нажатии клавиши
function keyDownHandler(e) {
    if(e.keyCode == 39) {
        key.right = true;
    }
    else if(e.keyCode == 37) {
        key.left = true;
    }
    else if(e.keyCode == 38) {
        key.up = true;
    }
    else if(e.keyCode == 40) {
        key.down = true;
    } 
    else if(e.keyCode == 32 && game.state == false){
      game.state = true;
      startGame();
    }
}

// функция, вызываемая при отпускании клавиши
function keyUpHandler(e) {
  if(e.keyCode == 39) {
      key.right = false;
  }
  else if(e.keyCode == 37) {
      key.left = false;
  }
  else if(e.keyCode == 38) {
      key.up = false;
  }
  else if(e.keyCode == 40) {
      key.down = false;
  }
}

// функция показа очков и смены уровня
function showScore(){
  game.stage = ((Math.floor(game.score/game.stepScore) == 0) ? 1 : Math.floor(game.score/game.stepScore));
  beam.speed = beam.speedDefault + (game.stage * beam.speedFactor);
  game.travelDistance = game.score * 50;
  beam.showSpeed = (100 / interval) * beam.speed;
  if(game.travelDistance > 1000){
    game.travelDistance = game.travelDistance/1000;
    document.getElementById('score').innerHTML= game.travelDistance+' км';
  } else {
    document.getElementById('score').innerHTML= game.travelDistance+' м';
  }
  document.getElementById('stage').innerHTML=game.stage;
  document.getElementById('speed').innerHTML=beam.showSpeed+' м/с';
}

// если проиграли, останавливаем игру, выводим сообщение
function endGame(msg1, msg2){
  document.getElementById('textbox1').innerHTML=msg1;
  document.getElementById('textbox2').innerHTML=msg2;
  document.getElementById('textbox3').innerHTML=msg.control;
  //setTimeout(function(){clearInterval(timer);}, timer);
  clearInterval(timer);
  document.getElementById('textbox_main').classList.remove("hide_elem");
}

function clearMsg(){
  document.getElementById('textbox1').innerHTML="";
  document.getElementById('textbox2').innerHTML="";
  document.getElementById('textbox3').innerHTML="";
  document.getElementById('textbox_main').classList.add("hide_elem");
  document.getElementById('window_score').classList.remove("hide_elem");
}

// Дергаем ф-цию draw() каждые "interval" мс
var timer, interval = 25;
function startTimer(){
  timer = setInterval(draw, interval); 
}

document.getElementById('textbox1').innerHTML=msg.gameTitle;
document.getElementById('textbox2').innerHTML=msg.newGame;
document.getElementById('textbox3').innerHTML=msg.control;

