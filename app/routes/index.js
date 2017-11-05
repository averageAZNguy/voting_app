'use strict';

var path = process.cwd();
var Poll = require('../models/poll.js'),
	User = require('../models/users.js');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js'),
	verify = require('../common/isLoggedIn.js');
var mongoose = require('mongoose'),
	passport = require('passport');

module.exports = function (app, passport, appurl) {

	var clickHandler = new ClickHandler();
	
	app.get('/main',function(req, res) {
			// res.sendFile(path + "/public/main.html");
			Poll.find({}, function(err, polls){
				if(err){
					console.log(err);
				} else {
					res.render('main', {polls: polls, currentUser: req.user});
				}
			})
			
		});

	app.get('/about', function(req, res){
		Poll.find({}, function(err, polls){
			if(err){
				console.log(err);
			} else {
				res.render('about', {polls: polls});	
			}
		})
	})
			
	// NEW POLL ROUTE	
	app.get('/main/new', verify.isLoggedIn, function(req, res){
			res.render('new');
		})

	// CREATE NEW POLL ROUTE
	app.post('/main', verify.isLoggedIn, function(req,res) {
			var question = req.body.poll.subject;
			var choices = verify.toArray(req.body.choice);
			var author = {id: req.user._id, username: req.user.username};
			console.log(author);
			var pollObject = {author: author, question: question, 'choices': choices}; 

			Poll.create(pollObject, function(err, newPoll) {
				if(err){
					console.log(err);
					res.render("new");
				} else {
					newPoll.choices.push(choices);
					newPoll.save();
					res.redirect('/main')
				}
			})

		});
	
	// SHOW NEW POLL ROUTE
	app.get('/main/:id', function(req, res) {
		Poll.findById(req.params.id, function(err, polls){
			res.render('showpoll', {polls : polls, path : appurl});	
		});
	});
	
	// SHOW CHART ROUTE
	app.get('/main/:id/chart', function(req, res){
		Poll.findById(req.params.id, function(err, polls){
			res.render('chart', {polls : polls});
		})
	});
	
	// INCREMENT VOTE ROUTE
	app.post('/main/:id/chart', function(req, res){
		if(req.body.voteid != undefined){
			Poll.findOneAndUpdate({ 'choices._id' : req.body.voteid},{ $inc: {'choices.$.count' : 1}})
				.exec(function(err, result){
					if(err){
						res.redirect('/main');
					}
					console.log("results: ",result);
					res.redirect('/main/'+req.params.id +'/chart');
				});
		}

	});
	
	// EDIT POLL ROUTE
	app.get('/main/:id/edit', verify.isLoggedIn, function(req, res){
		Poll.findById(req.params.id, function(err, findPoll){
			if(err){
				res.redirect('/main');
			}
			res.render('editpoll', {polls: findPoll});
		})
	});

	// ADD MORE POLL OPTION ROUTE
	app.post('/main/:id', verify.isLoggedIn, function(req ,res){
				// ADD NEW VOTE OPTION
		// else if(req.body.poll.new != undefined){
			var newChoice = {answer: req.body.poll.new, count: 1};
			Poll.findById(req.params.id, function(err, findPoll){
				if(err){
					console.log(err);
					res.redirect('/main');
				}
				findPoll.choices.push(newChoice);
				findPoll.save();
				res.redirect('/main/' + findPoll._id);
			})
		// }
	
	});
	
	// DELETE POLL ROUTE
	app.delete('/main/:id', verify.isLoggedIn, function (req, res){
		Poll.findByIdAndRemove(req.params.id, function(err, deletePoll){
			if(err){
				console.log(err);
				res.redirect('/profile');
			}
			res.redirect("/profile");
		})
	});
	
	
};

	//=============
	// URL SHORTERNER ROUTE - WORK IN PROGRESS
	//=============
	// app.get('/main/:id/url-api', function(req, res){
	// 	res.send("Hello")
	// })
	// 	.get('https://humdrum-curve.glitch.me/zap/'+ req.params.id)