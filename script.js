// Local Storage Key Handles
const STORAGE_KEY = "planner_assignments_data";
const THEME_KEY = "planner_dashboard_theme";

// Master Task Array State
let assignments = [];

// Initialize Dashboard App Configuration when window builds
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadTasks();
});

// Create and Add a Task (Matches your HTML onclick="addTask()")
function addTask() {
    let title = document.getElementById("title").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let date = document.getElementById("date").value;
    let priority = document.getElementById("priority").value;

    if (title === "") {
        alert("Please enter an assignment title.");
        return;
    }

    // Set a default string fallback if the date input is left empty
    let defaultDate = date ? date : new Date().toISOString().split('T')[0];

    // Build the master data object for this task item
    let taskObj = {
        id: "task_" + Date.now(),
        title: title,
        subject: subject ? subject : 'No specific subject',
        date: defaultDate,
        priority: priority,
        completed: false
    };

    // Push into our state tracking array, update disk memory, and re-render
    assignments.push(taskObj);
    saveTasks();
    filterAndRenderTasks();

    // Reset Form fields for clean next-input workflow
    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("date").value = "";
}

// Save data array back to LocalStorage string matrix
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

// Fetch saved arrays from localStorage data cache
function loadTasks() {
    let rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        assignments = JSON.parse(rawData);
    } else {
        assignments = [];
    }
    filterAndRenderTasks();
}

// The master rendering engine (Handles Search, Filters, and DOM updates)
function filterAndRenderTasks() {
    let searchQuery = document.getElementById("searchBar").value.toLowerCase();
    let sortCriterion = document.getElementById("sortSelect").value;

    // 1. Filter out list nodes matches using active Search query
    let filtered = assignments.filter(task => {
        return task.title.toLowerCase().includes(searchQuery) || 
               task.subject.toLowerCase().includes(searchQuery);
    });

    // 2. Process sorting algorithms depending on dynamic configuration selected
    if (sortCriterion === "date") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortCriterion === "priority") {
        const order = { "High": 1, "Medium": 2, "Low": 3 };
        filtered.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortCriterion === "subject") {
        filtered.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    // Clear existing raw lists before running the DOM drawing layout build loop
    document.getElementById("taskList").innerHTML = "";
    document.getElementById("completedTaskList").innerHTML = "";

    // 3. Render items into the UI panels dynamically
    filtered.forEach(task => {
        let li = document.createElement("div");
        li.className = `task ${task.priority.toLowerCase()} ${task.completed ? 'task-completed' : ''}`;
        li.id = task.id;

        // Check if an uncompleted active task requires an urgent overdue warning banner badge
        let urgencyBadgeHTML = "";
        if (!task.completed) {
            let relativeStatus = checkUrgency(task.date);
            if (relativeStatus === "overdue") urgencyBadgeHTML = `<span class="warning-pill">⚠️ Overdue</span>`;
            else if (relativeStatus === "tomorrow") urgencyBadgeHTML = `<span class="warning-pill">⚠️ Due Tomorrow</span>`;
        }

        li.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete('${task.id}')">
            </div>
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.subject}</p>
                <div class="task-meta">
                    <span class="task-date-display" data-rawdate="${task.date}">📅 ${formatDate(task.date)}</span>
                    <span class="priority-badge">${task.priority}</span>
                    ${urgencyBadgeHTML}
                </div>
            </div>
            <div class="task-actions">
                ${!task.completed ? `<button class="edit-btn" onclick="toggleEditDate('${task.id}', this)">Edit Date</button>` : ''}
                <button class="delete-btn" onclick="removeTask('${task.id}')">Delete</button>
            </div>
        `;

        if (task.completed) {
            document.getElementById("completedTaskList").appendChild(li);
        } else {
            document.getElementById("taskList").appendChild(li);
        }
    });

    // Run updates on the stat counter nodes and calculation progress matrix fill bar
    updateStatsAndProgressBar();
}

// Compare target task end dates to today's local midnight clock baseline
function checkUrgency(dateStr) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    let diffTime = targetDate - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays === 1) return "tomorrow";
    return "safe";
}

// Handle Checkbox item complete/undo dynamic structural layout changes
function toggleTaskComplete(id) {
    let task = assignments.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        filterAndRenderTasks();
    }
}

// Dynamic Inline Date modification form input toggler systems
function toggleEditDate(id, buttonElement) {
    let taskCard = document.getElementById(id);
    let dateDisplay = taskCard.querySelector(".task-date-display");
    let currentRawDate = dateDisplay.getAttribute("data-rawdate");

    if (buttonElement.innerText === "Edit Date") {
        dateDisplay.innerHTML = `<input type="date" class="inline-date-edit" value="${currentRawDate}">`;
        buttonElement.innerText = "Save";
        buttonElement.style.background = "#dcfce7";
        buttonElement.style.color = "#15803d";
    } else {
        let newRawDate = dateDisplay.querySelector(".inline-date-edit").value;
        if (!newRawDate) newRawDate = currentRawDate;

        let task = assignments.find(t => t.id === id);
        if (task) {
            task.date = newRawDate;
            saveTasks();
        }
        buttonElement.innerText = "Edit Date";
        buttonElement.style.background = "";
        buttonElement.style.color = "";
        filterAndRenderTasks();
    }
}

// Drop single indexed task items completely out of data tree array
function removeTask(id) {
    assignments = assignments.filter(t => t.id !== id);
    saveTasks();
    filterAndRenderTasks();
}

// Transform raw yyyy-mm-dd dates into readable dd/mm/yyyy notation strings
function formatDate(dateString) {
    return dateString.split('-').reverse().join('/');
}

// Re-calculate statistics data math metrics and live scale the CSS progress percentage fills
function updateStatsAndProgressBar() {
    let pendingCount = assignments.filter(t => !t.completed).length;
    let completedCount = assignments.filter(t => t.completed).length;
    let totalCount = assignments.length;

    document.getElementById("total").innerText = totalCount;
    document.getElementById("pending").innerText = pendingCount;
    document.getElementById("done").innerText = completedCount;

    // Safe mathematical ratio percent assignment loop computations 
    let progressRatio = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    document.getElementById("progressPercent").innerText = `${progressRatio}%`;
    document.getElementById("progressBarFill").style.width = `${progressRatio}%`;
}

// Smooth Dark Mode State Handler Strategy Toggles
function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute("data-theme");
    let targetTheme = (currentTheme === "dark") ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", targetTheme);
    document.getElementById("themeToggle").innerText = (targetTheme === "dark") ? "☀️" : "🌙";
    localStorage.setItem(THEME_KEY, targetTheme);
}

function loadTheme() {
    let savedTheme = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.getElementById("themeToggle").innerText = (savedTheme === "dark") ? "☀️" : "🌙";
}