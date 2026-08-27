const tasks = [];

const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = taskInput.value;

    tasks.push(task);

    const li = document.createElement("li");
    li.classList.add("task");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");

    const span = document.createElement("span");
    span.textContent = task;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    taskList.appendChild(li);
});