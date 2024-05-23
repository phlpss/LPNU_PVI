const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose
    .connect('mongodb://localhost:27017/task_db')
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Define a task schema and model
const taskSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    text: String,
    lane: String
});

const Task = mongoose.model('Task', taskSchema);

// Routes
// Routes
app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const { text, lane } = req.body;

    if (!text || !lane) {
        return res.status(400).send('Text and lane are required');
    }

    const newTask = new Task({ text, lane });
    await newTask.save();
    res.status(201).send('Task created');
});

// app.put('/tasks/:id', async (req, res) => {
//     const { id } = req.params;
//     const { lane } = req.body;
//
//     if (!lane) {
//         return res.status(400).send('Lane is required');
//     }
//
//     await Task.findByIdAndUpdate(id, { lane });
//     res.send('Task updated');
// });

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { lane } = req.body;

    if (!lane) {
        return res.status(400).send('Lane is required');
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { lane }, { new: true });
        if (!updatedTask) {
            return res.status(404).send('Task not found');
        }
        res.send('Task updated');
    } catch (error) {
        res.status(500).send('Error updating task');
    }
});



// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));