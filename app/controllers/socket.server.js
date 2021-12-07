var Chathistory   = require('mongoose').model('Chathistory');
var Alarm   = require('mongoose').model('Alarm');
var Room   = require('mongoose').model('Room');
var Bchathistory   = require('mongoose').model('Bchathistory');

var globals = require('./global.function');

var sockjs = require('sockjs');
var chalk = require('chalk');
var fs = require('fs');
var multiparty = require('multiparty');


var chat = sockjs.createServer();

var clients = [];       //[roomId][conn.id]{conn, user_id}
                        //[roomId = 0][conn.id]{conn, subRoomId, user_id}
var connRooms = [];     //[conn.id] = roomId

var searchUser = function(roomId, user_id, subRoomId) {
    var conns = [];

    for (var key in clients [roomId])
        if (clients [roomId][key].user == user_id
            && (subRoomId == undefined || clients [roomId][key].subRoomId == subRoomId))
            conns.push(clients [roomId][key].conn);
    
    return conns;
}

var getConnection = function(user_id) {
    var conns = [];

    for (var roomId in clients)
        for (var key in clients [roomId])
            if (clients [roomId][key].user == user_id)
                conns.push(clients [roomId][key].conn);
    
    return conns;
}

/* data : {users, value, [attachFile]} */
var sendMessageToOutSide = function(sender_id, data, sendTime) {
    var j = 0;
    var conns = [];
    var alarms = [];
    var roomId = 0;
    var sender_conns = searchUser(roomId, sender_id);

    var chats = [];
    
    for (var i = 0; i < data.users.length; i ++) {
        var chat = new Chathistory();
        chat.senderId = sender_id;
        chat.receiverId = data.users [i];
        chat.content = data.value;
        chat.sendTime = sendTime;
        if (data.attachFile != undefined)
            chat.attachFile = data.attachFile;
        else
            data.attachFile = '';

        var receiver_conns = searchUser(roomId, data.users [i], sender_id);
        conns [i] = receiver_conns;

        if (receiver_conns.length != 0) {
            chat.isRead = 1;
            alarms [i] = false;
        } else {
            //Add Alarms
            chat.isRead = 0;
            alarms [i] = true;
        }

        chats.push(chat);
        
        chat.save(function(error) {
            if (error) {
                console.log("Database Save ERROR");
                j ++;
                return;
            }

            if (alarms [j] == true) {
                //Add Alarms
                /////////////////////////////////////////////////////////////////////
                var other_conns = getConnection(data.users [j]);
                var alarmDat = {
                    userId: data.users [j],
                    type: 1,
                    refId: sender_id,
//                    refId: chats [j]._id,
                    content: data.value};

                if (other_conns.length == 0)
                    (new Alarm(alarmDat)).save();
                else {
                    for (var k = 0; k < other_conns.length; k ++)
                        other_conns [k].write(JSON.stringify({
                            type: "alarm",
                            alarms: [alarmDat]
                        }));
                }
            }

            for (var k = 0; k < conns [j].length; k ++)
                conns [j][k].write(JSON.stringify({
                    _id : chats [j]._id,
                    type : "message",
                    room : roomId,
                    senderId : sender_id,
                    receiverId: data.users [j],
                    content : data.value,
                    sendTime: sendTime,
                    attachFile: data.attachFile,
                    isRead: 0
                }));

            //Send Message to me.
            for (var k = 0; k < sender_conns.length; k ++)
                sender_conns [k].write(JSON.stringify({
                    _id : chats [j]._id,
                    type : "message",
                    room : roomId,
                    senderId : sender_id,
                    receiverId: data.users [j],
                    content : data.value,
                    sendTime: sendTime,
                    attachFile: data.attachFile,
                    isRead: 1
                }));

            j ++;
        });
    }
}

