const tasks = [];
const recurringTasks = [];
const skippedRecurringTasks = [];

let points = 0;
let totalPoints = 0;

const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");
const taskCount = document.querySelector("#taskCount");
const pointsDisplay = document.querySelector("#points");
const clearTasks = document.querySelector("#clearTasks");
const currentDate = document.querySelector("#currentDate");
const emptyMessage = document.querySelector("#emptyMessage");

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

function saveSkippedRecurringTasks() {
    localStorage.setItem("skippedRecurringTasks", JSON.stringify(skippedRecurringTasks));
}

function savePoints() {
    localStorage.setItem("points", points);
}

function saveTotalPoints() {
    localStorage.setItem("totalPoints", totalPoints);
}

function loadTotalPoints() {
    const savedTotalPoints = localStorage.getItem("totalPoints");

    if (savedTotalPoints) {
        totalPoints = Number(savedTotalPoints);
    }
}

function loadSkippedRecurringTasks() {
    const savedSkippedTasks = localStorage.getItem("skippedRecurringTasks");

    if (savedSkippedTasks) {
        const loadedSkippedTasks = JSON.parse(savedSkippedTasks);

        loadedSkippedTasks.forEach(function(task) {
            skippedRecurringTasks.push(task);
        });
    }
}

function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks){
        const loadedTasks = JSON.parse(savedTasks);

        loadedTasks.forEach(function(task) {

            if (task.recurringId) {
                const todayDate =
                    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

                if (task.date !== todayDate) {
                    return;
                }
            }

            tasks.push(task);
        });
    }
}

function loadRecurringTasks() {
    const savedRecurringTasks = localStorage.getItem("recurringTasks");

    if (savedRecurringTasks) {
        const loadedRecurringTasks = JSON.parse(savedRecurringTasks);

        loadedRecurringTasks.forEach(function(task) {
            recurringTasks.push(task);
        });
    }
}

function loadPoints() {
    const savedPoints = localStorage.getItem("points");

    if (savedPoints !== null) {
        points = Number(savedPoints);
    }

    let completedTasks = 0;

    tasks.forEach(function(task) {
        if (task.completed) {
            completedTasks++;
        }
    });

    if (completedTasks > points) {
        points += completedTasks - points;
        savePoints();
    }
}

function finishDay() {
    totalPoints += points;

    saveTotalPoints();

    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].completed) {
            tasks.splice(i, 1);
        }
    }

    points = 0;
    savePoints();

    saveTasks();
    updateTaskCount();
    updateEmptyMessage();
    renderAllTasks();
}

function generateRecurringTasksForToday() {
    const today = new Date();

    const todayName = today.toLocaleDateString("en-US", {
        weekday: "long"
    });

    const todayDate =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    recurringTasks.forEach(function(recurringTask) {

        if (recurringTask.days.includes(todayName)) {

            const alreadyExists = tasks.some(function(task) {
                return task.recurringId === recurringTask.id &&
                       task.date === todayDate;
            });

            const wasSkipped = skippedRecurringTasks.includes(
                `${recurringTask.id}-${todayDate}`
            );

            if (!alreadyExists && !wasSkipped) {

                const taskObject = {
                    id: `${recurringTask.id}-${todayDate}`,
                    recurringId: recurringTask.id,
                    name: recurringTask.name,
                    description: recurringTask.description || "",
                    completed: false,
                    date: todayDate
                };

                tasks.push(taskObject);

            }
        }
    });

    saveTasks();
}

function updateTaskCount() {
    let completedTasks = 0;

    tasks.forEach(function(task) {
        if (task.completed) {
            completedTasks++;
        }
    });

    taskCount.textContent = `${completedTasks} / ${tasks.length} completed`;
    pointsDisplay.textContent = `⭐ Points: ${totalPoints + points}`;
}

