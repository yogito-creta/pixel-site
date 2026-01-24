const express = require("express"); // Const → const
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "./database.json";

app.use(express.json());
app.use(express.static(__dirname)); // STATİC EKLENDİ

// Başlangıç verileri
let data = { pixels: {}, chat: [] };

// Dosyadan yükle
if (fs.existsSync(DB_FILE)) {
  try {
    const fileData = fs.readFileSync(DB_FILE, "utf8");
    data = JSON.parse(fileData);
    if (!data.chat) data.chat = [];
    if (!data.pixels) data.pixels = {};
  } catch (err) {
    console.error("Yükleme hatası:", err);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/pixels", (req, res) => res.json(data.pixels));
app.get("/chat", (req, res) => res.json(data.chat));

// Pixel Kaydı
app.post("/pixel", (req, res) => {
  const { x, y, color } = req.body;
  if (x == null || y == null || !color) return res.json({ ok: false });
  data.pixels[`${x},${y}`] = color;
  saveToFile();
  res.json({ ok: true });
});

// Chat Kaydı
app.post("/chat", (req, res) => {
  const { user, msg } = req.body;
  if (!msg) return res.json({ ok: false });

  data.chat.push({
    user: user || "Misafir",
    msg: String(msg).slice(0, 50),
    time: new Date().toLocaleTimeString()
  });

  if (data.chat.length > 50) data.chat.shift();
  saveToFile();
  res.json({ ok: true });
});

function saveToFile() {
  fs.writeFile(DB_FILE, JSON.stringify(data), err => {
    if (err) console.error("Kaydetme hatası:", err);
  });
}

app.listen(PORT, () => {
  console.log("Yogito Pixel & Chat aktif! PORT:", PORT);
});
