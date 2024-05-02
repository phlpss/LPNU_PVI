const express = require('express');
const {createServer} = require('node:http');
const {fileURLToPath} = require('node:url');
const {dirname, join} = require('node:path');
const {Server} = require('socket.io');
const {MongoClient} = require('mongodb');
const {availableParallelism} = require('node:os');
const cluster = require('node:cluster');
const {createAdapter, setupPrimary} = require('@socket.io/cluster-adapter');

async function main() {
    if (cluster.isPrimary) {
        const numCPUs = availableParallelism();
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork({
                PORT: 3000 + i
            });
        }

        setupPrimary();
    } else {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('chat');
        const messages = db.collection('messages');

        await messages.createIndex({'client_offset': 1}, {unique: true});

        const app = express();
        const server = createServer(app);
        const io = new Server(server, {
            connectionStateRecovery: {},
            adapter: createAdapter()
        });

        const __dirname = dirname(fileURLToPath(import.meta.url));

        app.get('/', (req, res) => {
            res.sendFile(join(__dirname, 'index.html'));
        });

        io.on('connection', async (socket) => {
            socket.on('chat message', async (msg, clientOffset, callback) => {
                let result;
                try {
                    result = await messages.insertOne({content: msg, client_offset: clientOffset});
                    io.emit('chat message', msg, result.insertedId);
                    callback();
                } catch (e) {
                    if (e.code === 11000 /* Duplicate Key */) {
                        callback(); // handle duplicate entry
                    } else {
                        // handle other errors
                    }

                }
            });

            if (!socket.recovered) {
                try {
                    const cursor = messages.find({}).sort({_id: 1}); // Adjust query as needed
                    await cursor.forEach(doc => {
                        socket.emit('chat message', doc.content, doc._id);
                    });
                } catch (e) {
                    // handle errors
                }
            }
        });

        const port = process.env.PORT;

        server.listen(port, () => {
            console.log(`server running at http://localhost:${port}`);
        });
    }
}

main();