document.getElementById('addTaskForm').onsubmit = function(event) {
    event.preventDefault();

    // Get task name and priority
    var taskName = document.getElementById('taskName').value;
    var taskPriority = document.getElementById('taskPriority').value;
    var taskList = document.getElementById('taskList');

    // Create the list item
    var li = document.createElement('li');
    li.textContent = taskName;
    li.className = taskPriority + '-priority';

    // Add delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        taskList.removeChild(li);
    };
    li.appendChild(deleteBtn);

    // Add the list item to the list
    taskList.appendChild(li);

    // Clear the input
    document.getElementById('taskName').value = '';
};