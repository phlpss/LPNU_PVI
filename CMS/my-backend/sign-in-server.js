const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Dummy user data for validation
const users = {
    'user@example.com': {
        password: 'password123'
    },
    'philipkatya13@gmail.com': {
        password: 'gfhjkm'
    }
};

// Body parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// POST endpoint for sign-in
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Validate user credentials
    if (users[email] && users[email].password === password) {
        res.send('Sign in successful!');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});