function updateEmptyMessage() {
    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

function renderTask(taskObject) {

    const li = document.createElement("li");
    li.classList.add("task");

    const taskRow = document.createElement("div");
    taskRow.classList.add("task-row");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");

    checkbox.checked = taskObject.completed;

    checkbox.addEventListener("change", function() {

        taskObject.completed = checkbox.checked;

        if (checkbox.checked) {
            points++;
        } else if (points > 0) {
            points--;
        }
        
        saveTasks();
        savePoints();
        updateTaskCount();
        renderAllTasks();

    });

    const span = document.createElement("span");
    span.textContent = taskObject.name;

    const descriptionButton = document.createElement("button");
    descriptionButton.classList.add("description-button");
    descriptionButton.textContent = ">";

    const descriptionArea = document.createElement("div");
    descriptionArea.classList.add("description-area");

    descriptionArea.style.display = "none";

    const descriptionInput = document.createElement("textarea");
    descriptionInput.classList.add("description-input");
    descriptionInput.placeholder = "Add notes or reminders...";

    descriptionInput.value = taskObject.description || "";

    descriptionInput.addEventListener("input", function() {

        taskObject.description = descriptionInput.value;

        if (taskObject.recurringId) {

            const recurringTask = recurringTasks.find(function(task) {
                return task.id === taskObject.recurringId;
            });

            if (recurringTask) {
                recurringTask.description = descriptionInput.value;
                saveRecurringTasks();
            }
        }

        saveTasks();
    });

    descriptionArea.appendChild(descriptionInput);

    descriptionButton.addEventListener("click", function() {

        if (descriptionArea.style.display === "none") {
            descriptionArea.style.display = "block";
            descriptionButton.classList.add("open");
        } else {
            descriptionArea.style.display = "none";
            descriptionButton.classList.remove("open");
        }

    });

    const recurringButton = document.createElement("button");
    recurringButton.classList.add("recurring-button");

    const savedRecurringTask = recurringTasks.find(function(task) {
        return task.id === taskObject.recurringId;
    });

    if (savedRecurringTask && savedRecurringTask.days.length > 0) {
        recurringButton.textContent = "⟳";
    } else {
        recurringButton.textContent = "↻";
    }

    recurringButton.addEventListener("click", function(){

        let recurringTask = recurringTasks.find(function(task) {
            return task.id === taskObject.recurringId;
        });

        if (!recurringTask) {
            recurringTask = {
                id: Date.now(),
                name: taskObject.name,
                days: [],
                description: taskObject.description || ""
            };
        }

        const recurringWindow = document.createElement("div");
        recurringWindow.classList.add("recurring-window");

        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.classList.add("close-button");

        const closeContainer = document.createElement("div");
        closeContainer.classList.add("close-container");

        closeContainer.appendChild(closeButton);
        recurringWindow.appendChild(closeContainer);

        //Weeday Container
        const weekdayContainer = document.createElement("div");
        weekdayContainer.classList.add("weekdays");

        recurringWindow.appendChild(weekdayContainer);

        const weekdays = [
            "Sunday","Monday","Tuesday","Wednesday",
            "Thursday","Friday","Saturday"
        ];

        weekdays.forEach(function(day) {

            const weekday = document.createElement("button");
            weekday.textContent = day.charAt(0);

            if (recurringTask.days.includes(day)) {
                weekday.classList.add("selected");
            }

            weekday.addEventListener("click", function() {
                weekday.classList.toggle("selected");

                if (weekday.classList.contains("selected")) {
                    recurringTask.days.push(day);
                } else {
                    const index = recurringTask.days.indexOf(day);
                    recurringTask.days.splice(index, 1);
                }

                // Update recurring indicator
                if (recurringTask.days.length > 0) {
                    recurringButton.textContent = "⟳";
                } else {
                    recurringButton.textContent = "↻";

                    const taskIndex = recurringTasks.findIndex(function(task) {
                        return task.id === recurringTask.id;
                    });

                    if (taskIndex !== -1) {
                        recurringTasks.splice(taskIndex, 1);
                        saveRecurringTasks();
                    }
                }
            });

            weekdayContainer.appendChild(weekday);
        });

        li.appendChild(recurringWindow);

        closeButton.addEventListener("click", function() {

            if (recurringTask.days.length > 0) {

                const existingTask = recurringTasks.find(function(task) {
                    return task.id === recurringTask.id;
                });

                if (!existingTask) {
                    recurringTasks.push(recurringTask);

                    const taskIndex = tasks.indexOf(taskObject);

                    if (taskIndex !== -1) {
                        tasks.splice(taskIndex, 1);
                    }

                    li.remove();
                }
            }

            saveRecurringTasks();
            saveTasks();

            generateRecurringTasksForToday();
            renderAllTasks();

            recurringWindow.remove();
        });

    })

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
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

        if (taskObject.recurringId) {
            skippedRecurringTasks.push(taskObject.id);
            saveSkippedRecurringTasks();
        }
        
        tasks.splice(taskIndex, 1);

        updateTaskCount();
        updateEmptyMessage();
        saveTasks();

        li.remove();
    });

    const taskActions = document.createElement("div");
    taskActions.classList.add("task-actions");

    taskActions.appendChild(descriptionButton);
    taskActions.appendChild(recurringButton);
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);

    taskRow.appendChild(checkbox);
    taskRow.appendChild(span);
    taskRow.appendChild(taskActions);

    li.appendChild(taskRow);
    li.appendChild(descriptionArea);

    taskList.appendChild(li);

}

function renderAllTasks() {
    taskList.innerHTML = "";

    // Uncompleted recurring tasks
    tasks
        .filter(function(task) {
            return task.recurringId !== undefined && !task.completed;
        })
        .forEach(function(task) {
            renderTask(task);
        });

    // Uncompleted normal tasks
    tasks
        .filter(function(task) {
            return task.recurringId === undefined && !task.completed;
        })
        .forEach(function(task) {
            renderTask(task);
        });

    // Completed divider
    const hasCompletedTasks = tasks.some(function(task) {
        return task.completed;
    });

    if (hasCompletedTasks) {
        const divider = document.createElement("li");
        divider.classList.add("completed-divider");
        divider.textContent = "Completed";

        taskList.appendChild(divider);
    }

    // Completed recurring tasks
    tasks
        .filter(function(task) {
            return task.recurringId !== undefined && task.completed;
        })
        .forEach(function(task) {
            renderTask(task);
        });

    // Completed normal tasks
    tasks
        .filter(function(task) {
            return task.recurringId === undefined && task.completed;
        })
        .forEach(function(task) {
            renderTask(task);
        });
}

loadTasks();
loadRecurringTasks();
loadSkippedRecurringTasks();
loadTotalPoints();
loadPoints();

generateRecurringTasksForToday();
updateTaskCount();
updateEmptyMessage();

renderAllTasks();

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = taskInput.value.trim();

    if (task === "") {
        return;
    }

    const taskObject = {
        name: task,
        description: "",
        completed: false
    };

    tasks.push(taskObject);

    updateTaskCount();
    updateEmptyMessage();
    saveTasks();
    renderAllTasks();

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

        updateEmptyMessage();
    }
});