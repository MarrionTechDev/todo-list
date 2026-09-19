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

    // Reminder
    const reminderButton = document.createElement("button");
    reminderButton.innerHTML = `
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

    function updateReminderButton() {
        if (taskObject.reminder) {
            reminderButton.innerHTML = `
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
                    <path d="M21 12a9 9 0 1 1-2.64-6.36"></path>
                    <polyline points="21 3 21 9 15 9"></polyline>
                    <line x1="12" y1="7" x2="12" y2="12"></line>
                    <line x1="12" y1="12" x2="15" y2="14"></line>
                </svg>
            `;
        } else {
            reminderButton.innerHTML = `
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
        }
    }

    updateReminderButton();

    reminderButton.addEventListener("click", function() {

        const reminderWindow = document.createElement("div");
        reminderWindow.classList.add("reminder-window");
        document.body.appendChild(reminderWindow);

        // Heading
        const heading = document.createElement("h1");
        heading.textContent = "Reminder";
        heading.classList.add("reminder-heading");
        reminderWindow.appendChild(heading);

        // Close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.classList.add("close-button");

        reminderWindow.appendChild(closeButton);

        closeButton.addEventListener("click", function() {
            reminderWindow.remove();
        });

        if (taskObject.reminder) {

            // Reminder info
            const reminderInfo = document.createElement("div");
            reminderInfo.classList.add("reminder-info");
            reminderWindow.appendChild(reminderInfo);

            const savedDate = new Date(taskObject.reminder.date);

            const formattedDate = savedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            const [hours, minutes] = taskObject.reminder.time.split(":");

            const timeDate = new Date();
            timeDate.setHours(hours, minutes);

            const formattedTime = timeDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            });

            const reminderLabel = document.createElement("p");
            reminderLabel.textContent = "Reminder for:";
            reminderLabel.classList.add("reminder-label");

            const reminderDateText = document.createElement("p");
            reminderDateText.textContent =
                `${formattedDate} at ${formattedTime}`;
            reminderDateText.classList.add("reminder-date");

            // Create row
            const reminderInfoRow = document.createElement("div");
            reminderInfoRow.classList.add("reminder-info-row");

            // Clear button
            const clearReminderButton = document.createElement("button");
            clearReminderButton.textContent = "Clear";
            clearReminderButton.classList.add("clear-reminder-button");

            clearReminderButton.addEventListener("click", function() {
                taskObject.reminder = null;

                updateReminderButton();

                saveTasks();

                reminderInfo.remove();
            });
 
            reminderInfoRow.appendChild(reminderDateText);
            reminderInfoRow.appendChild(clearReminderButton);

            reminderInfo.appendChild(reminderLabel);
            reminderInfo.appendChild(reminderInfoRow);

        }
        
        // Current month
        const currentMonth = new Date();
        currentMonth.setDate(1);

        // Month navigation container
        const monthContainer = document.createElement("div");
        monthContainer.classList.add("month-container");
        reminderWindow.appendChild(monthContainer);
        
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
        reminderWindow.appendChild(weekdayContainer);

        const weekdays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

        weekdays.forEach(function(day) {
            const weekday = document.createElement("p");
            weekday.textContent = day;
            weekdayContainer.appendChild(weekday);
        });
        
        // Calendar
        const calendar = document.createElement("div");
        calendar.classList.add("calendar");
        reminderWindow.appendChild(calendar);

        let selectedDay;
        let selectedMonth;
        let selectedYear;

        if (taskObject.reminder) {
            const savedDate = new Date(taskObject.reminder.date);

            selectedDay = savedDate.getDate();
            selectedMonth = savedDate.getMonth();
            selectedYear = savedDate.getFullYear();
        } else {
            const today = new Date();

            selectedDay = today.getDate();
            selectedMonth = today.getMonth();
            selectedYear = today.getFullYear();
        }

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
        reminderWindow.appendChild(timeLabel);
        
        const timeInput = document.createElement("input");
        timeInput.type = "time";
        timeInput.classList.add("time-input");

        if (taskObject.reminder) {
            timeInput.value = taskObject.reminder.time;
        }

        reminderWindow.appendChild(timeInput);

        

        // Cancel button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";

        cancelButton.addEventListener("click", function() {
                reminderWindow.remove();
        });
    
        // Save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", function() {

            const reminderDate = new Date(
                selectedYear,
                selectedMonth,
                selectedDay
            );

            taskObject.reminder = {
                date: reminderDate,
                time: timeInput.value
            };

            updateReminderButton();
            saveTasks();
            reminderWindow.remove();

        });

        // Button Container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("reminder-buttons");

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);

        reminderWindow.appendChild(buttonContainer);

    });

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
        
        tasks.splice(taskIndex, 1);

        updateTaskCount();
        updateEmptyMessage();
        saveTasks();

        li.remove();

    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(reminderButton);
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