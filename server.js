const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const WIDTH = 50;
const HEIGHT = 30;

// Canvas verisi (sunucuda tutulur)
let pixels = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, () => "#ffffff")
);

io.on("connection", (socket) => {
  console.log("Biri girdi lan");

  // Yeni girene tüm canvas gönder
  socket.emit("init", pixels);

  socket.on("draw", ({ x, y, color }) => {
    if (pixels[y] && pixels[y][x]) {
      pixels[y][x] = color;
      socket.broadcast.emit("draw", { x, y, color });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server ayakta:", PORT);
});
