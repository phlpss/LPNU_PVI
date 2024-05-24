// CLIENT CODE
async function fetchTasks() {
    const response = await fetch('http://localhost:5000/tasks');
    const tasks = await response.json();
    tasks.forEach(task => {
        const lane = document.getElementById(`${task.lane}-lane`);
        const taskElement = createTaskElement(task.text, task._id);
        lane.appendChild(taskElement);
    });
}

fetchTasks();

// SCRIPT
const form = document.getElementById('todo-form');
const swimLanes = document.querySelectorAll('.swim-lane');
const draggables = document.querySelectorAll(".task");
const droppables = document.querySelectorAll(".swim-lane");

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const input = document.getElementById('todo-input');
    const taskText = input.value.trim();
    if (!taskText) return;

    const task = { text: taskText, lane: 'todo' };
    const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    const newTask = await response.json();
    const newTaskElement = createTaskElement(taskText, newTask._id);
    const todoLane = document.getElementById('todo-lane');
    todoLane.appendChild(newTaskElement);
    input.value = '';
});

swimLanes.forEach((lane) => {
    lane.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingTask = document.querySelector('.is-dragging');
        if (!draggingTask || draggingTask.parentNode === lane) return;

        const mouseY = e.clientY;
        const closestTask = getClosestTask(lane, mouseY);

        if (!closestTask) {
            lane.appendChild(draggingTask);
        } else {
            lane.insertBefore(draggingTask, closestTask);
        }
    });

    lane.addEventListener('drop', async (e) => {
        e.preventDefault();
        const draggingTask = document.querySelector('.is-dragging');
        const taskId = draggingTask.id;
        const newLane = lane.id.replace('-lane', '');

        await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({lane: newLane}),
        });

        lane.appendChild(draggingTask);
    });
});
draggables.forEach((task) => {
    task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
    });
    task.addEventListener("dragend", () => {
        task.classList.remove("is-dragging");
    });
});
droppables.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();

        const bottomTask = insertAboveTask(zone, e.clientY);
        const curTask = document.querySelector(".is-dragging");

        if (!bottomTask) {
            zone.appendChild(curTask);
        } else {
            zone.insertBefore(curTask, bottomTask);
        }
    });
});

function getClosestTask(lane, mouseY) {
    const tasks = Array.from(lane.querySelectorAll('.task'));
    return tasks.reduce((closest, task) => {
        const {top} = task.getBoundingClientRect();
        const offset = mouseY - top;
        const taskOffset = Math.abs(offset);
        if (taskOffset < closest.offset) {
            return {task, offset: taskOffset};
        } else {
            return closest;
        }
    }, {task: null, offset: Number.POSITIVE_INFINITY}).task;
}

function insertAboveTask(zone, mouseY) {
    const els = zone.querySelectorAll(".task:not(.is-dragging)");

    let closestTask = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    els.forEach((task) => {
        const {top} = task.getBoundingClientRect();
        const offset = mouseY - top;

        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    });

    return closestTask;
}

function createTaskElement(text, id) {
    const taskElement = document.createElement('p');
    taskElement.className = 'task';
    taskElement.draggable = true;
    taskElement.id = id;
    taskElement.innerText = text;

    taskElement.addEventListener('dragstart', () => {
        taskElement.classList.add('is-dragging');
    });

    taskElement.addEventListener('dragend', () => {
        taskElement.classList.remove('is-dragging');
    });

    return taskElement;
}