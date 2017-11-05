'use strict';

var GitHubStrategy = require('passport-github2').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	
	// ========= passport session setup =============
	// Serialized the user for session
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	// deserialized user for the session
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	// ========== Local Signup ==========
	
	passport.use('local-register', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows to pass back to request callback
	}, function(req, email, password, done) {
		process.nextTick(function(){
			User.findOne({'email' : email}, function(err, foundUser) {
				// if any errors, return the error
				if(err){
					return done(err);
				}

				// if user already exists when signing up
				if(foundUser) {
					return done(null, false, req.flash("signupMessage", "Email is already registered."))
				} else {
					// check if email is correct format
					// const emailCheck = new RegExp(process.env.emailRegex);
					const emailCheck = /\w+@\w+.com/;
					const pwCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
					// console.log("req", req.body, "email", email, "typeof",typeof emailCheck, "test",emailCheck.test(email));
										// ^                  // the start of the string
					// (?=.*[a-z])        // use positive look ahead to see if at least one lower case letter exists
					// (?=.*[A-Z])        // use positive look ahead to see if at least one upper case letter exists
					// (?=.*\d)           // use positive look ahead to see if at least one digit exists
					// (?=.*[_\W])        // use positive look ahead to see if at least one underscore or non-word character exists
					// .+                 // gobble up the entire string
					// $                  // the end of the string

					if(!emailCheck.test(email)) {
						return done(null, false, req.flash("signupMessage", "That is not a valid email."))
					}
					// check if password is correct criteria
					if(password.length < 6) {
						return done(null, false, req.flash("signupMessage", "Password has to be a mininum of 6 characters, have at least one uppercase, one lowercase, and one number."))
					}

					if(!pwCriteria.test(password)){
						return done(null, false, req.flash("signupMessage", "Password has to be a mininum of 6 characters, have at least one uppercase, one lowercase, and one number."))
					}
					// if no user, create new user
					var newUser = new User();
					newUser.email = email;
					newUser.username = req.body.username;
					newUser.password = newUser.generateHash(password);
					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					})
				}
			})
		})
		
	}))
	
	// ========== LOCAL SIGNIN ==========
	
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email', //set username field to be email in callback
		passwordField: 'password', //set passwordField to be password in callback
		passReqToCallback: true //allow request to be used in callback
	}, function(req, email, password, done) {
		User.findOne({'email' : email}, function(err, user) {
			// error handling
			if(err){
				console.log(err);
				return done(err, req.flash("error", err))
			}
			// if no user found
			if(!user){
				console.log("No user found");
				return done(null, false, req.flash("error", "Could not find an account with that email."))
			}
			// verify password is correct
			if(!user.validatePassword(password)){
				console.log("Incorrect password");
				return done(null, false, req.flash("error", "Incorrect password"));
			}
			// successful login
			return done(null, user, req.flash("success", "Welcome"));
		})
	}));
	
	// ========== GITHUB SIGN UP STRATEGY =============
	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'email': profile._json.email }, function (err, user) {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
						newUser.github.id = profile.id;
						newUser.username = profile.username;
						newUser.email = profile._json.email;
						newUser.github.username = profile.username;
						newUser.github.displayName = profile.displayName;
						newUser.github.publicRepos = profile._json.public_repos;
						newUser.save(function (err) {
						if (err) {
							throw err;
						}
						return done(null, newUser);
					});
				}
			});
		});
	}));
};
