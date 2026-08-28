const tasks = [];


const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");

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
    });

    const span = document.createElement("span");
    span.textContent = taskObject.name;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function(event) {
        const taskIndex = tasks.indexOf(taskObject)
        
        tasks.splice(taskIndex, 1);

        saveTasks();

        event.target.parentElement.remove();

    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    taskList.appendChild(li);

}

loadTasks();

tasks.forEach(function(task) {
    renderTask(task);
});


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = taskInput.value;

    if (task === "") {
        return;
    }

    const taskObject = {
        name: task,
        completed: false
    };

    tasks.push(taskObject);

    saveTasks();

    renderTask(taskObject);
});
