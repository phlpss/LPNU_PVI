// const express = require('express');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2/promise');
// const app = express();
// const port = 3000;
//
// // Configure MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'Katya',
//     password: 'Rfv11tgb22yhn33',
//     database: 'log-in'
// });
//
// connection.connect(err => {
//     if (err) throw err;
//     console.log('Connected to MySQL Server!');
// });
//
// // Body parser middleware to parse request bodies
// app.use(bodyParser.urlencoded({ extended: true }));
//
// // POST endpoint for sign-in
// app.post('/signin', (req, res) => {
//     const { email, password } = req.body;
//
//     // SQL query to find user by email
//     const sql = `SELECT password FROM users WHERE email = ${connection.escape(email)}`;
//
//     connection.query(sql, (err, results, fields) => {
//         if (err) {
//             res.status(500).send('Database error');
//             return;
//         }
//
//         // Check if user was found and password matches
//         if (results.length > 0 && results[0].password === password) {
//             res.send('Sign in successful!');
//         } else {
//             res.status(401).send('Invalid credentials');
//         }
//     });
// });
//
// // Start the server
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// Configure MySQL connection
async function main() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'Katya',
            password: 'Rfv11tgb22yhn33',
            database: 'log-in'
        });

        console.log('Connected to MySQL Server!');

        // Body parser middleware to parse request bodies
        app.use(bodyParser.urlencoded({ extended: true }));

        // POST endpoint for sign-in
        app.post('/signin', async (req, res) => {
            const { email, password } = req.body;

            // SQL query to find user by email
            const sql = `SELECT password FROM users WHERE email = ?`;
            try {
                const [results] = await connection.query(sql, [email]);

                // Check if user was found and password matches
                if (results.length > 0 && results[0].password === password) {
                    res.send('Sign in successful!');
                } else {
                    res.status(401).send('Invalid credentials');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Database error');
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to MySQL:', err);
    }
}

main();