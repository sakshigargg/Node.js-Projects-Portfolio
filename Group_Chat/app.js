const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const path = require('path');
app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`Chat 💬 sever is listening on port: ${PORT}`);
})

const { Server } = require('socket.io');
const io = new Server(expressServer);

io.on('connection', onConnected);
let socketCount = new Set();

function onConnected(socket) {
    socketCount.add(socket.id);
    // io.emit('clients-total', io.engine.clientsCount);
    // if (io.engine.clientsCount < 3) {
    //     io.of("/admin").in(socket.id).socketsJoin("room1");
    // }

    // console.log("count", io.of("/admin").sockets.size);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected id: ${socket.id} `);
        socketCount.delete(socket.id);
        // io.emit('clients-total', io.engine.clientsCount);
    })

    socket.on('message', (data) => {
        socket.broadcast.emit('chat-message', data);
    })

    socket.on('group-total', (data)=>{
      socket.emit('clients-total', io.engine.clientsCount);
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    })
    socket.on('join-private-chat', (name) => {
        socket.join(`private-chat-${name}`);
      });
    
    //   socket.on('join-group-chat', (name) => {
    //     socket.join('group-chat');
    //   });
    
      socket.on('private-chat-message', (data) => {
        io.to(`private-chat-${data.name}`).emit('private-chat-message', data);
      });
    
      socket.on('group-chat-message', (data) => {
        io.to('group-chat').emit('group-chat-message', data);
      });
    
}


