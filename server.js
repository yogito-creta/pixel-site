const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("."));

io.on("connection", socket => {
  socket.on("pixel", data => {
    io.emit("pixel", data);
  });
});

http.listen(process.env.PORT || 3000);
