'use strict';

var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
    author: String,
    question: String,
    choices: [
       {
           answer: String,
           count: Number 
       }
    ]
});

module.exports = mongoose.model('Poll', pollSchema);