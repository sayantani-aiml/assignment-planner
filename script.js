function addTask(){

let title=document.getElementById("title").value;
let subject=document.getElementById("subject").value;
let date=document.getElementById("date").value;
let priority=document.getElementById("priority").value;

if(title===""){
alert("Enter assignment title");
return;
}

let li=document.createElement("li");

li.innerHTML=
`${title} (${subject})
Due: ${date}
Priority: ${priority}

<button onclick="this.parentElement.remove()">
Delete
</button>`;

document.getElementById("taskList").appendChild(li);

}