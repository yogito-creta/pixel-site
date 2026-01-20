const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

let pixels = {}; // RAM'de tutuyor (restart'ta silinir)

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pixel World</title>

<style>
body {
  margin:0;
  background:#0b0b0b;
  color:#fff;
  font-family:Arial, sans-serif;
  display:flex;
  flex-direction:column;
  align-items:center;
}

header {
  width:100%;
  padding:10px;
  text-align:center;
  background:#111;
  font-weight:bold;
}

#palette {
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:6px;
  padding:10px;
  background:#111;
}

.color {
  width:28px;
  height:28px;
  border-radius:6px;
  border:2px solid #333;
}

.color.active {
  border:2px solid #fff;
}

canvas {
  margin-top:10px;
  border:2px solid #222;
  touch-action: none;
  image-rendering: pixelated;
}
</style>
</head>

<body>

<header>Pixel World – Ayakta Lan 😎</header>

<div id="palette"></div>

<canvas id="canvas" width="320" height="320"></canvas>

<script>
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const size = 10;
let currentColor = "#ff0000";

const colors = [
  "#ffffff","#000000","#ff0000","#00ff00","#0000ff",
  "#ffff00","#ff00ff","#00ffff","#ffa500","#964B00"
];

const palette = document.getElementById("palette");

colors.forEach(c=>{
  const div = document.createElement("div");
  div.className = "color";
  div.style.background = c;
  if(c === currentColor) div.classList.add("active");
  div.onclick = ()=>{
    currentColor = c;
    document.querySelectorAll(".color").forEach(x=>x.classList.remove("active"));
    div.classList.add("active");
  };
  palette.appendChild(div);
});

function drawGrid(){
  ctx.strokeStyle = "#222";
  for(let i=0;i<=32;i++){
    ctx.beginPath();
    ctx.moveTo(i*size,0);
    ctx.lineTo(i*size,320);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*size);
    ctx.lineTo(320,i*size);
    ctx.stroke();
  }
}

function drawAll(data){
  ctx.clearRect(0,0,320,320);
  for(const key in data){
    const [x,y] = key.split(",");
    ctx.fillStyle = data[key];
    ctx.fillRect(x*size, y*size, size, size);
  }
  drawGrid();
}

fetch("/pixels").then(r=>r.json()).then(drawAll);

function placePixel(e){
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / size);
  const y = Math.floor((e.clientY - rect.top) / size);

  // anında çiz
  ctx.fillStyle = currentColor;
  ctx.fillRect(x*size, y*size, size, size);
  drawGrid();

  // server'a gönder
  fetch("/pixel",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({x,y,color:currentColor})
  });
}

canvas.addEventListener("click", placePixel);
canvas.addEventListener("touchstart", e=>{
  e.preventDefault();
  placePixel(e.touches[0]);
});
</script>

</body>
</html>
  `);
});

app.get("/pixels", (req,res)=>{
  res.json(pixels);
});

app.post("/pixel", (req,res)=>{
  const {x,y,color} = req.body;
  pixels[\`\${x},\${y}\`] = color;
  res.json({ok:true});
});

app.listen(PORT, ()=>{
  console.log("Server ayakta:", PORT);
});
