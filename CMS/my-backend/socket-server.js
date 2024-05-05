// import {formatMessage} from './utils/chatMessage.js';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {Server} = require('socket.io');
const cors = require('cors');
const {User, Chat, Message} = require('./models.js')


const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const {Pool} = require('pg');
const mongoose = require('mongoose');

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

app.get('/', (req, res) => {
    res.send("dummy message");
});

const bcrypt = require('bcrypt');
const {callback} = require("pg/lib/native/query");
const saltRounds = 10;

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

app.post('/api/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log('received email: ' + email)
        const user = await User.findOne({email: email});
        console.log(user)
        if (user && await bcrypt.compare(password, user.password)) {
            // Assuming a session or token based approach should be used here for real applications
            res.send({
                userId: user._id,
                email: user.email
            });
        } else {
            res.status(401).send('Authentication failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in');
    }
});

const sidUserMap = {};

async function checkChatNameAvalability(msg, socket) {
    const existingChat = await Chat.find({
        name: msg.name
    });
    if (existingChat !== undefined)
        socket.emit('error', 'Error creating chat. Chat already exists')
}

io.on('connection', async (socket) => {

    let userid = socket.handshake.query.userid;
    console.log(userid)
    if (userid === undefined) {
        socket.emit('error', 'userid is required')
        socket.disconnect()
    }
    console.log(`User ${userid} connected`)
    let user = await getUser(userid)
    sidUserMap[socket.id] = {
        userId: userid,
        email: user.email
    }
    console.log('Sid usermap')
    console.log(sidUserMap)
    const chats = await findUserChats(userid)

    chats.forEach((chat) => {
        socket.join(chat.name);
        console.log(`${userId} Joined chat room: ${chat.name}`);
    });

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

    async function findUserChats(userId) {
        return Chat.find({
            $or: [{owner: userId}, {members: {$in: [userId]}}],
        });
    }

    socket.on('get all chats', async (relatedUser, callback) => {
        try {
            const existingChats = await findUserChats(relatedUser);
            callback({
                chats: existingChats
            })
        } catch (error) {
            console.error('Error checking chat name availability:', error);
        }
    });

    socket.on('create chat', async (msg, callback) => {
        try {
            const newChat = new Chat({
                owner: msg.owner,
                name: msg.name,
                members: msg.members
            });
            await newChat.save()
            callback({
                chat: newChat
            })
        } catch (error) {
            emitError(`Error creating chat: ${error.message}`);
            console.error('Error checking chat:', error);
        }
    });

    async function getUser(userId) {
        return User.findOne({
            _id: userId
        })
    }

    function emitError(message) {
        socket.emit('error', message)
    }

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