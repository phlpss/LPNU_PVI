import {postStudent} from "./HTTPClient.js";
import {putStudent} from "./HTTPClient.js";
import {delStudent} from "./HTTPClient.js";

let currentPage = 1;
const studentsPerPage = 10;

$(function () {
    renderStudents(currentPage);

    $('#dashboardTab').click(function (e) {
        openTab(e, 'Dashboard');
    });
    $('#studentsTab').click(function (e) {
        openTab(e, 'Students');
    });
    $('#tasksTab').click(function (e) {
        openTab(e, 'Tasks');
    });

    // Modal Close Event Listeners
    $('.modal .cancelStudentBt').click(function () {
        $(this).closest('.modal').hide();
    });

    // Modal Background Click Event Listeners
    $(window).click(function (e) {
        if ($(e.target).hasClass('modal')) {
            $(e.target).hide();
        }
    });

    $('#addStudentButton').click(function () {
        $('#addModal').show();
    });
    $('#createStudentButton').click(createStudent);
    $('#updateStudentButton').click(function () {
        const studentId = 1;    /////// get student id correctly
        if (studentId) {
            updateStudent(studentId);
        } else {
            alert("No student selected for editing");
        }
    });
    $('#confirmDeleteStudent').click(function () {
        deleteStudent(1);
    });
    $('#closeAddStudentModal').click(function () {
        $('#addModal').hide();
    })
    $('#openEditStudentModal').click(function () {
        $('#editModal').show();
    })
    $('#closeEditStudentModal').click(function () {
        $('#editModal').hide();
    })
    $('#openDeleteConfirmationModal').click(function () {
        $('#deleteModal').show();
    })
    $('#closeDeleteConfirmationModal').click(function () {
        $('#deleteModal').hide();
    })

    $('#previousPage').click(function () {
        if (currentPage > 1) {
            currentPage--;
            renderStudents(currentPage);
        }
    })
    $('#nextPage').click(function () {
        const totalPages = Math.ceil(studentsData.length / studentsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderStudents(currentPage);
        }
    })

    // Select All Checkboxes Event Listener
    $("#studentsTable thead input[type='checkbox']").change(function () {
        $("#studentsTable tbody input[type='checkbox']").prop('checked', this.checked);
    });

    $(window).resize(resizeTableHeaders);
    resizeTableHeaders();
});

class Student {
    static idCounter = 0;

    constructor(group, name, gender, birthday) {
        this.id = Student.idCounter++;
        this.group = group;
        this.name = name;
        this.gender = gender;
        this.birthday = birthday;
        this.status = "Active";
    }
}

const studentsData = [
    new Student("PZ-22", "Katya Hilfanova", "Female", "2005-01-12"),
    new Student("PZ-28", "Olia Hnatetska", "Female", "2000-02-02", "Inactive"),
];

function openTab(evt, tabName) {
    $(".tabcontent").hide();
    $(".tablinks").removeClass("active");
    $("#" + tabName).show();
    $(evt.currentTarget).addClass("active");
}

