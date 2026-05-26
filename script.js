function addTask(){

let title=
document.getElementById("title").value;

let subject=
document.getElementById("subject").value;

let date=
document.getElementById("date").value;

let priority=
document.getElementById("priority").value;

if(title===""){

alert("Enter assignment title");

return;

}

let li=
document.createElement("div");

li.classList.add("task");

li.classList.add(
priority.toLowerCase()
);

li.innerHTML=

`
<h3>${title}</h3>

<p>${subject}</p>

<p class="date">
📅 ${date}
</p>

<p>
Priority:
${priority}
</p>

<button
class="delete"

onclick="
this.parentElement.remove();
updateStats();
">

Delete

</button>
`;

document
.getElementById("taskList")
.appendChild(li);

updateStats();

document
.getElementById("title").value="";

document
.getElementById("subject").value="";

document
.getElementById("date").value="";

}

function updateStats(){

let total=
document
.querySelectorAll(".task")
.length;

document
.getElementById("total")
.innerText=total;

document
.getElementById("pending")
.innerText=total;

document
.getElementById("done")
.innerText=0;

}