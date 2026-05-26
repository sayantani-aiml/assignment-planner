function addTask() {
    let title = document.getElementById("title").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let date = document.getElementById("date").value;
    let priority = document.getElementById("priority").value;

    if (title === "") {
        alert("Please enter an assignment title.");
        return;
    }

    // Set fallback if date is left unselected
    let rawDate = date ? date : new Date().toISOString().split('T')[0];

    let li = document.createElement("div");
    li.classList.add("task");
    li.classList.add(priority.toLowerCase());
    
    // Store raw date string safely inside a data attribute for editing later
    li.setAttribute("data-date", rawDate); 

    li.innerHTML = `
        <div class="checkbox-container">
            <input type="checkbox" class="task-checkbox" onchange="toggleTaskComplete(this)">
        </div>
        <div class="task-info">
            <h3>${title}</h3>
            <p>${subject ? subject : 'No specific subject'}</p>
            <div class="task-meta">
                <span class="task-date-display">📅 ${formatDate(rawDate)}</span>
                <span class="priority-badge">${priority}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn" onclick="toggleEditDate(this)">Edit Date</button>
            <button class="delete-btn" onclick="removeTask(this)">Delete</button>
        </div>
    `;

    document.getElementById("taskList").appendChild(li);
    updateStats();

    // Reset fields
    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("date").value = "";
}

// Checkbox complete/undo action routing logic
function toggleTaskComplete(checkbox) {
    let taskCard = checkbox.closest(".task");
    let editButton = taskCard.querySelector(".edit-btn");

    if (checkbox.checked) {
        taskCard.classList.add("task-completed");
        if(editButton) editButton.style.display = "none"; // Hide edit option when completed
        document.getElementById("completedTaskList").appendChild(taskCard);
    } else {
        taskCard.classList.remove("task-completed");
        if(editButton) editButton.style.display = "inline-block";
        document.getElementById("taskList").appendChild(taskCard);
    }
    updateStats();
}

// Inline Dynamic Date Editing System
function toggleEditDate(button) {
    let taskCard = button.closest(".task");
    let dateDisplaySpan = taskCard.querySelector(".task-date-display");
    let currentRawDate = taskCard.getAttribute("data-date");

    if (button.innerText === "Edit Date") {
        // Swap static display string text out for a working interactive input node element
        dateDisplaySpan.innerHTML = `<input type="date" class="inline-date-edit" value="${currentRawDate}">`;
        button.innerText = "Save";
        button.style.background = "#dcfce7";
        button.style.color = "#16a34a";
    } else {
        let newRawDate = dateDisplaySpan.querySelector(".inline-date-edit").value;
        if(!newRawDate) newRawDate = currentRawDate; // Fallback validation control
        
        taskCard.setAttribute("data-date", newRawDate);
        dateDisplaySpan.innerHTML = `📅 ${formatDate(newRawDate)}`;
        
        button.innerText = "Edit Date";
        button.style.background = "#f1f5f9";
        button.style.color = "#475569";
    }
}

function removeTask(buttonElement) {
    buttonElement.closest(".task").remove();
    updateStats();
}

// Date conversion helper string parser utility
function formatDate(dateString) {
    return dateString.split('-').reverse().join('/');
}

// Advanced Multi-metric Math counter computation
function updateStats() {
    let pendingCount = document.getElementById("taskList").querySelectorAll(".task").length;
    let completedCount = document.getElementById("completedTaskList").querySelectorAll(".task").length;
    let totalCount = pendingCount + completedCount;

    document.getElementById("total").innerText = totalCount;
    document.getElementById("pending").innerText = pendingCount;
    document.getElementById("done").innerText = completedCount;
}