function renderStudents(page) {
    const startIndex = (page - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const students = studentsData.slice(startIndex, endIndex);

    const $tableBody = $("#studentsTableBody");
    $tableBody.empty();

    $.each(students, function (index, student) {
        const $row = $('<tr></tr>');
        $row.append($('<td></td>').html('<input type="checkbox">'));
        $row.append($('<td></td>').text(student.group));
        $row.append($('<td></td>').text(student.name));
        $row.append($('<td></td>').text(student.gender));
        $row.append($('<td></td>').text(student.birthday));

        const statusClass = student.status === "Active" ? "status-active" : "status-inactive";
        const $statusIndicator = $('<span></span>').addClass(statusClass).attr('title', student.status);
        $row.append($('<td></td>').append($statusIndicator));

        const $deleteButton = $('<button></button>')
            .html('<img src="assets/delete_icon.svg" alt="Delete Icon" style="width: 16px; height: 16px;">')
            .addClass("delete-button")
            .click(function () {
                // Retrieve the whole student object
                const student = studentsData[index + startIndex];
                $('#deleteModal').show();
                // deleteStudent(student.id);
            });

        const $editButton = $('<button></button>')
            .html('<img src="assets/edit_icon.svg" alt="Edit Icon" style="width: 16px; height: 16px;">')
            .addClass("edit-button")
            .click(function () {
                const student = studentsData[index + startIndex];
                editStudent(student.id);
            });

        const $spacer = $('<span></span>').css('marginRight', '5px');

        const $optionsCell = $('<td></td>');
        $optionsCell.append($deleteButton, $spacer, $editButton);
        $row.append($optionsCell);

        $tableBody.append($row);
    });

    updateAllCheckboxes($("#studentsTable thead input[type='checkbox']").prop('checked'));
}

function updateAllCheckboxes(checked) {
    $("#studentsTable tbody input[type='checkbox']").prop('checked', checked);
}

function createStudent() {
    const group = $('#group').val();
    const fname = $('#fname').val();
    const lname = $('#lname').val();
    const gender = $('#gender').val();
    const bday = $('#bday').val();

    // if (!group || !fname || !lname || !gender || !bday) {
    //     alert('Please fill in all fields.');
    //     return;
    // }
    //
    // const namePattern = /^[A-Z][a-z]+$/;
    // if (!fname.trim() || !namePattern.test(fname)) {
    //     alert('First name must start with an uppercase letter and be followed by lowercase letters.');
    //     return;
    // }
    // if (!lname.trim() || !namePattern.test(lname)) {
    //     alert('Last name must start with an uppercase letter and be followed by lowercase letters.');
    //     return;
    // }

    addStudent(group, fname + ' ' + lname, gender, bday);
    $('#addModal').hide();
}

function addStudent(group, name, gender, birthday) {
    const newStudent = new Student(group, name, gender, birthday);

    postStudent(newStudent).then(data => {
        studentsData.push(newStudent);
        renderStudents(currentPage);
    }).catch(error => {
        console.error('Error sending data to the server:', error);
        if (error && error.error) {
            alert(error.error);
        }
    });
}

function updateStudent(studentId) {
    const group = $('#edit-group').val();
    const fname = $('#edit-fname').val();
    const lname = $('#edit-lname').val();
    const gender = $('#edit-gender').val();
    const bday = $('#edit-bday').val();

    // const namePattern = /^[A-Z][a-z]+$/;
    // if (!fname.trim() || !namePattern.test(fname) || !lname.trim() || !namePattern.test(lname)) {
    //     alert('Names must start with an uppercase letter and be followed by lowercase letters.');
    //     return;
    // }
    // if (!group || !gender || !bday) {
    //     alert('Please fill in all fields.');
    //     return;
    // }

    const updatedStudent = {
        id: studentId,
        group: group,
        name: fname + ' ' + lname,
        gender: gender,
        birthday: bday
    };

    putStudent(updatedStudent).then(data => {
        const index = studentsData.findIndex(student => student.id === studentId);
        studentsData[index] = updatedStudent;
        renderStudents(currentPage);
        $('#editModal').hide();
    }).catch(error => {
        console.error('Error updating student:', error);
        if (error && error.error) {
            alert(error.error);
        }
    });
}

function editStudent(studentId) {
    const studentToEdit = studentsData.find(s => s.id === studentId);
    if (!studentToEdit) {
        console.error('editStudent: Student not found');
        return;
    }

    $('#edit-studentId').val(studentToEdit.id);
    $('#edit-group').val(studentToEdit.group);
    const nameParts = studentToEdit.name.split(' ');
    $('#edit-fname').val(nameParts[0]);
    $('#edit-lname').val(nameParts.slice(1).join(' '));
    $('#edit-gender').val(studentToEdit.gender);
    $('#edit-bday').val(studentToEdit.birthday);

    // openEditStudentModal();
    $('#editModal').show();
}

function deleteStudent(studentId) {
    const studentToDelete = studentsData.find(s => s.id === studentId);
    if (!studentToDelete) {
        console.error('Student not found');
        return;
    }

    delStudent(studentToDelete).then(() => {
        const index = studentsData.findIndex(s => s.id === studentId);
        if (index !== -1) {
            studentsData.splice(index, 1);
        }
        renderStudents(currentPage);
        $('#deleteModal').hide();
    }).catch(error => {
        console.error('Error deleting student:', error);
        if (error && error.error) {
            alert(error.error);
        }
    });
}

function resizeTableHeaders() {
    if ($(window).width() < 600) {
        // Update table headers for small screens
        $('#studentsTable th:nth-child(6)').text('S');
        $('#studentsTable th:nth-child(2)').text('G');
        $('#studentsTable th:nth-child(4)').text('B');
    } else {
        // Reset table headers for larger screens
        $('#studentsTable th:nth-child(6)').text('Status');
        $('#studentsTable th:nth-child(2)').text('Group');
        $('#studentsTable th:nth-child(4)').text('Birthday');
    }
}