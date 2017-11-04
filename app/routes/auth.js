'use strict';

var path = process.cwd();
var appurl = "https://dynamic-web-app-burgerflipper.c9users.io/";
var Poll = require('../models/poll.js'),
	User = require('../models/users.js');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js'),
    verify = require('../common/isLoggedIn.js');
var mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('connect-flash');

module.exports = function(app, passport){
    //=============
	// AUTHENTICATION ROUTE
	//=============
	var clickHandler = new ClickHandler();
	
	// REGISTER ROUTE
	app.get('/register', function(req, res){
        res.render('auth/register', {message : req.flash("signupMessage")});
    });
    
    app.post('/register', passport.authenticate('local-register', {
    	successRedirect : '/profile',
    	failureRedirect : '/register',
    	failureFlash : true
    }));
    
    // LOGIN ROUTE
    app.get('/login', 
    function(req, res, next) {
    	// console.log(req.user)
    		if(!req.user){ 
    			return next() 
    		}
    		req.flash("success", "Welcome to Ask Questions");
        	return res.redirect('/profile') 
    	}, 
    	function(req, res){
    	res.render('auth/login', {message: req.flash("error")});
    });
    
    app.post('/login', 
    	passport.authenticate('local-login',
    	{
    		successRedirect: '/profile',
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
		.get(function (req, res) {
			res.redirect('/about');
		});
	
	// GITHUB AUTH
	app.route('/api/:id')
		.get(verify.isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.get('/auth/github',passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/profile',
			failureRedirect: '/login',
			failureFlash: true
		}));

	app.route('/api/:id/clicks')
		.get(verify.isLoggedIn, clickHandler.getClicks)
		.post(verify.isLoggedIn, clickHandler.addClick)
		.delete(verify.isLoggedIn, clickHandler.resetClicks);
}