"use strict";

require('dotenv').config()
let express      = require("express");
let bodyParser   = require("body-parser");
let exphbs       = require("express-handlebars");
let path         = require("path");
let session      = require("express-session");
let app  = express();
let port = process.env.PORT || 3000;
let https = require("https");
let fs = require("file-system");
let secret = process.env.SECRET;

var GithubWebHook = require('express-github-webhook');
var webhookHandler = GithubWebHook({ path: '/webhook', secret: secret});

var helmet  = require('helmet');
var xssFilter = require('x-xss-protection')
var csp = require('helmet-csp')


// The framework should look in the folder "public" for static resources//
app.use(express.static(path.join(__dirname, "public")));

//Start 
// Launch application 
let server = https.createServer({
	key: fs.readFileSync("./config/sslcerts/key.pem"),
	cert: fs.readFileSync("./config/sslcerts/cert.pem")
},app).listen(port, function() {
	console.log("Express started on https://localhost:"+port);
	console.log("and https://159.89.30.255/ ")
	console.log("Press Ctrl-C to terminate...");
});

// View engine.
app.engine(".hbs", exphbs({
    defaultLayout: "main",
    extname: ".hbs"
}));
app.set("view engine", ".hbs");

// Add support for handling application/json
app.use(bodyParser.json());

//app.use(validator());

// Add support for handling HTML form data
app.use(bodyParser.urlencoded({ extended: true }));

//securing the application
app.use(helmet());
app.use(helmet.xssFilter());
app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'https://fonts.googleapis.com/icon','https://fonts.googleapis.com/css','https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css'],
	fontSrc:["'self'",'https://fonts.gstatic.com','https://fonts.gstatic.com/s/materialicons','https://fonts.gstatic.com/s/roboto/v18/Hgo13k-tfSpn0qi1SFdUfVtXRa8TVwTICgirnJhmVJw.woff2']  ,
	scriptSrc : ["'self'"],// throw an error instead of loading script from any other source 
	baseUri : ["'self'"], //restricts the URLs that can appear in a page’s <base> element 
	connectSrc : ["'self'",'wss://159.89.30.255/socket.io/']  
  }
}))




app.use(webhookHandler); // use our middleware 

var io = require("socket.io")(server);

io.on('connection',function(socket){
	socket.emit("welcome");	
})

//controlling the webhook from github
webhookHandler.on('*', function (event, repo, data) {
		let action , title,user,comments;
	    console.log(data);
		//checking if the event is issue
		if(event==="issues"){
			action = "Issue  "+data.action;
			title = "Issue Title : " +data.issue.title;
			user = "User : "+data.issue.user.login;
			comments = "";
			
			//checking if the issue is closed 
			if(data.action === "closed"){
				console.log(data.issue.id);
				
				//emit issue_closed and then making the changes in script.js 
				io.emit("issue_closed",{
					id:data.issue.id
				})
			}
			
			//checking if the issue is edited 
			if(data.action === "edited"){
				io.emit("issue_edited",{
					id : data.issue.id,
					title:data.issue.title,
					content:data.issue.body,
					changes:data.changes
				})
			}
			
			//checking if the issue is reopened or opened
			if(data.action === "reopened" || data.action === "opened"){
				io.emit("issue_reopened",{
					id:data.issue.id,
					title:data.issue.title,
					user:data.issue.user.login,
					comments :data.issue.comments,
					url :data.issue.number,
					content :data.issue.body,
					date:data.issue.created_at
				});
			}
		}
		//checking if the event from the webhook is issue
	    if(event == "issue_comment"){
			action = "Comment  "+data.action;
			title = "Issue Title : "+data.issue.title;
			comments = "Comment : "+data.comment.body;
			user = "User : "+data.issue.user.login;
			
			//checking if a message  is created
			if(data.action === "created"){
				io.emit("comment_created",{
					id:data.issue.id,
					comments :data.issue.comments 
				})
			}
			
			//checking if a message  is deleted
			if(data.action == "deleted"){
				io.emit("comment_deleted",{
					id:data.issue.id,
					comments:data.issue.comments
				})
			}
		}
		//emiting the information that we get from webhook and showing the notification
		io.emit("information",{
			id:data.issue.id,
			action:action,
			title:title,
			user:user,
			comment:comments,
			updated : data.issue.updated_at
		});
		
});
			

// Adding support for stupid render message (every request)
app.use(function(request, response, next) {
  // Always use a namespace for this
  if(!response.locals.partials) {
    response.locals.partials = {};
  }
  // This could be
  response.locals.partials.sponsor = {name: "Acme AB"};
  next();
});



// Load routes as "mini-apps"
app.use("/", require("./routes/index.js"));

//sdasdasd
// Error handling
app.use(function(request, response, next) {
	
	let error = {
		status:"404",
		message:"oops! page not found"
	 }
  	
	response.status(404).render("todo/errors/404",error);
});

// four parameters for errors
app.use(function(err, req, res, next) {
  // log the error
  console.log(err);
  res.status(500).send("Something broke!");
});

