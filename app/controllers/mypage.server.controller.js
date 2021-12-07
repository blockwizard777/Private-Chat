var express = require('express');
var fs = require('fs');
var Media_Datas = require('mongoose').model('Media_Datas');
var Category = require('mongoose').model('Category');
var Account = require('mongoose').model('Account');
var path = require('path');
var _ = require('lodash');

var ECT = require('ect');

var bodyParser = require('body-parser');
var stream = require('stream');
var util = require('util');
var ffmpeg = require('fluent-ffmpeg');
var busboi = require('connect-busboy');
//var DESTINATION  = "../../public/uploads/videos/";
var DESTINATION = "./public/uploads/videos/";
var DESTINATION1 = "./public/uploads/musics/";
console.log(__dirname);
console.log(__filename);
var videoResponse;
var videoRequest;

var MusicResponse;
var MusicRequest;

function BufferStream(source) {
    if (!Buffer.isBuffer(source)) {
        throw (new Error("Source must be a buffer."));
    }
    stream.Readable.call(this);
    this._source = source;
    this._offset = 0;
    this._length = source.length;
    this.on("end", this._destroy);
}

util.inherits(BufferStream, stream.Readable);
BufferStream.prototype._destroy = function () {

    this._source = null;
    this._offset = null;
    this._length = null;

};
BufferStream.prototype._read = function (size) {
    if (this._offset < this._length) {
        this.push(this._source.slice(this._offset, (this._offset + size)));
        this._offset += size;

    }
    if (this._offset >= this._length) {
        this.push(null);
    }
};
//
exports.myuploadMusic = function(req,res){
    MusicResponse = res;
    MusicRequest = req;
};
exports.uploadMusicFile = function (req, res) {
        var fstream;
        req.pipe(req.busboy);
         req.busboy.on('file', function (fieldname, file, fullname) {

        var filename = fullname.substring(0, fullname.length - 4);
        var ext = fullname.substring(fullname.length - 4, fullname.length).toLowerCase();

        //conver to Unique name from fullname
        var msecs = Date.parse(new Date());
        var MediaName = (Math.random() * 8999999 + 1000000).toString() + msecs.toString()  ;
        //
        filename = MediaName;
        MediaName   = MediaName + ext ; 
        console.log("Uploading: " + filename, 'to: ', DESTINATION1);
        console.log("Uploading: " + ext, 'to: ', DESTINATION1);
        var fullPath = DESTINATION1 + filename + ext;
        console.log(fullPath);
        fstream = fs.createWriteStream(fullPath);
        file.pipe(fstream);
        fstream.on('close', function () {
                _sendVideoResponse1(fullPath);
        });

        res.send({
            status: 'pending upload...',
            MediaName: MediaName
        });
    });
};
function _sendVideoResponse1(path) {
    if (MusicResponse) {
        var range = MusicRequest.headers.range;
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        fs.stat(path, function (err, stats) {
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
            MusicResponse.writeHead(206, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "audio/mp3"
            });
            var videoFile = fs.readFileSync(path);
            var bs = new BufferStream(videoFile)
                .pipe(MusicResponse);
        });
    }
}
//upload video file

exports.myupload = function (req, res) {
    videoResponse = res;
    videoRequest = req;

};

exports.uploadFile = function (req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, fullname) {

        var filename = fullname.substring(0, fullname.length - 4);
        var ext = fullname.substring(fullname.length - 4, fullname.length).toLowerCase();

        //conver to Unique name from fullname
        var msecs = Date.parse(new Date());
        var MediaName = (Math.random() * 8999999 + 1000000).toString() + msecs.toString()  ;
        //
        filename = MediaName;
        MediaName   = MediaName + ext ; 
        console.log("Uploading: " + filename, 'to: ', DESTINATION);
        console.log("Uploading: " + ext, 'to: ', DESTINATION);
        var fullPath = DESTINATION + filename + ext;
        console.log(fullPath);
        fstream = fs.createWriteStream(fullPath);
        file.pipe(fstream);
        fstream.on('close', function () {
           /* if (ext !== '.mp4') {
                _encodeMp4(DESTINATION + filename, ext);
            } else {*/
                _sendVideoResponse(fullPath);
            //}
        });

        res.send({
            status: 'pending upload...',
            MediaName: MediaName
        });
    });
};
/*function _encodeMp4(pathNoExt, ext) {
    console.log(pathNoExt, ext);
    ffmpeg(pathNoExt + ext)
        .format('mp4')
        .output(pathNoExt + '.mp4')
        .on('start', function (cmd) {
            console.log(cmd);
        })
        .on('end', function () {
            _sendVideoResponse(pathNoExt + '.mp4');
        })
        .run();
}*/

function _sendVideoResponse(path) {
    if (videoResponse) {
        var range = videoRequest.headers.range;
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        fs.stat(path, function (err, stats) {
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
            videoResponse.writeHead(206, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            });
            var videoFile = fs.readFileSync(path);
            var bs = new BufferStream(videoFile)
                .pipe(videoResponse);
        });
    }
}

