const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Railway bunu SEVİYOR
app.get("/", (req, res) => {
  res.send("Pixel site ayakta lan 😎");
});

app.use(express.static("public"));

const WIDTH = 50;
const HEIGHT = 30;

let pixels = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, () => "#ffffff")
);

io.on("connection", (socket) => {
  console.log("Biri girdi");

  socket.emit("init", pixels);

  socket.on("draw", ({ x, y, color }) => {
    if (pixels[y] && pixels[y][x] !== undefined) {
      pixels[y][x] = color;
      socket.broadcast.emit("draw", { x, y, color });
    }
  });
});

// 🔴 EN KRİTİK SATIRLAR
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server ayakta:", PORT);
});