var sendMessageToSameRoom = function(roomId, sender_id, data, sendTime) {
    var alarms = [];
    
    Room.findOne({"_id":roomId}, function(err, roomInfo) {
        if (err) {
            console.log(err);
            return;
        }
        var manager_conns = searchUser(roomId, roomInfo.userId);
        data.users = roomInfo.invited;

        var chat = new Bchathistory();
        chat.roomId = roomInfo._id; 
        chat.senderId = sender_id;
        chat.content = data.value;
        chat.sendTime = sendTime;
        if (data.attachFile != undefined)
                chat.attachFile = data.attachFile;
            else
                data.attachFile = '';
        
        chat.save(function(error) {
            if (error) {
                console.log(error);
                return;
            }

            //Send Pcks to same room users.
            for (var i = 0; i < data.users.length; i ++) {
                var receiver_conns = searchUser(roomId, data.users [i]);

                if (receiver_conns.length != 0)
                    alarms [i] = false;
                else
                    alarms [i] = true;

                if (alarms [i] == true) {
                    //Add Alarms
                    ///////////////////////////////////////////////////////////
                    /*(new Alarm({
                        userId: data.users [i],
                        type: 2,
                        refId: chat._id,
                        content: data.value
                    })).save();
                    */
                    var other_conns = getConnection(data.users [i]);
                    var alarmDat = {
                        userId: data.users [i],
                        type: 2,
                        refId: roomId,
//                        refId: chat._id,
                        content: data.value};

                    if (other_conns.length == 0)
                        (new Alarm(alarmDat)).save();
                    else {
                        for (var k = 0; k < other_conns.length; k ++)
                            other_conns [k].write(JSON.stringify({
                                type: "alarm",
                                alarms: [alarmDat]
                            }));
                    }
                }

                for (var k = 0; k < receiver_conns.length; k ++)
                    receiver_conns[k].write(JSON.stringify({
                        _id : chat._id,
                        type : "message",
                        room : roomId,
                        senderId : sender_id,
                        content : data.value,
                        sendTime: sendTime,
                        attachFile: data.attachFile,
                        isRead: 0
                    }));
            }

            //Send Message to manager.
            if (manager_conns.length == 0) {
                //Add Alarm to manager.
                ////////////////////////////////////////////////////////////////////////
                /*(new Alarm({
                    userId: roomInfo.userId,
                    type: 2,
                    refId: chat._id,
                    content: data.value
                })).save();*/
                
                var other_conns = getConnection(roomInfo.userId);
                var alarmDat = {
                    userId: roomInfo.userId,
                    type: 2,
                    refId: roomId,
                    content: data.value};

                if (other_conns.length == 0)
                    (new Alarm(alarmDat)).save();
                else {
                    for (var k = 0; k < other_conns.length; k ++)
                        other_conns [k].write(JSON.stringify({
                            type: "alarm",
                            alarms: [alarmDat]
                        }));
                }
            }
            for (var k = 0; k < manager_conns.length; k ++)
                manager_conns [k].write(JSON.stringify({
                    _id : chat._id,
                    type : "message",
                    room : roomId,
                    senderId : sender_id,
                    content : data.value,
                    sendTime: sendTime,
                    attachFile: data.attachFile,
                    isRead: 1
                }));
        });
    });
}

var sendPckToAll = function(users, data, alarmFnc) {
    for (var i = 0; i < users.length; i ++) {
        var user = users [i];
        var conns = getConnection(user);

        for (var j = 0; j < conns.length; j ++)
            conns [j].write(JSON.stringify(data));

        if (conns.length == 0 && alarmFnc != undefined) {
            //Add Alarm
            alarmFnc(user, data);
        }
    }
}

