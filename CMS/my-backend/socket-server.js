// import {formatMessage} from './utils/chatMessage.js';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {Server} = require('socket.io');
const cors = require('cors');

const chatCollection = 'chats';         // Collection to store all chats
const userCollection = 'onlineUsers';   // Collection to maintain list of currently online users

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const {Pool} = require('pg');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const chatSchema = new Schema({
    owner: String,
    name: String,
    members: [String],
});

const Chat = mongoose.model('chat', chatSchema);
const messageSchema = new Schema({
    chatId: String,
    author: String,
    order: Number,
    message: String,
});

const Message = mongoose.model('Message', messageSchema);

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    password: {type: String, required: true},
});

const User = mongoose.model('User', userSchema);

mongoose
    .connect('mongodb://localhost:27017/chat_db')
    .then(() => {
        console.log('Successfully connected to MongoDB');
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

const bcrypt = require('bcrypt');
const saltRounds = 10;

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({username, email, password: hashedPassword});
        await newUser.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Error creating user');
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if (user && await bcrypt.compare(password, user.password)) {
            // Assuming a session or token based approach should be used here for real applications
            res.send('User authenticated successfully');
        } else {
            res.status(401).send('Authentication failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in');
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg, callback) => {
        // console.log('Message received:' + JSON.stringify(msg));
        io.emit('chat message', msg)
        callback({
            status: "ok"
        });
    });

    socket.on('get messages', (msg, callback) => {
        io.emit('getMessageResponse', {"message": "messageResponse"})
        callback({
            status: "ok"
        });
    });

    socket.on('get all chats', async (relatedUser) => {
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

async function CheckNameAvailability(chatName, chatOwner) {
    let success = true;
    try {
        const existingChat = await Chat.find({
            name: chatName,
            owner: chatOwner,
        });

        if (existingChat.length === 0) {
            success = true;
        } else {
            success = false;
        }
    } catch (error) {
        console.error('Error checking chat name availability:', error);
        success = false;
    }
    return success;
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});