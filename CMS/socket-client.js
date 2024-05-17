import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

let socket
let currentUserName = 'katya'
// const locallhost = `ws://localhost:3000?userid=${userId}`
// const address = `ws://192.168.193.49:3000?userid=${userId}`

export function connectToSocket(userId, username) {
    socket = io(`ws://localhost:3000?userid=${userId}`, {
        reconnectionDelayMax: 10000,
    });

    currentUserName = username;
    const notificationsContainer = document.getElementById('notificationsContent');

    socket.on('new message', (msg) => {
        const messagesContainer = document.getElementById('chatMessages');
        console.log('message received')

        // show notification on the bell
        animateBell();

        const date = new Date(msg.dateTime);
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const messageDiv = document.createElement('div');
        messageDiv.className = msg.from === currentUserName ? 'message-right' : 'message-left';
        messageDiv.innerHTML = `
        <div class="message-header">${msg.from} <span class="message-time">${formattedTime}</span></div>
        <div class="message-body">${msg.message}</div>
    `;
        messagesContainer.appendChild(messageDiv);

        // Create and append notification for new message
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'notification';
        notificationDiv.textContent = `${msg.from}: ${msg.message}`;
        notificationsContainer.appendChild(notificationDiv);
    })
}

function animateBell() {
    const bell = document.getElementById('notificationBell');
    bell.classList.add('animate');

    bell.addEventListener('animationend', function() {
        bell.classList.remove('animate');
    });
}

export function getUsers() {
    return new Promise((resolve, reject) => {
        socket.emit("get users", {}, (response) => {
            resolve(response);
        })
    })
}

export function getChats() {
    return new Promise((resolve, reject) => {
        socket.emit("get chats", {}, (response) => {
            resolve(response);
        })
    })
}

export function createNewChat(name, members) {
    return new Promise((resolve, reject) => {
        socket.emit("create chat", {
            name: name,
            members: members
        }, (response) => {
            resolve(response)
        })
    })
}

export function sendMessageToServer(chatId, message){
    socket.emit('send message', {
        chatId: chatId,
        message: message
    })
}

export function getChatWithMessages(chatId) {
    return new Promise((resolve, reject) => {
        socket.emit('get messages', {chatId: chatId}, (response) => {
            resolve(response)
        })
    })
}