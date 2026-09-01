const tasks = [];

const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");
const taskCount = document.querySelector("#taskCount");
const clearTasks = document.querySelector("#clearTasks");
const currentDate = document.querySelector("#currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks){
        const loadedTasks = JSON.parse(savedTasks);

        tasks.push(...loadedTasks);
    }
}

function updateTaskCount() {
    let completedTasks = 0;

    tasks.forEach(function(task) {
        if (task.completed) {
            completedTasks++;
        }
    });

    taskCount.textContent = `${completedTasks} / ${tasks.length} completed`;
}


function renderTask(taskObject) {

    const li = document.createElement("li");
    li.classList.add("task");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");

    checkbox.checked = taskObject.completed;

    checkbox.addEventListener("change", function() {
        taskObject.completed = checkbox.checked;

        saveTasks();

        updateTaskCount();
    });

    const span = document.createElement("span");
    span.textContent = taskObject.name;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";

    let editInput;
    let editing = false;
    let originalName;

    editButton.addEventListener("click", function() {

        if (editing) {
            originalName = taskObject.name;

            const newName = editInput.value.trim();

            if (newName === ""){
                taskObject.name = originalName;

                span.textContent = originalName;

                editInput.replaceWith(span);

                editButton.textContent = "Edit";

                editing = false;

                return;
            }

            taskObject.name = newName;

            span.textContent = taskObject.name;

            editInput.replaceWith(span);

            editButton.textContent = "Edit";

            editing = false;

            saveTasks();
        } else{
            editInput = document.createElement("input");
        
            editInput.value = taskObject.name;

            span.replaceWith(editInput);

            editButton.textContent = "Save";

            editing = true;
        }
        
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");

    deleteButton.innerHTML = `
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="M19 6l-1 14H6L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
        </svg>
    `;
    deleteButton.addEventListener("click", function(event) {
        const taskIndex = tasks.indexOf(taskObject);
        
        tasks.splice(taskIndex, 1);

        updateTaskCount();

        saveTasks();

        event.target.parentElement.remove();

    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    

    taskList.appendChild(li);

}

loadTasks();

updateTaskCount();

tasks.forEach(function(task) {
    renderTask(task);
});


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = taskInput.value.trim();

    if (task === "") {
        return;
    }

    const taskObject = {
        name: task,
        completed: false
    };

    tasks.push(taskObject);

    updateTaskCount();

    saveTasks();

    renderTask(taskObject);

    taskInput.value = "";
});


clearTasks.addEventListener("click", function() {

    if(tasks.length === 0){
        return
    }

    if (confirm("Are you sure you want to clear all tasks?")){
        tasks.length = 0;

        taskList.innerHTML = "";

        saveTasks();

        updateTaskCount();
    }
});