module.exports = function(http) {
    chat.on('connection', function(conn) {
        console.log('socket', chalk.underline(conn.id) + ': connected (' + conn.headers['x-forwarded-for'] + ')');

        //Send data to all connection in one room
        var sendRooms = function(roomId, data) {
            for (var roomId in clients)
                for (var key in clients [roomId]) {
                    clients [roomId] [key].conn.write(JSON.stringify(data));
                }
        }

        var sendPckInRoom = function(roomId, data) {
            for (var key in clients [roomId]) {
                clients [roomId] [key].conn.write(JSON.stringify(data));
            }
        }

        conn.on('data', function(message) {
            var data = JSON.parse(message);
            var roomId = data.room;

            if (data.type == "intro") {
                if (data.prevRoom == 0 && data.room == 0) {
                    clients [roomId][conn.id].subRoomId = data.subRoomId;

                    return;
                }
                if (data.prevRoom != undefined) {
                    //If conn was in room, kick it.
                    delete clients [data.prevRoom][conn.id];
                    delete connRooms [conn.id];
                    sendRooms(data.prevRoom, {
                        type : "close",
                        user_id : data.user_id
                    });
                }

                if (clients [roomId] == undefined)
                    clients [roomId] = [];
                else {
                    //Send Online Packet to same Room.
                    sendRooms(roomId, {
                        type : "intro",
                        user_id : data.user_id,
                        user_info: data.user_info,
                    });

                    if (roomId != 0) {
                    } else {
                        //Send Room Status to current Conn.
                        var idList = [];
                        for (var room in clients)
                            for (var key in clients [room])
                                idList.push(clients [room][key].user);
                        
                        idList.push(data.user_id);
                        conn.write(JSON.stringify({
                            type: "roomstatus",
                            users: idList,
                            svrTime: Date.now()}));
                    }
                }

                clients [roomId][conn.id] = {
                    conn : conn,
                    user : data.user_id,
                    subRoomId: data.subRoomId};

                connRooms [conn.id] = roomId;
            }

            if (data.type == "typing") {
                var sndData = {
                    type : "typing",
                    user_id : clients [roomId][conn.id].user,
                    status : data.status
                };

                if (data.status == false) {
                    sendRooms(roomId, sndData);
                } else {
                    if (roomId == 0) {
                        var subRoomId = clients [roomId][conn.id].subRoomId;
                        var conns = searchUser(roomId, subRoomId);
                        for (var i = 0; i < conns.length; i ++)
                            conns [i].write(JSON.stringify(sndData));
                    } else
                        sendPckInRoom(roomId, sndData);
                }
            }

            if (data.type == "message") {
                var sender_id = clients [roomId][conn.id].user;

                if (roomId == 0) {
                    sendMessageToOutSide(sender_id, data, Date.now());
                } else {
                    sendMessageToSameRoom(roomId, sender_id, data, Date.now());
                }
            }

            if (data.type == "getmoremessage") {
                var userId = clients [roomId][conn.id].user;
                var sendTime = data.sendTime;
                var count = data.count;

                if (roomId == 0) {
                    var otherUsrId = data.user;
                    var msgQuery = Chathistory.find({
                        $or: [
                            {$and: [
                                {"senderId":userId},
                                {"receiverId":otherUsrId}
                            ]},
                            {$and: [
                                {"receiverId":userId},
                                {"senderId":otherUsrId},
                            ]}],
                        "sendTime":{$lt:sendTime}
                    });
                    msgQuery.sort('-sendTime');
                    msgQuery.limit(count);
                    msgQuery.exec(function(error, messages) {
                        if (error != null)  return;

                        conn.write(JSON.stringify({
                            type:"getmoremessage",
                            messages:messages
                        }));

                        for (var i = 0; i < messages.length; i ++) {
                            if (messages[i].isRead == 0) {
                                Chathistory.update(
                                    {_id: messages [i]._id},
                                    {$set: {isRead: 1}}, function(error) {
                                    }
                                );
                            }
                        }
                    });
                } else {
                    var msgQuery = Bchathistory.find({
                        "roomId":roomId,
                        "sendTime":{$lt:sendTime}
                    });
                    msgQuery.sort('-sendTime');
                    msgQuery.limit(count);
                    msgQuery.exec(function(error, messages) {
                        if (error != null)  return;

                        conn.write(JSON.stringify({
                            type:"getmoremessage",
                            messages:messages
                        }));
                    });
                }
            }

            if (data.type == "roomState") {
                var state = data.state;
                Room.update(
                    {_id: roomId},
                    {$set: {state: state}}, function(error) {}
                );
                sendRooms(roomId, {
                    type : "roomState",
                    room : roomId,
                    state: state
                });
            }

            if (data.type == "removeRoom") {
                Room.remove({_id: roomId}, function(err){});
                Bchathistory.remove({roomId: roomId}, function(err) {});

                sendRooms(roomId, {
                    type : "removeRoom",
                    room : roomId
                });
            }

            if (data.type == "getAlarms") {
                var userId = data.user_id;
                Alarm.find({userId: userId}, function(err, alarms) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (alarms.length == 0)   return;

                    var conns = getConnection(userId);
                    for (var i = 0; i < conns.length; i ++)
                        conns [i].write(JSON.stringify({
                            type: "alarm",
                            alarms: alarms
                        }));
                    
                    for (var i = 0; i < alarms.length; i ++)
                        Alarm.remove({_id: alarms [i]._id}, function(err) {});
                });
            }
        });

        conn.on('close', function() {
            console.error("Connection closed " + conn.id);

            var roomId = connRooms [conn.id];
            
            if (clients [roomId] == undefined)          return;
            if (clients [roomId][conn.id] == undefined) return;

            var user_id = clients [roomId][conn.id].user;

            delete clients [roomId][conn.id];
            delete connRooms [conn.id];

            //Send Offline Packet to same Room.
            sendRooms(roomId, {
                type : "close",
                user_id : user_id
            });
        });
    });

    chat.installHandlers(http, {prefix:'/socket', log:function(){}});

    return {
        uploadAttachFile : uploadAttachFile,
        downloadUploadedFile : downloadUploadedFile,
        createRoom : createRoom,
    };
}


