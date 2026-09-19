const tasks = [];

const taskInput = document.querySelector("#taskInput");
const form = document.querySelector("form");
const taskList = document.querySelector("ul");
const taskCount = document.querySelector("#taskCount");
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

    // Scheduler
    const scheduleButton = document.createElement("button");
    scheduleButton.innerHTML = `
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
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    `;

    scheduleButton.addEventListener("click", function() {

        const scheduleWindow = document.createElement("div");
        scheduleWindow.classList.add("schedule-window");
        document.body.appendChild(scheduleWindow);

        // Heading
        const heading = document.createElement("h1");
        heading.textContent = "Schedule";
        heading.classList.add("schedule-heading");
        scheduleWindow.appendChild(heading);
        
        // Current month
        const currentMonth = new Date(2026, 8, 1);

        // Month navigation container
        const monthContainer = document.createElement("div");
        monthContainer.classList.add("month-container");
        scheduleWindow.appendChild(monthContainer);
        
        const monthNames = [
                "January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"
            ];

        // Previous month button
        const previousMonth = document.createElement("button");
        previousMonth.textContent = "<";
        previousMonth.addEventListener("click", function(){
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            updateMonthYear();
            renderCalendar();
        })
        monthContainer.appendChild(previousMonth);

        // Create month + year text and update it
        const monthYear = document.createElement("p");
        monthContainer.appendChild(monthYear);

        function updateMonthYear() {
            const month = monthNames[currentMonth.getMonth()]
            const year = currentMonth.getFullYear()

            monthYear.textContent = `${month} ${year}`;
        }
        updateMonthYear();

        // Next month button
        const nextMonth = document.createElement("button");
        nextMonth.textContent = ">";
        nextMonth.addEventListener("click", function(){
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            updateMonthYear();
            renderCalendar();
        })
        monthContainer.appendChild(nextMonth);

        // Weekdays
        const weekdayContainer = document.createElement("div");
        weekdayContainer.classList.add("weekdays");
        scheduleWindow.appendChild(weekdayContainer);

        const weekdays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

        weekdays.forEach(function(day) {
            const weekday = document.createElement("p");
            weekday.textContent = day;
            weekdayContainer.appendChild(weekday);
        });
        
        // Calendar
        const calendar = document.createElement("div");
        calendar.classList.add("calendar");
        scheduleWindow.appendChild(calendar);

        let selectedDay = new Date().getDate();
        let selectedMonth = new Date().getMonth();
        let selectedYear = new Date().getFullYear();

        function renderCalendar() {
            calendar.innerHTML = "";

            // Calendar days
            const daysInMonth = new Date(currentMonth.getFullYear(),currentMonth.getMonth() + 1, 0);
            
            // Empty spaces before first day
            for (let i = 0; i < currentMonth.getDay(); i++) {
                const emptyDay = document.createElement("p");
                calendar.appendChild(emptyDay);
            }

            // Actual calendar days with buttons
            for (let day = 1; day <= daysInMonth.getDate(); day++){
                const dayElement = document.createElement("button");
                dayElement.classList.add("calendar-day");
                dayElement.textContent = day;

                // Check if this day is today
                if (
                    day === today.getDate() &&
                    currentMonth.getMonth() === today.getMonth() &&
                    currentMonth.getFullYear() === today.getFullYear()
                ) {
                    dayElement.classList.add("today");
                }
                
                // Check if this day was previously selected
                if (
                    day === selectedDay &&
                    currentMonth.getMonth() === selectedMonth &&
                    currentMonth.getFullYear() === selectedYear
                ) {
                    dayElement.classList.add("selected");
                }

                // Select a day
                dayElement.addEventListener("click", function() {
                    const oldSelectedDay = calendar.querySelector(".selected");

                    if (oldSelectedDay) {
                        oldSelectedDay.classList.remove("selected");
                    }

                    selectedDay = day;
                    selectedMonth = currentMonth.getMonth();
                    selectedYear = currentMonth.getFullYear();

                    dayElement.classList.add("selected");
                });

                calendar.appendChild(dayElement); 
            } 
        }
        renderCalendar();

        const timeLabel = document.createElement("label");
        timeLabel.textContent = "Time:";
        timeLabel.classList.add("time-label");
        scheduleWindow.appendChild(timeLabel);
        
        const timeInput = document.createElement("input");
        timeInput.type = "time";
        timeInput.classList.add("time-input");
        scheduleWindow.appendChild(timeInput);

        // Cancel button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";

        cancelButton.addEventListener("click", function() {
                scheduleWindow.remove();
        });
    
        // Save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", function() {

            const scheduledDate = new Date(
                selectedYear,
                selectedMonth,
                selectedDay
            );

            taskObject.schedule = {
                date: scheduledDate,
                time: timeInput.value
            };

            saveTasks();
            scheduleWindow.remove();

        });

        // Button Container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("schedule-buttons");

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);

        scheduleWindow.appendChild(buttonContainer);

    });

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
    li.appendChild(scheduleButton);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    
    taskList.appendChild(li);

}

loadTasks();

updateTaskCount();

updateEmptyMessage();

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

    updateEmptyMessage();

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

        updateEmptyMessage();
    }
});