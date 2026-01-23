const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "./database.json";

app.use(express.json());

// Başlangıç verileri
let data = { pixels: {}, chat: [] };

// Dosyadan yükle
if (fs.existsSync(DB_FILE)) {
  try {
    const fileData = fs.readFileSync(DB_FILE, "utf8");
    data = JSON.parse(fileData);
    if (!data.chat) data.chat = [];
  } catch (err) { console.error("Yükleme hatası:", err); }
}

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/pixels", (req, res) => res.json(data.pixels));
app.get("/chat", (req, res) => res.json(data.chat));

// Pixel Kaydı (Kilit Kontrollü)
app.post("/pixel", (req, res) => {
  const { x, y, color, locked } = req.body;
  const key = `${x},${y}`;
  const existing = data.pixels[key];

  // Eğer alan kilitliyse ve gelen istekte locked:true yoksa engelle
  if (existing && typeof existing === 'object' && existing.locked) {
    if (!locked) {
      return res.status(403).json({ ok: false, error: "Bu alan kilitli!" });
    }
  }

  // Yeni veriyi kaydet
  data.pixels[key] = { color, locked: !!locked };
  saveToFile();
  res.json({ ok: true });
});

// Chat Kaydı
app.post("/chat", (req, res) => {
  const { user, msg } = req.body;
  if (msg) {
    data.chat.push({ user: user || "Misafir", msg, time: new Date().toLocaleTimeString() });
    if (data.chat.length > 50) data.chat.shift();
    saveToFile();
    res.json({ ok: true });
  }
});

function saveToFile() {
  fs.writeFile(DB_FILE, JSON.stringify(data), (err) => {
    if (err) console.error("Kaydetme hatası:", err);
  });
}

app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde aktif!`));
         
