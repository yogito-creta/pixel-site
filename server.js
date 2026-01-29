const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// 🔥 STATİK DOSYALAR (GOOGLE İÇİN ŞART)
app.use(express.static(__dirname));

// VERİLER (RAM)
let pixels = {};
let chats = [];

app.use(express.json());

// INDEX
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});