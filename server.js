const express = require("express");
const path = require("path");
const fs = require("fs"); // Verileri kaydetmek istersen diye eklendi
const app = express();

const PORT = process.env.PORT || 3000;
const MAP_LIMIT = 2000; // 2000x2000 sınırımız

// Bellekteki pikseller
let pixels = {};

// OPSİYONEL: Sunucu her açıldığında eski pikselleri dosyadan yükle
if (fs.existsSync("database.json")) {
  pixels = JSON.parse(fs.readFileSync("database.json"));
}

app.use(express.json());

// index.html'i servis et
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Tüm pikselleri gönder
app.get("/pixels", (req, res) => {
  res.json(pixels);
});

// Piksel kaydet
app.post("/pixel", (req, res) => {
  const { x, y, color } = req.body;

  // GÜVENLİK KONTROLÜ: Koordinatlar harita sınırları içinde mi?
  if (x >= 0 && x < MAP_LIMIT && y >= 0 && y < MAP_LIMIT) {
    pixels[`${x},${y}`] = color;
    
    // OPSİYONEL: Her 50 pikselde bir dosyaya yedekle (Sunucu çökerse veriler gitmez)
    // Bu kısmı her seferinde yapmak sunucuyu yorabilir, o yüzden basit tutuyoruz.
    // fs.writeFileSync("database.json", JSON.stringify(pixels));

    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false, message: "Sınır dışı koordinat!" });
  }
});

app.listen(PORT, () => {
  console.log(`
  ==========================================
  Pixel World Sunucusu Hazır!
  Port: ${PORT}
  Harita Sınırı: ${MAP_LIMIT}x${MAP_LIMIT}
  ==========================================
  `);
});
