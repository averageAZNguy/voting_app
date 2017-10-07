'use strict';

var path = process.cwd();
var Poll = require('../models/poll.js'),
	User = require('../models/users.js');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var mongoose = require('mongoose'),
	passport = require('passport');

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
					res.render('main', {polls: polls, currentUser: req.user});
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
	app.get('/main/new', isLoggedIn, function(req, res){
			res.render('new');
		})

	// CREATE NEW POLL ROUTE
	app.post('/main', isLoggedIn, function(req,res) {
			var question = req.body.poll.subject;
			var choices = toArray(req.body.choice);
			var author = {id: req.user._id, username: req.user.username};
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
			
			// res.redirect('/main');
		});
	
	// SHOW NEW POLL ROUTE
	app.get('/main/:id', function(req, res) {
		Poll.findById(req.params.id, function(err, polls){
			res.render('showpoll', {polls : polls});	
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
	app.get('/main/:id/edit', isLoggedIn, function(req, res){
		Poll.findById(req.params.id, function(err, findPoll){
			if(err){
				res.redirect('/main');
			}
			res.render('editpoll', {polls: findPoll});
		})
	});

	// ADD MORE POLL OPTION ROUTE
	app.post('/main/:id', isLoggedIn, function(req ,res){
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
	app.delete('/main/:id', isLoggedIn, function (req, res){
		Poll.findByIdAndRemove(req.params.id, function(err, deletePoll){
			if(err){
				console.log(err);
				res.redirect('/profile');
			}
			res.redirect("/profile");
		})
	});
	
	//=============
	// AUTHENTICATION ROUTE
	//=============
	
	// REGISTER ROUTE
	app.get('/register', function(req, res){
        res.render('auth/register');
    });
    
    app.post('/register', function(req, res){
    	var newUser = new User({username: req.body.username, email: req.body.email})
    	User.register(newUser, req.body.password, function(err, user){
    		if(err){
    			console.log(err);
    			return res.redirect('/register');
    		}
    		passport.authenticate('local')(req, res, function(){
    			res.redirect('/main');
    		})
    	})
    })
    
    // LOGIN ROUTE
    app.get('/login', function(req, res){
    	res.render('auth/login');
    });
    
    app.post('/login', 
    	passport.authenticate('local',
    	{
    		successRedirect: '/main',
    		failureRedirect: '/login'
    	}), function(req, res){
    });
	
	// LOGOUT ROUTE
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/main')
	})
	
	app.get('/profile', isLoggedIn, function (req, res) {
		console.log(req.user);
		Poll.find({'author.id' : req.user._id}, function(err, foundPoll){
			if(err){
				console.log(err);
				return res.redirect('/login');
			}
			console.log(foundPoll);
			res.render('profile', {Polls: foundPoll});
		})
	});
	
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			// res.sendFile(path + '/public/index.html');
			res.redirect('/main');
		});
	
	app.route('/login/github')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
			// res.sendFile(path + '/public/login1.html');
		});
		



	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.get('/auth/github',passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/main',
			failureRedirect: '/login',
			failureFlash: true
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
