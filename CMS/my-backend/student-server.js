const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Database connection
const dbConfig = {
    host: 'localhost',
    // user: 'Katya',
    // password: 'Rfv11tgb22yhn33',
    user: 'bingo',
    password: 'bingo',
    database: 'student_db',
};
const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());

function validateStudentData(student) {
    const {group, name, gender, birthday} = student;

    // Checking for presence of required fields
    if (!group || !name || !gender || !birthday) {
        return 'All fields are required.';
    }

    // name validation (Example: Must start with uppercase followed by lowercase)
    const namePattern = /^[A-Z][a-z]+$/;
    const nameParts = name.split(' ');
    if (!nameParts.every(name => namePattern.test(name))) {
        return 'Name must start with an uppercase letter and be followed by lowercase letters.';
    }

    return null;
}

app.post('/api/v1/student', async (req, res) => {
    const validationError = validateStudentData(req.body);
    if (validationError) {
        return res.status(400).json({error: validationError});
    }

    let {group, name, gender, birthday} = req.body;
    birthday = new Date(birthday).toISOString().split('T')[0];

    try {
        const [result] = await pool.query(
            'INSERT INTO students (`group`, name, gender, birthday) VALUES (?, ?, ?, ?)',
            [group, name, gender, birthday]
        );
        return res.status(201).json({message: "Student added successfully", studentId: result.insertId});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
});

app.put('/api/v1/student', async (req, res) => {
    const {id, group, name, gender, birthday, status} = req.body;

    // Validate student data
    const validationError = validateStudentData(req.body);
    if (validationError) {
        return res.status(400).json({error: validationError});
    }

    // Convert the birthday to UTC to avoid timezone issues
    const birthdayUTC = new Date(birthday).toISOString().split('T')[0];

    try {
        const [check] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({error: "Student not found"});
        }

        const [updateResult] = await pool.query(
            'UPDATE students SET `group` = ?, name = ?, gender = ?, birthday = ?, status = ? WHERE id = ?',
            [group, name, gender, birthdayUTC, status, id]
        );

        console.log(updateResult);
        res.status(200).json({message: "Student updated successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.delete('/api/v1/student', async (req, res) => {
    const {id} = req.body;

    try {
        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Student not found"});
        }

        res.status(200).json({message: "Student deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get('/api/v1/student/:id', async (req, res) => {
    const studentId = parseInt(req.params.id, 10); // Convert the id from string to integer
    if (isNaN(studentId)) {
        return res.status(400).json({error: "Invalid student ID format"});
    }

    try {
        const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
        if (rows.length === 0) {
            return res.status(404).json({error: "Student not found"});
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get('/api/v1/student', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM students');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});