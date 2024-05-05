import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const messages = document.querySelector('.overflow-auto'); // Where messages will be displayed

let socket

export function connectToSocket(userId) {
    socket = io(`ws://localhost:3000?userid=${userId}`, {
        reconnectionDelayMax: 10000,
    });
}