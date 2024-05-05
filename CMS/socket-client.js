import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const messages = document.querySelector('.overflow-auto'); // Where messages will be displayed

const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
});

if (socket !== undefined) {
    console.log('Connected to socket...');
}