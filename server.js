'use strict';

var express = require('express');
var methodOverride = require('method-override');
var routes = require('./app/routes/index.js'),
	authRoutes= require('./app/routes/auth.js');
var mongoose = require('mongoose'),
	User = require('./app/models/users.js');
var passport = require('passport'),
	localStrategy = require('passport-local');
	// nev = require('email-verification')(mongoose);
var bodyparser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	morgan = require('morgan');
var session = require('express-session'),
	flash = require('connect-flash'),
	seedDB = require('./seed');

var app = express();
require('dotenv').load();
var appurl = process.env.APP_URL;
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.set("view engine", 'ejs');
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(morgan('dev')); // logs every request to console
app.use(cookieParser()); // read cookies for authentication
app.use(flash());

// seedDB();

app.use(session({
	secret: 'secret sauce Voting App for Free code camp by Quang-Thuy Hoang',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new localStrategy(User.authenticate()));
// PASSPORT Strategies
require('./app/config/passport')(passport);

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


routes(app, passport, appurl);
authRoutes(app, passport);

var port = process.env.PORT || 5000;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});


// require('../test/test')();