const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

let pixels = {};

app.use(express.json());

// index.html'i ROOT'tan servis et (public yok!)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// pixel verilerini ver
app.get("/pixels", (req, res) => {
  res.json(pixels);
});

// pixel kaydet
app.post("/pixel", (req, res) => {
  const { x, y, color } = req.body;
  pixels[`${x},${y}`] = color;
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log("Server ayakta:", PORT);
});
