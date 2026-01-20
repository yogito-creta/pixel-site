const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrap = document.getElementById("wrap");
const ui = document.getElementById("ui");

// --- AYARLAR ---
const MAP_SIZE = 2000;
let scale = 10; 
let offsetX = window.innerWidth / 2 - (MAP_SIZE * scale) / 2;
let offsetY = window.innerHeight / 2 - (MAP_SIZE * scale) / 2;
let currentColor = "#ff0000";
let pixels = {};

const colors = ["#ffffff","#000000","#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ffa500","#964b00"];

// --- PALET OLUŞTURMA ---
const palette = document.getElementById("palette");
colors.forEach(c => {
  const d = document.createElement("div");
  d.className = "color";
  d.style.background = c;
  if (c === currentColor) d.classList.add("active");
  d.onclick = () => {
    currentColor = c;
    document.querySelectorAll(".color").forEach(x => x.classList.remove("active"));
    d.classList.add("active");
  };
  palette.appendChild(d);
});

function draw() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  for (const key in pixels) {
    const [x, y] = key.split(",");
    ctx.fillStyle = pixels[key];
    ctx.fillRect(parseInt(x), parseInt(y), 1, 1);
  }

  if (scale > 15) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1 / scale; 
    ctx.beginPath();
    for (let i = 0; i <= MAP_SIZE; i += 5) {
      ctx.moveTo(i, 0); ctx.lineTo(i, MAP_SIZE);
      ctx.moveTo(0, i); ctx.lineTo(MAP_SIZE, i);
    }
    ctx.stroke();
  }
  ctx.restore();
  ui.innerText = `Zoom: ${scale.toFixed(1)}x | Harita: 2000x2000`;
}

// --- KONTROL DEĞİŞKENLERİ ---
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let lastPinchDist = 0;

// Koordinat Hesaplama
function getCoords(clientX, clientY) {
  return {
    x: Math.floor((clientX - offsetX) / scale),
    y: Math.floor((clientY - offsetY) / scale)
  };
}

// Fare Olayları
window.addEventListener("mousedown", e => {
  if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
  } else if (e.button === 0) {
    const pos = getCoords(e.clientX, e.clientY);
    if (pos.x >= 0 && pos.x < MAP_SIZE && pos.y >= 0 && pos.y < MAP_SIZE) placePixel(pos.x, pos.y);
  }
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX += e.clientX - lastMouse.x;
    offsetY += e.clientY - lastMouse.y;
    lastMouse = { x: e.clientX, y: e.clientY };
    draw();
  }
});

// Dokunmatik (Mobil) Olayları
window.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    // Zoom başlangıcı için mesafe hesapla
    lastPinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
  } else if (e.touches.length === 1) {
    lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    // Mobilde sürükleme varsayılan olsun mu? 
    // Eğer bir butona basılı değilse sürükle, tıklandığında boya mantığı kurulabilir.
    isDragging = true; 
  }
}, { passive: false });

window.addEventListener("touchmove", e => {
  e.preventDefault(); // Sayfa kaymasını engelle
  
  if (e.touches.length === 2) {
    // PINCH ZOOM
    const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    
    const worldPos = { x: (midX - offsetX) / scale, y: (midY - offsetY) / scale };
    
    const delta = dist / lastPinchDist;
    scale = Math.min(Math.max(0.5, scale * delta), 60);
    
    offsetX = midX - worldPos.x * scale;
    offsetY = midY - worldPos.y * scale;
    
    lastPinchDist = dist;
    draw();
  } else if (e.touches.length === 1 && isDragging) {
    // PAN (Sürükleme)
    offsetX += e.touches[0].clientX - lastMouse.x;
    offsetY += e.touches[0].clientY - lastMouse.y;
    lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    draw();
  }
}, { passive: false });

window.addEventListener("touchend", e => {
  if (e.touches.length === 0 && isDragging) {
    // Eğer çok az hareket ettiyse boyama yap (dokun-çek için)
    isDragging = false;
  }
});

// Masaüstü Zoom (Tekerlek)
window.addEventListener("wheel", e => {
  const worldPos = { x: (e.clientX - offsetX) / scale, y: (e.clientY - offsetY) / scale };
  scale = Math.min(Math.max(0.5, scale * (e.deltaY > 0 ? 0.9 : 1.1)), 60);
  offsetX = e.clientX - worldPos.x * scale;
  offsetY = e.clientY - worldPos.y * scale;
  draw();
}, { passive: false });

window.addEventListener("mouseup", () => isDragging = false);

function placePixel(x, y) {
  pixels[`${x},${y}`] = currentColor;
  draw();
  fetch("/pixel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y, color: currentColor })
  });
}

fetch("/pixels").then(r => r.json()).then(data => { pixels = data; draw(); });
window.addEventListener("resize", draw);
draw();
      
