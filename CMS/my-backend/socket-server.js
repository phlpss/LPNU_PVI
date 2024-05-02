import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { formatMessage } from './utils/chatMessage.js';

const chatCollection = 'chats'; // Collection to store all chats
const userCollection = 'onlineUsers'; // Collection to maintain list of currently online users

const app = express();
const server = createServer(app);
const io = new Server(server);

async function main() {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + 'index.html');
    });

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.listen(3000, () => {
        console.log('listening on *:3000');
    });
}

main();