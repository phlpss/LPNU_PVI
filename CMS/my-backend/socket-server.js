import {formatMessage} from './utils/chatMessage.js';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {Server} = require('socket.io');
const cors = require('cors');
const chatCollection = 'chats'; // Collection to store all chats
const userCollection = 'onlineUsers'; // Collection to maintain list of currently online users

const app = express();
const server = http.createServer(app);
// const io = new Server(server);
app.use(cors());
// MongoDB connection
// const { MongoClient } = require('mongodb');
// const mongoUrl = 'mongodb://localhost:27017';
// const mongoDbName = 'chat_db';
// const mongoClient = new MongoClient(mongoUrl);
// async function connectToMongoDB() {
//     await mongoClient.connect();
//     console.log("Connected to MongoDB");
//     return mongoClient.db(mongoDbName);
// }
//
// const mongoDb = connectToMongoDB();

const {Pool} = require('pg');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const chatSchema = new Schema({
    owner: String,
    name: String,
    members: [String],
});

const Chat = mongoose.model('Chat', chatSchema);

const messageSchema = new Schema({
    chatId: String,
    author: String,
    order: Number,
    message: String,
});

const Message = mongoose.model('Message', messageSchema);

mongoose
    .connect('mongodb://localhost:27017/chat_storage')
    .then(() => {
        console.log('Successfully connected');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

// Create a pool to manage database connections
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'embryo',
    port: 5432,
});
app.get('/', (req, res) => {
    res.send("dummy message");
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Message received:' + JSON.stringify(msg));
        io.emit('chat message', msg);
    });

    socket.on('getMessages', (msg, callback) => {
        io.emit('getMessageResponse', {"message": "messageResponse"})
        callback({
            status: "ok"
        });
    });

    // socket.on('getChats', (callback) => {
    //     // query db for chats
    //     callback({
    //         status: "ok"
    //     });
    // });
    socket.on('fetch all chats', async (relatedUser) => {
        try {
            const existingChats = await Chat.find({
                $or: [{owner: relatedUser}, {members: {$in: [relatedUser]}}],
            });
            socket.emit('all chats', existingChats);
        } catch (error) {
            console.error('Error checking chat name availability:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});