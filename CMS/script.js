let currentPage = 1;
const studentsPerPage = 10;

$(function () {
    renderStudents(currentPage);

    // Event Listeners for Tabs
    // $('#dashboardTab, #studentsTab, #tasksTab').click(function(e) {
    //     openTab(e, this.id);
    // });

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

    // Select All Checkboxes Event Listener
    $("#studentsTable thead input[type='checkbox']").change(function () {
        $("#studentsTable tbody input[type='checkbox']").prop('checked', this.checked);
    });

    $(window).resize(resizeTableHeaders);
    resizeTableHeaders(); // Initial call to set correct labels
});

class Student {
    static idCounter = 0;
    constructor(id, group, name, gender, birthday, status = "Active") {
        this.id = Student.idCounter++;
        this.group = group;
        this.name = name;
        this.gender = gender;
        this.birthday = birthday;
        this.status = status;
    }
}

const studentsData = [
    new Student("3000", "PZ-22", "Katya Hilfanova", "Female", "2005-01-12"),
    new Student("4000", "PZ-28", "Olia Hnatetska", "Female", "2000-02-02", "Inactive"),
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
                deleteStudent(index + startIndex);
            });

        const $editButton = $('<button></button>')
            .html('<img src="assets/edit_icon.svg" alt="Edit Icon" style="width: 16px; height: 16px;">')
            .addClass("edit-button")
            .click(function () {
                editStudent(index + startIndex);
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
    const tempStudentId = $('#add-studentId').val();
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

    addStudent(tempStudentId, group, fname + ' ' + lname, gender, bday);
    $('#addModal').hide();
}

function addStudent(studentId, group, name, gender, birthday) {
    const newStudent = new Student(studentId, group, name, gender, birthday);

    sendStudentDataToServer(newStudent, 'add').then(data => {
        studentsData.push(newStudent);
        renderStudents(currentPage);
    }).catch(error => {
        console.error('Error sending data to the server:', error);
        if (error && error.error) {
            alert(error.error);
        }
    });
}

function generateStudentId() {
    return Math.floor(Math.random() * 1000000).toString();
}

function sendStudentDataToServer(student, operation) {
    console.log('Operation:', operation);
    let url = 'http://localhost:8080/api/v1/customer';
    let method = 'POST';

    switch (operation) {
        case 'add':
            // URL remains the same, method is POST
            break;
        case 'edit':
            url += `/${student.id}`; // Adjusted for PUT request
            method = 'PUT';
            break;
        case 'delete':
            url += `/${student.id}`; // Adjusted for DELETE request
            method = 'DELETE';
            break;
        default:
            throw new Error('Invalid operation');
    }

    const data = operation !== 'delete' ? JSON.stringify({
        Id: (student.id).toString(),
        Group: student.group,
        Name: student.name,
        Gender: student.gender,
        Birthday: student.birthday,
        Status: student.status
    }) : null;

    console.log(data);


    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorResponse => {
                return Promise.reject(errorResponse);
            });
        }
    }).then(data => {
        console.log('Success:', data);
        return data;
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        return Promise.reject(error);
    });
}

// Function to open the 'Add Student' modal
function OpenAddStudentModal() {
    const tempStudentId = generateStudentId();
    $('#add-studentId').val(tempStudentId);

    $('#addModal').show();
}

// Function to close the 'Add Student' modal
function CloseAddStudentModal() {
    $('#addModal').hide();
}

// Function to delete a student
function deleteStudent(index) {
    currentDeleteIndex = index;
    OpenDeleteConfirmationModal();
}

// Function to confirm the deletion of a student
function confirmDeleteStudent() {
    studentsData.splice(currentDeleteIndex, 1);
    renderStudents(currentPage);
    CloseDeleteConfirmationModal();
}

// Function to open the 'Delete Confirmation' modal
function OpenDeleteConfirmationModal() {
    $('#deleteModal').show();
}

// Function to close the 'Delete Confirmation' modal
function CloseDeleteConfirmationModal() {
    $('#deleteModal').hide();
}

// Function to edit a student
function editStudent(index) {
    currentEditIndex = index;
    const student = studentsData[index];
    $('#edit-studentId').val(student.id);

    $('#edit-group').val(student.group);
    const nameParts = student.name.split(' ');
    $('#edit-fname').val(nameParts[0]);
    $('#edit-lname').val(nameParts.slice(1).join(' '));
    $('#edit-gender').val(student.gender);
    $('#edit-bday').val(student.birthday);

    OpenEditStudentModal();
}

// Function to open the 'Edit Student' modal
function OpenEditStudentModal() {
    $('#editModal').show();
}

// Function to close the 'Edit Student' modal
function CloseEditStudentModal() {
    $('#editModal').hide();
}

// Function to update a student's information
function updateStudent() {
    const group = $('#edit-group').val();
    const fname = $('#edit-fname').val();
    const lname = $('#edit-lname').val();
    const gender = $('#edit-gender').val();
    const bday = $('#edit-bday').val();

    const namePattern = /^[A-Z][a-z]+$/;
    if (!fname.trim() || !namePattern.test(fname)) {
        alert('First name must start with an uppercase letter and be followed by lowercase letters.');
        return;
    }
    if (!lname.trim() || !namePattern.test(lname)) {
        alert('Last name must start with an uppercase letter and be followed by lowercase letters.');
        return;
    }

    if (!group || !gender || !bday) {
        alert('Please fill in all fields.');
        return;
    }

    studentsData[currentEditIndex] = {
        group: group,
        name: fname + ' ' + lname,
        gender: gender,
        birthday: bday,
        status: "Active"
    };
    renderStudents(currentPage);
    CloseEditStudentModal();
}

// Function to navigate to the previous page
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderStudents(currentPage);
    }
}

// Function to navigate to the next page
function nextPage() {
    const totalPages = Math.ceil(studentsData.length / studentsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderStudents(currentPage);
    }
}

// Function to resize table headers based on window width
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