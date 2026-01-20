const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

let pixels = {}; // kalıcı değil ama refresh'te silinmez

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Pixel Site</title>
<style>
body {
  background:#111;
  color:#fff;
  font-family:Arial;
  text-align:center;
}
#toolbar {
  margin:10px;
}
canvas {
  border:2px solid #fff;
  image-rendering: pixelated;
}
</style>
</head>
<body>

<h2>Pixel Site Ayakta Lan 😎</h2>

<div id="toolbar">
  Renk:
  <input type="color" id="color" value="#ff0000">
</div>

<canvas id="canvas" width="400" height="400"></canvas>

<script>
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const size = 10;

function drawAll(data){
  ctx.clearRect(0,0,400,400);
  for(const key in data){
    const [x,y] = key.split(",");
    ctx.fillStyle = data[key];
    ctx.fillRect(x*size, y*size, size, size);
  }
}

fetch("/pixels")
.then(r=>r.json())
.then(drawAll);

canvas.addEventListener("click", e=>{
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left)/size);
  const y = Math.floor((e.clientY - rect.top)/size);
  const color = document.getElementById("color").value;

  fetch("/pixel",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({x,y,color})
  }).then(()=>{
    fetch("/pixels").then(r=>r.json()).then(drawAll);
  });
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
  pixels[`${x},${y}`] = color;
  res.json({ok:true});
});

app.listen(PORT, ()=>{
  console.log("Server ayakta:", PORT);
});