//end upload
exports.renderFunc = function (req, res) {
    var username = req.session.account.username;
    Media_Datas.find({ posterName: username, isView: '1' })
        .populate('posterId')
        .exec(function (err, datas) {
            var users1 = datas;
            //datas.posterId.followedUsers
            Account.findOne({ username: username }).exec(function (err, data) {
                Media_Datas.find().where('posterName').in(data.followingUsers).populate('posterId').exec(function (err, datas) {
                    var users2 = datas;
                    //liked user add
                    Media_Datas.find().populate('posterId').exec(function (err, datas) {
                        var users3 = [];
                        datas.forEach(function (data) {
                            if (data.likedUsers.indexOf(username) != -1) {
                                users3.push(data);
                            }
                        });
                        var datas = [];
                        datas = datas.concat(users1);
                        datas = datas.concat(users2);
                        datas = datas.concat(users3);
                        res.render('mypage', { datas: datas, username: username });
                    });
                });
            });
        });
};
exports.postMediaFunc = function (req, res) {
    var username = req.session.account.username;
    var userId = req.session.account._id;
    Category.find().exec(function (err, datas) {
        res.render('postmedia', { url: 'http://localhost:3000/', category: datas, username: username, userId: userId });
    });
};

exports.storeMedia = function (req, res) {
    var media_datas = new Media_Datas(req.body);
    media_datas.save(function (err) {
        if (err) {
            return res.json(err);
        } else {
            res.json("ok");
        }
    });
};

exports.showDetail = function (req, res) {
    var username = req.session.account.username;
    Media_Datas.findById(req.params.id, function (err, media) {
        if (err) {
            console.log(err);
        }
        else {
            var temp = media.cnt_view + 1;
            media.cnt_view = temp;
            media.save(function (err) {
                if (!err) {
                    Media_Datas.findById(req.params.id)
                        .populate('posterId', 'followedUsers')
                        .exec(function (err, data) {
                            res.render('showDetail', { data: data, username: username });
                        });
                }
            });
        }
    });
};

exports.update = function (req, res) {
    var username = req.session.account.username;
    var posterName = req.body.posterName;
    console.log("update");
    if (req.body.type == 'like') {
        Media_Datas.findById(req.body.mediaID, function (err, user) {
            if (err) {
                console.log(err);
            }
            else {
                //like를 누른 사용자를 메디어모델의 likedUsers에 삽입
                if (req.body.isSelected == 1) {
                    var temp = user.cnt_like + 1;
                    user.likedUsers.push(username);
                }
                //다시 누르면 like를 누른 사용자를 메디어모델의 likedUsers에서 삭제
                else {
                    console.log("likeEvent");
                    console.log(user.likedUsers);
                    var temp = user.cnt_like - 1;
                    var index = -1;
                    for (var i = 0; i < user.likedUsers.length; i++) {
                        if (user.likedUsers[i] == username) {
                            {
                                index = i;
                                break;
                            }
                        }
                    }
                    if (index != -1) user.likedUsers.splice(index, 1);
                    console.log(user.likedUsers);
                }
                user.cnt_like = temp;
                user.save(function (err) {
                    if (!err) {
                        console.log("update cnt_like successed!");
                        return res.json("ok");
                    }
                });
            }
        });
    }
    else if (req.body.type == 'follow') {
        //가입자의 followingID에 메디어를 포스트한 사용자를 삽입
        Account.findOne({ username: username }, function (err, user) {
            if (!err) {
                if (req.body.isSelected == 1) {
                    user.followingUsers.push(posterName);
                    user.save(function (err) {
                        if (!err) console.log("following updated successfully");
                    });
                }
                else if (req.body.isSelected == 0) {
                    var temp = -1;
                    for (var i = 0; i < user.followingUsers.length; i++) {
                        if (user.followingUsers[i] == posterName) {
                            {
                                temp = i;
                                break;
                            }
                        }
                    }
                    if (temp != -1) user.followingUsers.splice(temp, 1);
                    user.save(function (err) {
                        if (!err) console.log("following deleted updated successfully");
                    });
                }
            }
        });

        //메디어를 포스트한 사용자모델의 followedID에 가입자를 추가
        Account.findOne({ username: posterName }, function (err, user) {
            if (!err) {
                if (req.body.isSelected == 1) {
                    user.followedUsers.push(username);
                    user.save(function (err) {
                        if (!err) console.log("followed updated successfully");
                    });
                }
                else {
                    var temp = -1;
                    console.log("FollowedDeleteStep");
                    console.log(user.followedUsers);
                    for (var i = 0; i < user.followedUsers.length; i++) {
                        if (user.followedUsers[i] == username) {
                            {
                                temp = i;
                                break;
                            }
                        }
                    }
                    if (temp != -1) user.followedUsers.splice(temp, 1);
                    console.log(user.followedUsers);
                    user.save(function (err) {
                        if (!err) console.log("followed deleted successfully");
                    });
                }
            }
        });
    }
};