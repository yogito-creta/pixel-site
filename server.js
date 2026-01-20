const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// büyük harita için pixel kayıtları
let pixels = {}; // { "x,y": color }

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  // girene tüm tuvali gönder
  socket.emit("init", pixels);

  socket.on("pixel", (data) => {
    const key = `${data.x},${data.y}`;
    pixels[key] = data.color;
    socket.broadcast.emit("pixel", data);
  });
});

server.listen(PORT, () => {
  console.log("Pixel site ayakta lan 😎");
});
