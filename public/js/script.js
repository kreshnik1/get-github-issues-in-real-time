 // Auto discovery of the websocket server 
let socket = io();
let counter = 1;
let i = 0;
//------ Start registring callbacks for diffrent messages            
// When first entering the chat 



socket.on('welcome', function() {
		console.log("Heyy");
});

/**
 * when we get a message from webhook
 * adding a notification
 * adding a notification on the issue
 */
socket.on("information",function(data){
	addNotification(data);
	let id = data.id.toString();
	
	if(document.getElementById(id)){//checking if the issue is not close
		addNotificationOnIssues(data);//if it is not closed we are showing the notification at the issue part
	}
})

/**
* Handling all the emits that we are doing in the server.js when we get an message from webhook
*/
socket.on("issue_closed",function(data){
	closeIssue(data.id);//calling the function closeIssue to close the issue
})

socket.on("issue_edited",function(data){
	issueEdited(data);//calling the function issueEdited when an issue is edited 
})


socket.on("issue_reopened",function(data){
	addIssue(data);//calling the funtion addIssue when an issue is reopened or created
})

socket.on("comment_created",function(data){
	addCommentNumber(data);//calling the function addCommentNumber to increase the number of comments when a new comment is created
})

socket.on("comment_deleted",function(data){
	deleteCommentNumber(data);//calling the function deleteCommentNumber to decrease the number of comments when a comment is deleted
})



/**
*Creating an issue when we get a message from 
*webhook that an issue was created or reopened
*/
function addIssue(data){
	
	if(document.getElementById(data.id.toString())){
		let issue = document.getElementById(data.id.toString());
		issue.removeAttribute("class");
	}
	else {
		//creating te issue
		const template = document.createElement('template')
		template.innerHTML = `		
			<div  id="`+data.id+`">
				<div class="card border-success mb-3" >
					<div class="card-header" id='title`+data.id+`'><h6>`+data.title+`</h6></div>
					<div class="card-body text-success">
						<p class="card-text" id="content`+data.id+`">Content : <span id="text">`+data.content+`</span></p>
						<p class="card-text">User : <span id="text">`+data.user+`</span></p>
						<p class="card-text" id="comment`+data.id+`">Number of comments : <span id="text">`+data.comments+`</span></p>
						<p class="card-text">Url : <a href="https://github.com/1dv523/ka222sd-examination-3/issues/`+data.url+`" target= "_blank">https://github.com/1dv523/ka222sd-examination-3/issues/`+data.url+`</a></p>
						<p class="card-text">Created at : <span id="text">`+data.date+`</span></p>  
			  		</div>
				</div>
			</div>`
		let clone = template.content.cloneNode(true);
		document.querySelector('.floatleft').appendChild(clone);
	}	
}

/**
*Increasing the number of comments when we get a message 
* that a comment was created (Checking by id)
*
*/
function addCommentNumber(data){
	//checking if that issue is opened
	if(document.getElementById(data.id.toString())){
			let commentsNumber = parseInt(data.comments)+1; 
			document.getElementById("comment"+data.id.toString()).innerHTML='Number of comments : <span id="text">'+commentsNumber.toString()+'</span>';	  
	}
}

/**
*Creates the notification 
*Adding the information we get from webhook
*Adding a click event so we can delete a notification
*Every notification has his own id 
*/
function addNotification(message) {
	
	var contain = document.createElement("div");
	contain.setAttribute("class","contain");
	contain.setAttribute("id","contain"+i.toString());
	var section = document.createElement("section");
	section.setAttribute("class","notif notif-notice");
	var notif = document.createElement("div");
	notif.setAttribute("class","notif-title");
	var action = document.createTextNode(message.action.toString());
	notif.appendChild(action);
	var ul = document.createElement("ul");
	ul.setAttribute("id","info");
	
	var li1 = document.createElement("li");
	var text1 = document.createTextNode(message.title.toString());
	li1.appendChild(text1);
	
	var li2 = document.createElement("li");
	var text2 = document.createTextNode(message.user.toString());
	li2.appendChild(text2);
	
	var li3 = document.createElement("li");
	var text3 = document.createTextNode(message.comment.toString());
	li3.appendChild(text3);
	
	ul.appendChild(li1);
	ul.appendChild(li2);
	ul.appendChild(li3);
	
    let control = document.createElement("div");
	control.setAttribute("class","notif-controls");
	let button = document.createElement("button");
	button.setAttribute("class","notif-close");
	button.setAttribute("id",+i.toString());
	var atext = document.createTextNode("Close");
	button.appendChild(atext);
	control.appendChild(button);
	section.appendChild(notif);
	section.appendChild(ul);
	section.appendChild(control);
	contain.appendChild(section);
	
	let floatright = document.querySelector(".floatright");
	//floatright.appendChild(contain);
	let notification = document.querySelector(".notification");
	notification.insertBefore(contain, notification.childNodes[0]);
	
    button.addEventListener("click", function(){
		deleteNotification(button.id.toString());
		
	})
	i++;
}

/**
*Adding a notification on the issue when there is an update
*Counting the number of updates that an issue has
*
*/
function addNotificationOnIssues(data){
	
	//checking if the notification exist in the issue part 
	//if it is we are increasing the counter for 1
	if(document.querySelector("#button"+data.id.toString())){
		counter++;
	}
	//reseting the counter
	else {
		counter = 1;
	}
	//if there is another update we delete the previous one
	if(document.querySelector(".btn")){
		document.querySelector(".btn").remove();
	}
	
	//creating an notification on the issue part 
	let button = document.createElement("button")
	let header = document.getElementById("title"+data.id.toString());
	button.setAttribute("type","button");
	button.setAttribute("class","btn btn-primary");
	button.setAttribute("id","button"+data.id.toString());
	let span = document.createElement("span");
	span.setAttribute("class","badge badge-ligt");
	let spantext = document.createTextNode(counter.toString());
	span.appendChild(spantext);
	let text = document.createTextNode(data.action.toString());
	let p  = document.createElement("p");
		p.setAttribute("id","p");
		p.appendChild(text);
		button.appendChild(p);
		button.appendChild(span);
		header.appendChild(button);
}

/**
*Decreasing the number of comments when we get a message 
* that a comment was created (Checking by id)
*
*/
function deleteCommentNumber(data){
	//checking if that issue is opened
	if(document.getElementById(data.id.toString())){
		let commentsNumber = parseInt(data.comments)-1;
		document.getElementById("comment"+data.id.toString()).innerHTML='Number of comments : <span id="text">'+commentsNumber.toString()+'</span>';	 
	}
}


/**
*Changing the title or content of an issue
*
*/
function issueEdited(data){
	//checking if a title was changed
	if(data.changes.title){
		let titles = document.getElementById("title"+data.id.toString());
		titles.innerHTML = "<h6>"+data.title+"</h6>";	
	}
	//content is changed
	else{
		let content = document.getElementById("content"+data.id.toString());
		content.innerHTML="Content : "+data.content;
	}
}

/**
*Getting the id of the closed issue  and
*delete the issue
*/
function closeIssue(id){
	let issue = document.getElementById(id.toString());
	issue.remove();
}

/**
 * Adding an option to delete a noticiation 
 *  
 */
function deleteNotification(id){
	document.querySelector("#contain"+id).remove();
}