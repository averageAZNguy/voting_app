'use strict';

var path = process.cwd();
var appurl = "https://dynamic-web-app-burgerflipper.c9users.io/";
var Poll = require('../models/poll.js'),
	User = require('../models/users.js');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js'),
    verify = require('../common/isLoggedIn.js');
var mongoose = require('mongoose'),
	passport = require('passport');

module.exports = function(app, passport){
    //=============
	// AUTHENTICATION ROUTE
	//=============
	var clickHandler = new ClickHandler();
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
    });
    
    // LOGIN ROUTE
    app.get('/login', function(req, res){
    	res.render('auth/login');
    });
    
    app.post('/login', 
    	passport.authenticate('local',
    	{
    		successRedirect: '/main',
    		failureRedirect: '/login',
    		failureFlash: true
    	}), function(req, res){
    	
    });
	
	// LOGOUT ROUTE
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/about')
	})
	
	app.get('/profile', verify.isLoggedIn, function (req, res) {
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
		.get(verify.isLoggedIn, function (req, res) {
			res.redirect('/main');
		});
	
	app.route('/api/:id')
		.get(verify.isLoggedIn, function (req, res) {
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
		.get(verify.isLoggedIn, clickHandler.getClicks)
		.post(verify.isLoggedIn, clickHandler.addClick)
		.delete(verify.isLoggedIn, clickHandler.resetClicks);
}