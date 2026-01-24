const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// Verileri RAM'de tutuyoruz
let canvasData = {}; 
let chatHistory = [];

io.on('connection', (socket) => {
    // Yeni bağlanana mevcut durumu gönder
    socket.emit('init-canvas', canvasData);
    socket.emit('init-chat', chatHistory);

    // Pixel çizildiğinde
    socket.on('draw-pixel', (data) => {
        const key = `${data.x},${data.y}`;
        canvasData[key] = data.color;
        // Çizeni hariç tutarak herkese gönder
        socket.broadcast.emit('update-pixel', data);
    });

    // Mesaj geldiğinde
    socket.on('chat-message', (data) => {
        const msg = { user: data.user || 'Oyuncu', text: data.text };
        chatHistory.push(msg);
        if (chatHistory.length > 50) chatHistory.shift(); // Son 50 mesajı tut
        io.emit('chat-message', msg);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Yogito Pixel Aktif: ${PORT}`));
