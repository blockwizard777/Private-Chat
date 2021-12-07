var User        = require('mongoose').model('User');
var Room        = require('mongoose').model('Room');
var Invited     = require('mongoose').model('Invited');

var fs = require('fs');
var multiparty = require('multiparty');
var globals = require('./global.function');

exports.home = function(req, res,next) {
  	res.render('home', {
          pagename: 'home',
          user : req.session.user,});
};

exports.getUserList = function(req, res, next) {
    var myId = req.session.user._id;

    User.find({_id:{$ne:myId}}, "_id userName", function(error, users) {

        Room.find()
            .populate({path:'invited', select:"_id userName"})
            .populate('userId')
            .where('invited').in([myId])
            .exec(function(error, invRooms) {
                Room.find({"userId": myId})
                    .populate({path:'invited', select:"_id userName"})
                    .populate('userId')
                    .exec(function(error, myRooms) {
                        res.end(JSON.stringify({
                            owner : req.session.user,
                            users : users,
                            invRooms : invRooms,
                            myRooms : myRooms,
                            curServerTime: Date.now()}));
                    });
            });
    });
};