const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');

app.use(cors());
app.use(express.json());

let studentsData = [];
class Student {
    //static idCounter = 0;
    constructor(id, group, name, gender, birthday, status = "Active") {
        this.id = id;
        this.group = group;
        this.name = name;
        this.gender = gender;
        this.birthday = birthday;
        this.status = status;
    }
}

function validateStudentData(student) {
    const { group, name, gender, birthday } = student;

    // Checking for presence of required fields
    if (!group || !name || !gender || !birthday) {
        return 'All fields are required.';
    }

    // name validation (Example: Must start with uppercase followed by lowercase)
    const namePattern = /^[A-Z][a-z]+$/;
    const nameParts = name.split(' ');
    if (!nameParts.every(name => namePattern.test(name))) {
        return 'name must start with an uppercase letter and be followed by lowercase letters.';
    }

    return null;
}

app.post('/api/v1/student', (req, res) => {
    const validationError = validateStudentData(req.body);
    if (validationError != null) {
        return res.status(400).json({ error: validationError });
    }

    const { group, name, gender, birthday } = req.body;
    let id = studentsData.length > 0 ? studentsData[studentsData.length - 1].id + 1 : 1;
    let newStudent = new Student(id, group, name, gender, birthday);
    studentsData.push(newStudent);

    console.log('New student added:', newStudent);
    res.status(200).json({ message: "Student added successfully", student: newStudent });
});

app.put('/api/v1/student', (req, res) => {
    const { id } = req.body;
    const studentIndex = studentsData.findIndex(student => student.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({ error: "server: Student not found" });
    }

    const validationError = validateStudentData(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    // Update student details
    let student = studentsData[studentIndex];
    student.group = req.body.group || student.group;
    student.name = req.body.name || student.name;
    student.gender = req.body.gender || student.gender;
    student.birthday = req.body.birthday || student.birthday;
    student.status = req.body.status || student.status;

    studentsData[studentIndex] = student;

    console.log('Student edited:', student);
    res.status(200).json({ message: "Student edited successfully", student: student });
});


app.delete('/api/v1/student', (req, res) => {
    const { id } = req.body;
    const studentIndex = studentsData.findIndex(student => student.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({ error: "server: Student not found" });
    }

    // Remove the student from the array
    res.status(200).json({ message: "Student deleted successfully" });
});

app.get('/api/v1/student/:id', (req, res) => {
    let studentFound = studentsData.find(student => student.id === req.params.id);
    if (!studentFound) {
        return res.status(404).json({ error: "Student not found" });
    }
    return res.status(200).json(studentFound);
});

app.get('/api/v1/students', (req, res) => {
    return res.status(200).json(studentsData);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});