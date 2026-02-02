const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// VERİLER (RAM)
let pixels = {};
let chats = [];

app.use(express.json());

// INDEX
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "index.html"));
});

// ================= PIXEL =================

// TÜM PIXELLER
app.get("/pixels", (req, res) => {
res.json(pixels);
});

// PIXEL KOY
app.post("/pixel", (req, res) => {
const { x, y, color } = req.body;
if (x == null || y == null || !color) {
return res.json({ ok: false });
}

pixels[${x},${y}] = color;
res.json({ ok: true });
});

// ================= CHAT =================

// CHAT LİSTESİ
app.get("/chat", (req, res) => {
res.json(chats);
});

// CHAT MESAJI
app.post("/chat", (req, res) => {
const { user, msg } = req.body;
if (!msg) return res.json({ ok: false });

chats.push({
user: user || "Anonim",
msg: msg.toString().slice(0, 50)
});

// CHAT ŞİŞMESİN
if (chats.length > 100) chats.shift();

res.json({ ok: true });
});

// ================= START =================

app.listen(PORT, () => {
console.log("🔥 Yogito Pixel Server ayakta:", PORT);
});