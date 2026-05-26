// Local Storage Key Handles
const STORAGE_KEY = "planner_assignments_data";
const THEME_KEY = "planner_dashboard_theme";

// Master Task Array State
let assignments = [];

// Initialize Dashboard App Configuration
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadTasks();
});

// Create and Add a Task
function handleAddTaskClick() {
    let title = document.getElementById("title").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let date = document.getElementById("date").value;
    let priority = document.getElementById("priority").value;

    if (title === "") {
        alert("Please enter an assignment title.");
        return;
    }

    let defaultDate = date ? date : new Date().toISOString().split('T')[0];

    // Form Object Node Model
    let taskObj = {
        id: "task_" + Date.now(),
        title: title,
        subject: subject ? subject : 'No specific subject',
        date: defaultDate,
        priority: priority,
        completed: false
    };

    assignments.push(taskObj);
    saveTasks();
    filterAndRenderTasks();

    // Reset Form fields
    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("date").value = "";
}

// Logic to Save and Load to browser Storage Matrix
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

function loadTasks() {
    let rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        assignments = JSON.parse(rawData);
    } else {
        assignments = [];
    }
    filterAndRenderTasks();
}

// Process rendering with combined pipeline handling Sorting and Searching
function filterAndRenderTasks() {
    let searchQuery = document.getElementById("searchBar").value.toLowerCase();
    let sortCriterion = document.getElementById("sortSelect").value;

    let filtered = assignments.filter(task => {
        return task.title.toLowerCase().includes(searchQuery) || 
               task.subject.toLowerCase().includes(searchQuery);
    });

    // Execute sorting algorithms depending on dynamic user values chosen
    if (sortCriterion === "date") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortCriterion === "priority") {
        const order = { "High": 1, "Medium": 2, "Low": 3 };
        filtered.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortCriterion === "subject") {
        filtered.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    // Clear lists before running DOM compilation loop
    document.getElementById("taskList").innerHTML = "";
    document.getElementById("completedTaskList").innerHTML = "";

    filtered.forEach(task => {
        let li = document.createElement("div");
        li.className = `task ${task.priority.toLowerCase()} ${task.completed ? 'task-completed' : ''}`;
        li.id = task.id;

        // Verify if active task requires an urgent overdue warning badge
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

    updateStatsAndProgressBar();
}

// Check assignment dates relative to today's local time context
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

// Toggle Complete Function Mapping
function toggleTaskComplete(id) {
    let task = assignments.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        filterAndRenderTasks();
    }
}

// Dynamic Interactive Inline Date Editor
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

function removeTask(id) {
    assignments = assignments.filter(t => t.id !== id);
    saveTasks();
    filterAndRenderTasks();
}

function formatDate(dateString) {
    return dateString.split('-').reverse().join('/');
}

// Compute metrics data state values + run live CSS scaling on progress fill bar
function updateStatsAndProgressBar() {
    let pendingCount = assignments.filter(t => !t.completed).length;
    let completedCount = assignments.filter(t => t.completed).length;
    let totalCount = assignments.length;

    document.getElementById("total").innerText = totalCount;
    document.getElementById("pending").innerText = pendingCount;
    document.getElementById("done").innerText = completedCount;

    // Run dynamic progress parsing calculation logic safely
    let computationProgressRatio = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    document.getElementById("progressPercent").innerText = `${computationProgressRatio}%`;
    document.getElementById("progressBarFill").style.width = `${computationProgressRatio}%`;
}

// Dark Mode Toggle Strategy Controls
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