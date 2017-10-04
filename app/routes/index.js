'use strict';

var path = process.cwd();
var Poll = require('../models/poll.js');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var mongoose = require('mongoose');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	
	app.get('/main',function(req, res) {
			// res.sendFile(path + "/public/main.html");
			Poll.find({}, function(err, polls){
				if(err){
					console.log(err);
				} else {
					res.render('main', {polls: polls});
				}
			})
			
		});
	

		// convert to array function
			function toArray(choices){
				var arr = [];
				for (var option in choices){
					console.log(option, choices[option]);
					arr.push({'answer': choices[option], "count": 0});
				} 
				return arr
			};

			
	// NEW POLL ROUTE	
	app.get('/main/new',function(req, res){
			res.render('new');
		})

	// CREATE NEW POLL ROUTE
	app.post('/main',function(req,res) {
			var question = req.body.poll.subject;
			var choices = toArray(req.body.choice);
			var pollObject = {question: question, 'choices': choices}; 

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
			
			// res.redirect('/main');
		});
	
	// SHOW NEW POLL ROUTE
	app.get('/main/:id', function(req, res) {
		Poll.findById(req.params.id, function(err, polls){
			res.render('showpoll', {polls : polls});	
		});
	});
	
	// UPDATE VOTE COUNT ROUTE
	app.post('/main/:id', function(req ,res){
		
		Poll.findOneAndUpdate({ 'choices._id' : req.body.voteid},{ $inc: {'choices.$.count' : 1}})
			.exec(function(err, result){
				if(err){
					res.redirect('/main');
				}
				console.log("results: ",result);
				res.redirect('/main/'+req.params.id);
			});
	});
		
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			// res.sendFile(path + '/public/index.html');
			res.redirect('/main');
		});
	
	
		
		
	app.route('/login')
		.get(function (req, res) {
			// res.sendFile(path + '/public/login.html');
			res.sendFile(path + '/public/login1.html');
		});
		
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
