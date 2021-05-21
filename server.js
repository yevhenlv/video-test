const express = require('express');
const app = express();
const server = require('http').Server(app);

app.set('view engine', 'ejs');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('room', { roomId: 'sessionId' });
});

io.on('connection', (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join('sessionId');
    socket.to('sessionId').broadcast.emit("user-connected", userId, roomId);
  });
});

server.listen(3000);