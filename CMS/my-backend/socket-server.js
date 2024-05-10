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
        res.status(201).send({success: true, message: 'User created successfully'});
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
            res.send({
                userId: user._id,
                email: user.email,
                username: user.username
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
    async function connectUser() {
        let userid = socket.handshake.query.userid;
        console.log(userid)
        if (userid === undefined) {
            socket.emit('error', 'userid is required')
            socket.disconnect()
        }
        console.log(`User ${userid} connected`)
        let user = await getUser(userid)
        console.log(`found user: ${user}`)
        console.log(`User ${userid} connected`)
        sidUserMap[socket.id] = {
            userId: userid,
            email: user.email,
            username: user.username
        }
        return user;
    }

    async function joinChatRooms(user) {
        const chats = await findUserChats(user.email)
        console.log(`Found chats: ${chats}`)

        chats.forEach((chat) => {
            socket.join(sanitizeRoomName(chat.name));
            console.log(`${user.email} Joined chat room: ${chat.name}`);
        });
    }

    function sanitizeRoomName(roomName) {
        return roomName.replace(/\s+/g, '_');
    }

    let user;
    try {
        user = await connectUser();
        await joinChatRooms(user);
    } catch (error) {
        console.error("Error in connection handler:", error);
        socket.emit('error', 'Failed to connect or join rooms');
    }

    socket.on('send message', async (msg, callback) => {
        let from = sidUserMap[socket.id].email;
        let chatId = msg.chatId;
        let messageContent = msg.message;
        let message = new Message({
            chatId: chatId,
            author: from,
            datetime: new Date(),
            message: messageContent,
        })
        const chat = await findChatById(chatId)
        await message.save()
        let newMessage = {
            from: sidUserMap[socket.id].username,
            chatId: chatId,
            dateTime: new Date(),
            message: messageContent
        };
        console.log(newMessage)
        io.to(sanitizeRoomName(chat.name)).emit('new message', newMessage);
    });

    socket.on('get messages', async (msg, callback) => {
        try {
            const chat = await Chat.findOne({_id: msg.chatId});
            if (!chat) {
                callback({error: "Chat not found"});
                return;
            }

            const messages = await Message.find({chatId: msg.chatId});

            // Collect all unique email addresses from messages to minimize database queries.
            const userEmails = [...new Set(messages.map(message => message.author))];

            // Fetch user details for each unique email.
            const users = await User.find({email: {$in: userEmails}});
            const emailToUsernameMap = users.reduce((acc, user) => {
                acc[user.email] = user.username; // Create a map of email to username
                return acc;
            }, {});

            // Map messages to include usernames instead of email addresses
            const messageData = messages.map(m => ({
                author: emailToUsernameMap[m.author],
                message: m.message,
                dateTime: m.datetime
            }));

            // Resolve usernames for chat members
            const memberUsernames = await User.find({email: {$in: chat.members}});
            const memberNames = memberUsernames.map(user => user.username);

            const response = {
                chatName: chat.name,
                members: memberNames,
                messages: messageData
            };

            callback(response); // Send the combined data back to the client
        } catch (error) {
            console.error('Error fetching messages:', error);
            callback({error: "Failed to fetch messages"});
        }
    });


    async function findUserChats(userEmail) {
        return Chat.find({
            $or: [
                {owner: user.email},
                {members: {$in: [user.email]}}
            ],
        });
    }

    async function findChatById(chatId) {
        return Chat.findOne({
            _id: chatId
        });
    }

    socket.on('get users', async (msg, callback) => {
        console.log('Get users request')
        const users = await User.find()
        const emails = users.map(user => user.email)
        callback(emails)
    })

    socket.on('get chats', async (msg, callback) => {
        try {
            const user = sidUserMap[socket.id]
            const existingChats = await findUserChats(user);
            callback(existingChats)
        } catch (error) {
            console.error('Error checking chat name availability:', error);
        }
    });

    socket.on('create chat', async (msg, callback) => {
        try {
            const user = sidUserMap[socket.id]
            const newChat = new Chat({
                owner: user.email,
                name: msg.name,
                members: msg.members
            });
            await newChat.save()
            callback(newChat)
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