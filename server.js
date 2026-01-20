const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const MAP_LIMIT = 2000;

let pixels = {}; 

app.use(express.json());

// HTML dosyasını ana sayfada göster
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Kayıtlı tüm pikselleri gönder
app.get("/pixels", (req, res) => {
  res.json(pixels);
});

// Yeni piksel geldiğinde kaydet
app.post("/pixel", (req, res) => {
  const { x, y, color } = req.body;
  if (x >= 0 && x < MAP_LIMIT && y >= 0 && y < MAP_LIMIT) {
    pixels[`${x},${y}`] = color;
    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false, message: "Sınır dışı!" });
  }
});

app.listen(PORT, () => {
  console.log("Sunucu çalışıyor: " + PORT);
});