var uploadAttachFile = function(req, res, next) {
    /*if (req.session.user == null) {
        res.redirect("/");
        return;
    }*/
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {        
        var roomId = fields.room [0];
        var users = JSON.parse(fields.users [0]);
        var sendTime = fields.sendTime [0];
        var fileName = files.file [0].originalFilename;
        var sender_id = fields._id [0];
        var dir = globals.getUploadDir(sender_id);

        fs.stat(dir, function(err, stats) {
            if (err)
                fs.mkdir(dir);
            var path = globals.getUploadPath(sender_id, sendTime);

            var readerStream = fs.createReadStream(files.file[0].path);
            var writerStream = fs.createWriteStream(path);
            readerStream.pipe(writerStream);
            
            fs.unlink(files.file[0].path);

            //data : {users, value}
            var data = {};
            data.users = users;
            data.value = fileName;
            data.attachFile = sendTime;
            
            if (roomId == 0)
                sendMessageToOutSide(sender_id, data, sendTime);
            else
                sendMessageToSameRoom(roomId, sender_id, data, sendTime);
            
            res.end();
        });
    });
}

var downloadUploadedFile = function(req, res, next) {
    var roomId = req.params.roomId;
    var chat_id= req.params.id;

    if (roomId == 0) {
        Chathistory.findOne({_id: chat_id}, function(error, chat) {
            if ((req.session.user == undefined)
                || chat == null
                || chat.attachFile == ''
                || (req.session.user._id != chat.senderId
                && req.session.user._id != chat.receiverId)) {
                    res.redirect("/");
                    return;
                }
            
            if (chat == null) {
                res.end();
                return;
            }
            var fileName = chat.attachFile;
            var filePath = globals.getUploadPath(chat.senderId, fileName);
            downloadFile(res, filePath, chat.content);
        });
    } else {
        Bchathistory.findOne({_id: chat_id}, function(error, bchat) {
            if (error)  {
                res.redirect("/");
                return;
            }
            if (bchat == null) {
                res.end();
                return;
            }

            var fileName = bchat.attachFile;
            var filePath = globals.getUploadPath(bchat.senderId, fileName);
            downloadFile(res, filePath, bchat.content);
        });
    }
}

var downloadFile = function(res, filePath, fileName) {
    var headerNames = res._headerNames;
    headerNames ['Content-Description'] = 'Content-Description';
    headerNames ['Content-Type'] = 'Content-Type';
    headerNames ['Content-Disposition'] = 'Content-Disposition';
    headerNames ['Content-Length'] = 'Content-Length';
    res._headerNames = headerNames;

    res._headers ['Content-Description'] = 'File Transfer';
    res._headers ['Content-Type'] = 'application/octet-stream';


    fs.stat(filePath, function(err, stats) {
        if (stats.isDirectory()) {
            res.end();
            return;
        }
        res._headers ['Content-Disposition'] ='attachment; filename=' + fileName + '';
        res._headers ['Content-Length'] = stats.size;

        res.send(fs.readFileSync(filePath));
        res.end();
    });
}



var createRoom = function(req, res, next) {
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        var roomName = fields.roomName [0];
        var users = JSON.parse(fields.users [0]);

        var room = new Room();

        room.userId = req.session.user._id;
        room.roomName = roomName;
        room.invited = users;
        room.save(function(error) {
            if (error) {
                console.log(error);
                return res.end("error");
            }

            Room.findOne({"_id": room._id})
                .populate("userId")
                .populate("invited")
                .exec(function(err, roomInfo) {
                    if (err) {
                        console.log(err);
                        res.end();
                        return;
                    }
                    sendPckToAll(users, {
                        type: "createRoom",
                        roomInfo: roomInfo
                    }, function(user, data) {
                        var alarm = new Alarm();
                        alarm.userId = user;
                        alarm.type = 0;
                        alarm.refId = roomInfo._id;
//                        alarm.content = "You are invited by " + req.session.user.userName + " in " + data.roomName + ".";
                        alarm.save();
                    });
                    res.json(roomInfo);
                });
        });
    });
};