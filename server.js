'use strict';

var express = require('express');
var methodOverride = require('method-override');
var routes = require('./app/routes/index.js'),
	authRoutes= require('./app/routes/auth.js');
var mongoose = require('mongoose'),
	User = require('./app/models/users.js');
var passport = require('passport'),
	localStrategy = require('passport-local');
var bodyparser = require('body-parser')
var session = require('express-session'),
	seedDB = require('./seed');

var app = express();
require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.set("view engine", 'ejs');
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// seedDB();

app.use(session({
	secret: 'secret sauce Voting App for Free code camp by Quang-Thuy Hoang',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
require('./app/config/passport')(passport);
passport.serializeUser(function(user, done){
	done(null,user.id);
});
passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err,user);
	})
})
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
