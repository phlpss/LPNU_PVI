const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post('/api/v1/customer', (req, res) => {
    console.log(req.body); // Log the student data to the console
    res.status(200).json({ message: "Student data received" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
