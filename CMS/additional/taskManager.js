$(document).ready(function() {
    $('#addTaskForm').on('submit', function(event) {
        event.preventDefault();

        // Get task name and priority
        var taskName = $('#taskName').val();
        var taskPriority = $('#taskPriority').val();

        // Create the list item with Bootstrap classes
        var li = $('<li></li>')
            .addClass('list-group-item')
            .text(taskName);

        // Apply priority-based styling
        switch(taskPriority) {
            case 'high':
                li.addClass('list-group-item-danger');
                break;
            case 'medium':
                li.addClass('list-group-item-warning');
                break;
            case 'low':
                li.addClass('list-group-item-success');
                break;
        }

        // Create and add the delete button
        var deleteBtn = $('<button>Delete</button>')
            .addClass('btn btn-danger btn-sm')
            .click(function() {
                li.remove();
            });

        // Append the delete button to the list item
        li.append(deleteBtn);

        // Add the list item to the task list
        $('#taskList').append(li);

        // Clear the input
        $('#taskName').val('');
    });
});