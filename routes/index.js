"use strict"

require('dotenv').config();
let router = require("express").Router();
let https = require("https");
let token = process.env.TOKEN;
var context;

			
var options = {
	host:'api.github.com',
	path: '/repos/1dv523/ka222sd-examination-3/issues',
	method: 'GET',
	headers: {'user-agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',"Authorization":"token "+token}
};



//this will trigger on the root url (/)
router.route("/")
		.get(function (request, response, next) { 
		//making https request to github for receiveing the opened issues
			var req = https.request(options, function(resp){
				var body = '';


				resp.on('data',function(chunk){
					body+=chunk;
				});
				resp.on('end',function(){
					var json = JSON.parse(body);
					//getting all datas tha I need and convert it to array of object to render it into index.hbs
					context = {
							repos: json.map(function(todo) {
								return {
								  title:todo.title,
								  id : todo.id,
								  user: todo.user.login,
								  content : todo.body,
								  url:todo.number,
								  date:todo.created_at,
								  comments:todo.comments	
								};
							})
					};
							response.render("home/index",context);	
				});
			});

		req.on('error', function(e) {
			console.error('and the error is '+e);
		});

		req.end();	
})

// Exported
module.exports = router;