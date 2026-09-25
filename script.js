const tasks = [];

const recurringTasks = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");
const taskCount = document.querySelector("#taskCount");
const clearTasks = document.querySelector("#clearTasks");
const currentDate = document.querySelector("#currentDate");
const emptyMessage = document.querySelector("#emptyMessage");
const recurringBtn = document.getElementById("recurring-btn");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveRecurringTasks() {
    localStorage.setItem("recurringTasks", JSON.stringify(recurringTasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks){
        const loadedTasks = JSON.parse(savedTasks);

        tasks.push(...loadedTasks);
    }
}

function loadRecurringTasks() {
    const savedRecurringTasks = localStorage.getItem("recurringTasks");

    if (savedRecurringTasks) {
        const loadedRecurringTasks = JSON.parse(savedRecurringTasks);

        Object.assign(recurringTasks, loadedRecurringTasks);
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

function updateEmptyMessage() {
    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

function getTodayKey() {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    return days[new Date().getDay()];
}

function getTodayRecurringTasks() {
    const todayKey = getTodayKey();

    return recurringTasks[todayKey];
}

function removeDuplicateRecurringTasks() {
    const seen = new Set();

    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];

        if (task.recurring) {
            const key = `${task.name}-${task.recurringDate}`;

            if (seen.has(key)) {
                tasks.splice(i, 1);
            } else {
                seen.add(key);
            }
        }
    }
}

function addTodaysRecurringTasks() {
    const todaysTasks = getTodayRecurringTasks();

    const today = new Date().toISOString().split("T")[0];

    todaysTasks.forEach(function(taskName) {

        const alreadyExists = tasks.some(function(task) {
            return task.name === taskName &&
                task.recurring === true &&
                task.recurringDate === today;
        });

        if (!alreadyExists) {
            const taskObject = {
                name: taskName,
                completed: false,
                recurring: true,
                recurringDate: today
            };

            tasks.push(taskObject);
        }
    });
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
    editButton.innerHTML = `
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
            <path d="M4 20l4.5-1L19 8.5a2.12 2.12 0 0 0-3-3L5.5 16 4 20z"></path>
        </svg>
    `;

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
                editButton.innerHTML = `
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
                        <path d="M4 20l4.5-1L19 8.5a2.12 2.12 0 0 0-3-3L5.5 16 4 20z"></path>
                    </svg>
                `;

                editing = false;

                return;
            }

            taskObject.name = newName;
            span.textContent = taskObject.name;

            editInput.replaceWith(span);
            editButton.innerHTML = `
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
                    <path d="M4 20l4.5-1L19 8.5a2.12 2.12 0 0 0-3-3L5.5 16 4 20z"></path>
                </svg>
            `;

            editing = false;

            saveTasks();
        } else{
            editInput = document.createElement("input");
            editInput.classList.add("edit-input");
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
        updateEmptyMessage();
        saveTasks();

        li.remove();

    });

    li.appendChild(checkbox);
    li.appendChild(span);

    if (taskObject.recurring) {
        const recurringIndicator = document.createElement("span");
        recurringIndicator.textContent = "↻";
        recurringIndicator.classList.add("recurring-indicator");

        li.appendChild(recurringIndicator);
    }

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    

    taskList.appendChild(li);

}

loadTasks();
loadRecurringTasks();
removeDuplicateRecurringTasks();
addTodaysRecurringTasks();
saveTasks();

updateTaskCount();
updateEmptyMessage();


const sortedTasks = [...tasks].sort(function(a, b) {
    return Number(b.recurring) - Number(a.recurring);
});

sortedTasks.forEach(function(task) {
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
    updateEmptyMessage();
    saveTasks();
    renderTask(taskObject);

    taskInput.value = "";
});

recurringBtn.addEventListener("click", function() {
    
    // Dark Overly and Recurring View
    const overlay = document.createElement("div");
    overlay.classList.add("recurring-overlay");

    const modal = document.createElement("div");
    modal.classList.add("recurring-modal");

    const title = document.createElement("h2");
    title.textContent = "Recurring Tasks";

    const modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");

    // Close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.classList.add("close-button");

    modalHeader.appendChild(title);
    modalHeader.appendChild(closeButton);

    modal.appendChild(modalHeader);

    closeButton.addEventListener("click", function() {
        overlay.remove();
    });

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    const weekdays = [
            "Monday","Tuesday","Wednesday","Thursday",
            "Friday","Saturday","Sunday"
        ];
    
    const weekdayContainer = document.createElement("div");
    weekdayContainer.classList.add("weekday-container");   
    modal.appendChild(weekdayContainer);
    
    weekdays.forEach(function(day) {

        const dayContainer = document.createElement("div");
        dayContainer.classList.add("day-container");

        const dayKey = day.toLowerCase();

        const weekday = document.createElement("h3");
        weekday.textContent = day;

        const taskContainer = document.createElement("div");
        taskContainer.classList.add("recurring-task-container");

        recurringTasks[dayKey].forEach(function(taskName) {

            const taskRow = document.createElement("div");
            taskRow.classList.add("recurring-task");

            const arrow = document.createElement("span");
            arrow.textContent = "›";
            arrow.classList.add("task-arrow");

            const taskText = document.createElement("span");
            taskText.textContent = taskName;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "×";
            deleteButton.classList.add("recurring-delete");

            deleteButton.addEventListener("click", function() {
                const taskIndex = recurringTasks[dayKey].indexOf(taskName);
                recurringTasks[dayKey].splice(taskIndex, 1);

                saveRecurringTasks();
                taskRow.remove();
            });

            taskRow.appendChild(arrow);
            taskRow.appendChild(taskText);
            taskRow.appendChild(deleteButton);

            taskContainer.appendChild(taskRow);
        });


        const taskComposer = document.createElement("div");
        taskComposer.classList.add("task-composer");

        const taskInput = document.createElement("input");
        taskInput.type = "text";
        taskInput.placeholder = "Enter recurring task...";

        const addButton = document.createElement("button");
        addButton.textContent = "+";

        addButton.addEventListener("click", function() {

            const taskName = taskInput.value.trim();

            if (taskName === "") {
                return;
            }

            recurringTasks[dayKey].push(taskName);
            saveRecurringTasks();

            const taskRow = document.createElement("div");
            taskRow.classList.add("recurring-task");

            const arrow = document.createElement("span");
            arrow.textContent = "›";
            arrow.classList.add("task-arrow");

            const taskText = document.createElement("span");
            taskText.textContent = taskName;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "×";
            deleteButton.classList.add("recurring-delete");

            deleteButton.addEventListener("click", function() {
                taskRow.remove();
            });

            taskRow.appendChild(arrow);
            taskRow.appendChild(taskText);
            taskRow.appendChild(deleteButton);

            taskContainer.insertBefore(taskRow, taskComposer);

            taskInput.value = "";
        });

        taskComposer.appendChild(taskInput);
        taskComposer.appendChild(addButton);

        taskContainer.appendChild(taskComposer);
        
        dayContainer.appendChild(weekday);
        dayContainer.appendChild(taskContainer);

        weekdayContainer.appendChild(dayContainer);

    });
            
});

console.log(getTodayRecurringTasks());

clearTasks.addEventListener("click", function() {

    if(tasks.length === 0){
        return
    }

    if (confirm("Are you sure you want to clear all tasks?")){
        tasks.length = 0;
        taskList.innerHTML = "";

        saveTasks();
        updateTaskCount();
        updateEmptyMessage();
    }
});