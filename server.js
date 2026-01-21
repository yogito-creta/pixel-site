const express = require("express");
const path = require("path");
const fs = require("fs"); // Dosya sistemi modülü
const app = express();
const PORT = process.env.PORT || 3000;
const MAP_LIMIT = 2000;
const DB_FILE = "./database.json";

app.use(express.json());

// 1. Sunucu açıldığında dosyadan eski pikselleri yükle
let pixels = {};
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    pixels = JSON.parse(data);
    console.log("Eski pikseller dosyadan yüklendi!");
  } catch (err) {
    console.error("Dosya okuma hatası:", err);
    pixels = {};
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/pixels", (req, res) => {
  res.json(pixels);
});

app.post("/pixel", (req, res) => {
  const { x, y, color } = req.body;
  if (x >= 0 && x < MAP_LIMIT && y >= 0 && y < MAP_LIMIT) {
    pixels[`${x},${y}`] = color;
    
    // 2. Her yeni piksel geldiğinde dosyaya kaydet
    // (Büyük projelerde bu işlem farklı yapılır ama senin için en basit yol budur)
    fs.writeFile(DB_FILE, JSON.stringify(pixels), (err) => {
      if (err) console.error("Kaydetme hatası:", err);
    });

    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log("Yogito Pixel sunucusu kalıcı modda çalışıyor: " + PORT);
});
      
