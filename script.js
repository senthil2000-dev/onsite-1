const currentTool=getel('current-tool');
const brushColorBtn = getel('brush-color');
const brushIcon = getel('brush');
const lineWidth = getel('brush-size');
const slidebar = getel('brush-slider');
const bgColorBtn = getel('background-color');
const eraser = getel('eraser');
const cleanCanvasBtn = getel('clear');
const saveStorageBtn = getel('saveLocalstorage');
const loadButton = getel('loadFromLocal');
const cleanButton = getel('cleanStorage');
const jpegButton = getel('download');
const rectangle = getel('rectangle');
const circle = getel('circle');
const ellipse = getel('ellipse');
const { body } = document;
function getel(id) {
  return document.getElementById(id);
}
var shapeMode=false;
var item;
var img, sX,sY,mX,mY;

const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let currentSize = 10;
let bgColor = '#FFFFFF';
let drawColor = '#A51DAB';
let eraseMode = false;
let mDown = false;
let redrawArray = [];
var shapeArray=[];

function displayLineWidth() {
  if (slidebar.value < 10) {
    lineWidth.textContent = `0${slidebar.value}`;
  } else {
    lineWidth.textContent = slidebar.value;
  }
}

slidebar.addEventListener('change', () => {
  currentSize = slidebar.value;
  displayLineWidth();
});

brushColorBtn.addEventListener('input', () => {
  eraseMode = false;
  drawColor = brushColorBtn.value;
  currentTool.click();
});

bgColorBtn.addEventListener('input', () => {
  bgColor = bgColorBtn.value;
  initCanvas();
  changeBackgroundUtility();
  currentTool.click();
});

eraser.addEventListener('click', () => {
  eraseMode = true;
  shapeMode=false;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  currentTool.textContent = 'Eraser';
  drawColor = bgColor;
  currentSize = 50;
});

function brushTool() {
  eraseMode = false;
  shapeMode=false;
  currentTool.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  drawColor = brushColorBtn.value;
  currentSize = 10;
  slidebar.value = 10;
  displayLineWidth();
}

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  brushTool();
}

cleanCanvasBtn.addEventListener('click', () => {
  initCanvas();
  redrawArray = [];
  currentTool.textContent = 'Canvas Cleared';
  setTimeout(brushTool, 1500);
});

function changeBackgroundUtility() {
  var j=0;
  for (let i = 1; i < redrawArray.length; i++) {
    if(redrawArray[i]=="flag") {
      var obj=shapeArray[j];
      sX=obj.sX;
      sY=obj.sY;
      mX=obj.mX;
      mY=obj.mY;
      item=obj.item;
      draw();
      j++;
      shapeMode=false;
    }
    else {
    context.beginPath();
    context.moveTo(redrawArray[i - 1].x, redrawArray[i - 1].y);
    context.lineWidth = redrawArray[i].size;
    context.lineCap = 'round';
    console.log(redrawArray);
    if (redrawArray[i].erase) {
      console.log('yes');
      context.strokeStyle = bgColor;
    } else {
      context.strokeStyle = redrawArray[i].color;
    }
    context.lineTo(redrawArray[i].x, redrawArray[i].y);
    context.stroke();
    }
  }
}

function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  redrawArray.push(line);
}

function getClientCoord(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

canvas.addEventListener('mousedown', (event) => {
  const currPos = getClientCoord(event);
  mDown = true;
  if(shapeMode) {
    console.log(1);
    sX=currPos.x;
    sY=currPos.y;
    img=context.getImageData(0,0,canvas.width, canvas.height);
  }
  else {
  context.moveTo(currPos.x, currPos.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = drawColor;
  }
});

canvas.addEventListener('mousemove', (event) => {
  console.log(11);
  const currPos = getClientCoord(event);
  if (mDown) {console.log(shapeMode+"1");
    if(shapeMode) {
      console.log(3);
      mX=currPos.x;
      mY=currPos.y;
      context.putImageData(img, 0, 0);
      draw();
    }
    else {
      context.lineTo(currPos.x, currPos.y);
      context.stroke();
      console.log(eraseMode);
      storeDrawn(
        currPos.x,
        currPos.y,
        currentSize,
        drawColor,
        eraseMode,
      );
    }
    
  } else {
    storeDrawn(undefined);
  }
});

canvas.addEventListener('mouseup', () => {
  if(shapeMode) {
    redrawArray.push("flag");
    console.log(redrawArray);
    const shape = {
      item,
      sX,
      sY,
      mX,
      mY
    };
    shapeArray.push(shape);
  }
  mDown = false;
});

saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('savedCanvas', JSON.stringify(redrawArray));
  currentTool.textContent = 'Saved now';
  setTimeout(brushTool, 1500);
});


loadButton.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    redrawArray = JSON.parse(localStorage.savedCanvas);
    changeBackgroundUtility();
    currentTool.textContent = 'Canvas Loaded';
    setTimeout(brushTool, 1500);
  } else {
    currentTool.textContent = 'No Canvas to load';
    setTimeout(brushTool, 1500);
  }
});

cleanButton.addEventListener('click', () => {
  localStorage.removeItem('savedCanvas');
  currentTool.textContent = 'Local Storage Cleared';
  setTimeout(brushTool, 1500);
});

jpegButton.addEventListener('click', () => {
  jpegButton.href = canvas.toDataURL('image/jpeg', 1);
  jpegButton.download = 'paint.jpeg';
  currentTool.textContent = 'Saved now';
  setTimeout(brushTool, 1500);
});

brushIcon.addEventListener('click', brushTool);
rectangle.addEventListener('click', ()=> {
  brushTool();
  shapeMode=true;
  currentTool.textContent = 'Rectangle';
  item='a';
});
circle.addEventListener('click', ()=> {
  brushTool();
  shapeMode=true;
  item='b';
  currentTool.textContent = 'Circle';
});
ellipse.addEventListener('click', ()=> {
  brushTool();
  shapeMode=true;
  item='c';
  currentTool.textContent = 'Ellipse';
});
function draw()
{ console.log(2);
  context.strokeStyle=drawColor;
  context.lineWidth=currentSize;
  if(item=='a')
    {console.log(1);
      context.beginPath()
      context.strokeRect(sX,sY,mX-sX,mY-sY);context.stroke();
      context.closePath();
    }
  if(item=="b")
    {
      context.beginPath();context.arc(Math.abs(mX+sX)/2,Math.abs(mY+sY)/2,Math.sqrt(Math.pow(mX-sX,2)+Math.pow(mY-sY,2))/2, 0, Math.PI*2);context.stroke();context.closePath();}
  if(item=="c") {
    context.beginPath();context.ellipse(Math.abs(mX+sX)/2,Math.abs(mY+sY)/2,Math.sqrt(Math.pow(mX-sX,2)+Math.pow(mY-sY,2))/2, Math.sqrt(Math.pow(mX-sX,2)+Math.pow(mY-sY,2))/3, 0, 0, Math.PI*2);context.stroke();context.closePath();
  }
  
}

initCanvas();
