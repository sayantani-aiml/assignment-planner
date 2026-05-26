function addTask() {
    let title = document.getElementById("title").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let date = document.getElementById("date").value;
    let priority = document.getElementById("priority").value;

    if (title === "") {
        alert("Please enter an assignment title.");
        return;
    }

    // Format the date if it's empty
    let displayDate = date ? date.split('-').reverse().join('/') : "No Date";

    let li = document.createElement("div");
    li.classList.add("task");
    li.classList.add(priority.toLowerCase());

    // Cleaner structured HTML for a designer look
    li.innerHTML = `
        <div class="task-info">
            <h3>${title}</h3>
            <p>${subject ? subject : 'No specific subject'}</p>
            <div class="task-meta">
                <span class="task-date">📅 ${displayDate}</span>
                <span class="priority-badge">${priority}</span>
            </div>
        </div>
        <button class="delete-btn" onclick="removeTask(this)">
            Delete
        </button>
    `;

    document.getElementById("taskList").appendChild(li);
    updateStats();

    // Reset Form Input Fields
    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("date").value = "";
}

function removeTask(buttonElement) {
    // Handle checking off tasks cleanly
    buttonElement.parentElement.remove();
    updateStats();
}

function updateStats() {
    let total = document.querySelectorAll(".task").length;
    
    document.getElementById("total").innerText = total;
    document.getElementById("pending").innerText = total; // Updates dynamically as rows change
    document.getElementById("done").innerText = 0; 
}