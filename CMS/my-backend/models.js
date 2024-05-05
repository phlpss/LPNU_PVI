const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chatSchema = new Schema({
    owner: String,
    name: {
        type: String,
        unique: true
    },
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

module.exports = {
    Chat,
    Message,
    User
};
