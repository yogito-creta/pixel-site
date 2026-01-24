const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Dosyaların bulunduğu yer (Ana dizin)
const publicPath = path.resolve(__dirname);
app.use(express.static(publicPath));

// Eğer birisi ana sayfaya gelirse index.html gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

let canvasData = {}; 

io.on('connection', (socket) => {
    socket.emit('init-canvas', canvasData);
    socket.on('draw-pixel', (data) => {
        canvasData[`${data.x}-${data.y}`] = data.color;
        socket.broadcast.emit('update-pixel', data);
    });
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
    
