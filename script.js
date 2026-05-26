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

alert("Enter title");

return;

}

let li=
document.createElement("li");

let color;

if(priority==="High")
color="#ff4d4d";

else if(priority==="Medium")
color="#ffa500";

else
color="#22c55e";

li.style.borderLeft=
`8px solid ${color}`;

li.innerHTML=

`${title}
(${subject})

<br>

Due:
${date}

<br>

Priority:
${priority}

<br>

<button
class="deleteBtn"

onclick="
this.parentElement.remove();
updateStats();
">

Delete

</button>`;

document
.getElementById("taskList")
.appendChild(li);

updateStats();

}

function updateStats(){

let total=
document
.querySelectorAll("li")
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