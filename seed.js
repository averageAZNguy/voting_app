'use strict';

var mongoose = require('mongoose');
var Polls = require('./app/models/poll');

var polldata = [
    {
        question: "What is the best city to live in Texas?",
        choices : [
            {
                answer: "Austin",
                count: 4
            },
            {
                answer: "Dallas",
                count: 3
            },
            {
                answer: "San Antonio",
                count: 1
            },
            {
                answer: "Houston",
                count: 6
            }
        ]
    },
    {
        question: "What is your start Pokemon?",
        choices : [
            {
                answer: "Squirtle",
                count: 1
            },
            {
                answer: "Bulbasaur",
                count: 0
            },
            {
                answer: "Charmander",
                count: 3
            }
        ]
    },
    {
        question: "Are you a programmer?",
        choices : [
            {
                answer: "Yes",
                count: 45
            },
            {
                answer: "No",
                count: 35
            }
        ]
    }
    ];

function seedDB(){
    Polls.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("remove polls");
        polldata.forEach(function(seed){
            Polls.create(seed, function(err, survey){
                if(err){
                    console.log("err");
                }
                console.log("did it work?");
            })
        })
    })
};

module.exports = seedDB;