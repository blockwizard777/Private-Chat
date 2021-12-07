var app = angular.module('myApp', []);

var regex = /(&zwj;|&nbsp;)/g;

var wSocket = {
    PING_INTERVAL : 5000,
    RECON_INTERVAL: 5000,
    TYPING_INTERVAL:500,
    READ_INTERVAL: 1500,
    REMOVE_INTERVAL: 2000,
    ROOM : 0,
    SVRTIME_DIFF : 0,

    DISPLAY_CNT : 20,

    IMAGE_EXTS : ['jpg', 'png', 'bmp', 'tiff', 'jpeg', 'gif', 'ico'],

    blop : new Audio('sounds/blop.wav'),

    socket : null,          //WebSocket Object
    typeTimer : null,
    pingTimer : null,
    reconTimer : null,

    ownerUser : {},
    scope: null,

    isConnected : false,
    isTyping : false,
    
    connect :  function() {
        if (wSocket.isConnected)    return;
        
        var protocol;

        if(window.location.protocol === 'https:') {
            protocol = 'wss://';
        } else {
            protocol = 'ws://';
        }

        if (wSocket.socket != null) wSocket.socket.close();

        wSocket.socket = new WebSocket(protocol + window.location.host + '/socket/websocket');

        wSocket.socket.onopen = wSocket.onopen;

        wSocket.socket.onclose = wSocket.onclose;

        wSocket.socket.onmessage = wSocket.onmessage;
    },
    onopen : function() {
        clearTimeout(wSocket.reconTimer);
        wSocket.isConnected = true;

        wSocket.sendSocket({
            type: 'intro',
            room: wSocket.ROOM,
            user_id: wSocket.ownerUser._id,
            user_info: wSocket.scope.ownerUser,
        });

        wSocket.sendSocket({
            type: 'getAlarms',
            room: wSocket.ROOM,
            user_id: wSocket.ownerUser._id,
        });
    },
    onmessage : function(e) {
        var data = JSON.parse(e.data);

        switch (data.type) {
            case "intro":       wSocket.scope.onIntro(data);                break;
            case "close":       wSocket.scope.onOffline(data);              break;
            case "roomstatus":  wSocket.scope.onUpdateUserStatus(data);     break;
            case "typing":      wSocket.scope.onChangeTypingStatus(data);   break;
            case "message":     wSocket.scope.onReceiveMessage(data);       break;

            case "getmoremessage": wSocket.scope.onProcessMoreMessage(data);break;

            //Rooms
            case "createRoom":      wSocket.scope.onRecvCreateRoom(data);       break;
            case "roomState":      wSocket.scope.onChangeRoomState(data);       break;
            case "removeRoom":      wSocket.scope.onRecvRemoveRoom(data);       break;

            //alarm
            case "alarm":           wSocket.scope.onRecvAlarm(data);            break;
        }
    },
    onclose : function() {
        clearTimeout(wSocket.typeTimer);
        clearTimeout(wSocket.pingTimer);
        wSocket.isTyping = false;

        if(wSocket.isConnected) {
            wSocket.isConnected = false;

            wSocket.reconTimer = setInterval(function() {
                console.warn('Connection lost, reconnecting...');
                wSocket.connect();
            }, wSocket.RECON_INTERVAL);
        }
    },
    sendSocket : function(obj, fncSuccess) {
        if (!wSocket.isConnected)    return;

        wSocket.socket.send(JSON.stringify(obj));
        
        if (wSocket.isConnected && fncSuccess != undefined)
            fncSuccess();
    }
};


app.controller('homeCtrl', ['$scope', '$http', 'userInfo', function($scope, $http, userInfo) {
    //Store chat user array
    $scope.ownerUser = {};
    $scope.arrUserList = [];

    //Store Room array
    $scope.arrMyRooms = [];
    $scope.arrInvitedRooms = [];

    $scope.curRoomInfo = null;

    //Store chat message history
    $scope.arrChatList = [];
    $scope.curServerTime = 0;
    $scope.svrTimeInterval = 0;

    $scope.strChatMsg = "";

    userInfo.getUserList($scope);

    $(".chat-discussion").bind("scroll", function(e) {
        if ($(this).scrollTop() == 0) {
            if ($scope.arrChatList.length == 0) return;

            $scope.getMoreMessages($scope.arrChatList [0].sendTime);
        }
    });

    $scope.onClickUser = function(userInfo) {
        if (userInfo.selected)  return;

//        if ($scope.curRoomInfo != null) {
            $scope.onClickMyRoom(null, userInfo);
//        }
        for (var i = 0; i < $scope.arrUserList.length; i ++)
            $scope.arrUserList [i].selected = false;
        userInfo.selected = true;
        
        $scope.arrChatList = [];

        $scope.curServerTime = $scope.svrTimeInterval + Date.now();
        $scope.canGetMessage = 2;
        $scope.getMoreMessages($scope.curServerTime);
        $("input[name=message]").focus();

        window.setTimeout(function() {
            userInfo.new = 0;
            $scope.$apply();
        }, 2000);
    }

    $scope.onChatKeydown = function($event) {
        if($event.which == 13) {
            if(wSocket.isConnected && wSocket.isTyping) {
                wSocket.isTyping = false;
//                clearTimeout(wSocket.typeTimer);
            }
            if(wSocket.isConnected)
                $scope.onSendMsg();
            $event.preventDefault();
        } else if(wSocket.isConnected) {
            if(!wSocket.isTyping) {
                wSocket.isTyping = true;
                wSocket.sendSocket({
                    type: 'typing',
                    room: wSocket.ROOM,
                    status: true
                });
            }

            clearTimeout(wSocket.typeTimer);
            wSocket.typeTimer = setTimeout(function() {
                wSocket.isTyping = false;
                wSocket.sendSocket({
                    type: 'typing',
                    room: wSocket.ROOM,
                    status: false
                });
            }, wSocket.TYPING_INTERVAL);
        }
    }

    $scope.getSelectedUsers = function() {
        var selectedUsers = [];
        for (var i in $scope.arrUserList) {
            var userInfo = $scope.arrUserList [i];

            if (!userInfo.selected)   continue;
            selectedUsers.push(userInfo._id);
        }
        return selectedUsers;
    }

    $scope.onSendMsg = function() {
        $("input[name=message]").focus();
        var value = $scope.strChatMsg.replace(regex, ' ').trim();
        if (value == "") {
            $("input[name=message]").parent().addClass('has-error');
            window.setTimeout(function() {
                $("input[name=message]").parent().removeClass('has-error');
            }, 500);
            return;
        }
        
        if ($scope.curRoomInfo == null) {
            //Check Selected User
            var selectedUsers = $scope.getSelectedUsers();
            if (selectedUsers.length == 0) {
                $(".chat-users").parent().parent().parent().addClass('has-div-error');
                window.setTimeout(function() {
                    $(".chat-users").parent().parent().parent().removeClass('has-div-error');
                }, 500);
                return;
            }

            wSocket.sendSocket({
                type : 'message',
                room: wSocket.ROOM,
                users: selectedUsers,
                value: value,
            });
        } else {
            if (!$scope.curRoomInfo.state) {
                $("#dlg-alert").modal().show();
                $("#dlg-alert button").focus();
                return;
            }
            wSocket.sendSocket({
                type : 'message',
                room: wSocket.ROOM,
                value: value,
            });
        }

        $scope.strChatMsg = "";
    }

    //direction : 0:top 1:bottom
    $scope.addMessage = function(data, direction) {
        var sender_name = getUserNameFromId(data.senderId);
        if (data.senderId == $scope.ownerUser._id)
            sender_name = $scope.ownerUser.userName;

        var receiver_name = '';
        var receiver_id = 0;
        var isMyMessage = false;
        if (data.receiverId != undefined) {
            receiver_name = getUserNameFromId(data.receiverId);
            receiver_id = data.receiverId;
            isMyMessage = (data.senderId == $scope.ownerUser._id);
        } else {
            isMyMessage = (data.senderId == $scope.ownerUser._id);
        }

        data.sendTime = Number.parseInt(data.sendTime);

        var ext = data.content.substr(data.content.lastIndexOf(".") + 1, data.content.length).toLowerCase();

        var isImage = false;
        for (var i = 0; i < wSocket.IMAGE_EXTS.length; i ++)
            if (wSocket.IMAGE_EXTS [i] == ext) {
                isImage = true;
                break;
            }

        var msg = {
            _id : data._id,
            sender_id : data.senderId,
            sender_name: sender_name,
            receiver_id : receiver_id,
            receiver_name: receiver_name,
            msg : data.content,
            attachFile : data.attachFile,
            created : (new Date(data.sendTime)).toUTCString(),
            sendTime: data.sendTime,
            isMyMessage : isMyMessage,
            isRead : data.senderId == $scope.ownerUser._id ? 1 : data.isRead,
            isSameAsUp : false,
            isImage : isImage
        }
        
        if ($scope.curRoomInfo == null) {
            var users = $scope.getSelectedUsers();
            if (users.length == 0)  return msg;
            
            if (users [0] != msg.sender_id
                && users [0] != msg.receiver_id)
                    return msg;
        }

        if (direction == 1)
            $scope.arrChatList.push(msg);
        else
            $scope.arrChatList.unshift(msg);
        
        return msg;
    }

    var getUserNameFromId = function(user_id) {
        for (var i = 0; i < $scope.arrUserList.length; i ++)
            if ($scope.arrUserList [i]._id == user_id)
                return $scope.arrUserList [i].userName;
        
        return null;
    }

    /* Message Process Functions */
    //{intro, user_id}
    var changeUserStatus = function(user_id, status, user_info) {
        var isNew = true;
        for (var i in $scope.arrUserList) {
            var userInfo = $scope.arrUserList [i];

            if (userInfo._id == user_id) {
                $scope.arrUserList [i].status = status;
                $scope.arrUserList [i].isTyping = false;
                isNew = false;
                break;
            }
        }

        if (user_id == $scope.ownerUser._id)
            isNew = false;

        if (isNew) {
            //Registed after login.
            user_info.status = 1;
            user_info.isTyping = false;
            $scope.arrUserList.push(user_info);
        }
        $scope.changeOnlineCount();
        $scope.$apply();
    };
    $scope.onIntro = function(data) {
        changeUserStatus(data.user_id, 1, data.user_info);
    }
    $scope.onOffline = function(data) {
        changeUserStatus(data.user_id, 0, data.user_info);
    }
    /* Update User Status after send intro */
    //{roomstatus, users:[user_id, ...]}
    $scope.onUpdateUserStatus = function(data) {
        //Set Time Diff
        wSocket.SVRTIME_DIFF = data.svrTime - Date.now();

        var userList = data.users;

        for (var i in $scope.arrUserList) {
            var userInfo = $scope.arrUserList [i];

            for (var j = 0; j < userList.length; j ++)
                if (userInfo._id == userList [j]) {
                    $scope.arrUserList [i].status = 1;

                    delete userList [j];
                    break;
                }
        }
        $scope.changeOnlineCount();
        $scope.$apply();
    }
    /* Update User Typing Status */
    //{typing, user_id, status}
    $scope.onChangeTypingStatus = function(data) {
        var user_id = data.user_id;
        var status = data.status;

        for (var i in $scope.arrUserList) {
            var userInfo = $scope.arrUserList [i];

            if (userInfo._id == user_id) {
                $scope.arrUserList [i].isTyping = status;
                $scope.arrUserList [i].status = true;
                $scope.$apply();
                break;
            }
        }
    }

    /* Receive a message from a user */
    //message, room, sender_id, receiver_id, value, sendTime
    //if broadcast message, it hasn't receiver_id.
    $scope.onReceiveMessage = function(data) {
        if (data.room != wSocket.ROOM)  return;

        if (data.senderId != $scope.ownerUser._id)
            wSocket.blop.play();

        $scope.addMessage(data, 1);
        
        if ($scope.curRoomInfo == null)
            $scope.processSameMsg();

        $scope.$apply();

        $(".chat-discussion").animate({
            scrollTop : $(".chat-discussion").prop("scrollHeight")
        }, 500);

        if (data.senderId != $scope.ownerUser._id)
            window.setTimeout($scope.clearReadMark, wSocket.READ_INTERVAL);
    }

    /* Send request packet to show on top chat discussion */
    $scope.canGetMessage = 2;       //2:normal 1:loading 0:loaded end
    $scope.getMoreMessages = function(sendTime) {
        var users = $scope.getSelectedUsers();
        if (wSocket.ROOM == 0 && users.length == 0)  return;

        if ($scope.canGetMessage != 2)  return;
        $scope.canGetMessage = 1;

        var sendTime = sendTime;
        wSocket.sendSocket({
            type:"getmoremessage",
            room: wSocket.ROOM,
            user: users [0],

            sendTime: sendTime,
            count: wSocket.DISPLAY_CNT,
        });
    }

    $scope.onProcessMoreMessage = function(data) {
        var oldHeight = $(".chat-discussion").prop("scrollHeight");

        var messages = data.messages;

        var isRead = true;
        for (var i = 0; i < messages.length; i ++) {
            if (!$scope.addMessage(messages [i], 0).isRead)
                isRead = false;
        }
        
        if ($scope.curRoomInfo == null) {
            if (!isRead)    wSocket.blop.play();
            $scope.processSameMsg();
        }
        $scope.$apply();
        
        var newHeight = $(".chat-discussion").prop("scrollHeight");
        $(".chat-discussion").scrollTop(newHeight - oldHeight);

        if (messages.length < wSocket.DISPLAY_CNT)
            $scope.canGetMessage = 0;
        else $scope.canGetMessage = 2;

        window.setTimeout($scope.clearReadMark, wSocket.READ_INTERVAL);
    }

    $scope.processSameMsg = function() {
        for (var i = $scope.arrChatList.length - 1; i > 0; i --) {
            var prevMsg = $scope.arrChatList [i - 1];
            var curMsg = $scope.arrChatList [i];

            if (prevMsg.sendTime == curMsg.sendTime)
                $scope.arrChatList [i].isSameAsUp = true;
        }
    }

    $scope.clearReadMark = function() {
        for (var i = 0; i < $scope.arrChatList.length; i ++) {
            $scope.arrChatList [i].isRead = 1;
        }
        $scope.$apply();
    }


    /* Attach File */
    $scope.fileParam = {};
    $scope.dropZone = function() {
        Dropzone.options.myAwesomeDropzone = {
            url: "/uploadAttachFile",
            addRemoveLinks:true, 
            parallelUploads: 1,
            maxFiles: 100,
            maxFilesize: 1024,

            params: $scope.fileParam,

            accept: function(file, done) {
                var selUsers = $scope.getSelectedUsers();
                if ($scope.curRoomInfo == null && selUsers.length == 0) {
//                    alert("Please select users.");
                    $(".chat-users").parent().parent().parent().addClass('has-div-error');
                    window.setTimeout(function() {
                        $(".chat-users").parent().parent().parent().removeClass('has-div-error');
                    }, 500);
                    this.removeFile(file);
                    return done();
                }
                $scope.fileParam.room = wSocket.ROOM;
                $scope.fileParam._id = $scope.ownerUser._id;
                $scope.fileParam.users = JSON.stringify(selUsers);
                $scope.fileParam.sendTime = Date.now() + wSocket.SVRTIME_DIFF;

                return done();
            },
            complete: function(file) {
                var drop = this;
                window.setTimeout(function(){
                    drop.removeFile(file);
                }, wSocket.REMOVE_INTERVAL);

                if (file._removeLink) {
                    return file._removeLink.textContent = this.options.dictRemoveFile;
                }
            },
        }
    }

    $scope.dropZone();

    $scope.changeOnlineCount = function() {
        $scope.nUserOnline = 0;

        for (var i = 0; i < $scope.arrUserList.length; i ++)
            if ($scope.arrUserList [i].status)
                $scope.nUserOnline ++;
    }
    
    window.setTimeout(function() {
        $(".chat-discussion").animate({
            scrollTop : $(".chat-discussion").prop("scrollHeight")
        }, 500);
    }, 500);

    /* Rooms */
    $scope.onShowCreateRoom = function() {
        var isSelected = false;
        for (var i = 0; i < $scope.arrUserList.length; i ++)
            if ($scope.arrUserList [i].selected)
                isSelected = true;
        
//        $("#btn-create-room").trigger("click");
        $("#dlg-room-name").modal();
        window.setTimeout(function() {
            $("#edt-room-name").focus();
        }, 100);
    }

    $scope.onSelectRoomUser = function(userInfo) {
        if (userInfo.rselected == undefined)
            userInfo.rselected = true;
        else
            userInfo.rselected = !userInfo.rselected;
        
        $("#edt-room-name").focus();
    }

    $scope.strRoomName = "";
    $scope.onCreateRoom = function() {
        if ($scope.strRoomName == "") {
//            alert("Input your room title.");
            $("#edt-room-name").parent().addClass('has-error');
            window.setTimeout(function() {
                $("#edt-room-name").parent().removeClass('has-error');
            }, 500);
            $("#edt-room-name").focus();
            return;
        }

        var users = [];
        for (var i = 0; i < $scope.arrUserList.length; i ++) {
            if ($scope.arrUserList [i].rselected)
                users.push($scope.arrUserList [i]._id);
            
            $scope.arrUserList [i].rselected = false;
        }
        
        if (users.length == 0) {
//            alert("Please select user.");
            $(".modal .chat-users").addClass('has-div-error');
            window.setTimeout(function() {
                $(".modal .chat-users").removeClass('has-div-error');
            }, 500);
            return;
        }

        var fd = new FormData();

        fd.append("roomName", $scope.strRoomName);
        fd.append("users", JSON.stringify(users));

        $http.post("/createRoom", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined,'dataType':'application/json'}
        })
    
        .success(function(roomInfo){
            $scope.strRoomName = "";
            $scope.arrMyRooms.push(roomInfo);
            $scope.onClickMyRoom(roomInfo);
            $scope.$apply();
        })
        .error(function(data){
            alert("Error Code : " + data);
        });
        
        $("button[data-dismiss=modal]").trigger("click");
    }

    $scope.onRecvCreateRoom = function(data) {
        $scope.arrInvitedRooms.push(data.roomInfo);
        $scope.$apply();

        if (data.roomInfo.userId._id != $scope.ownerUser._id) {
            $scope.showRoomAlarm(data.roomInfo);

            var roomInfo = $scope.searchRoom(data.roomInfo._id);
            if (roomInfo == null)   return;
            roomInfo.new = true;
        }
    }

    $scope.unselectUsers = function() {
        for (var i = 0; i < $scope.arrUserList.length; i ++)
            $scope.arrUserList [i].selected = false;
    }

    $scope.unselectRooms = function() {
        for (var i = 0; i < $scope.arrMyRooms.length; i ++)
            $scope.arrMyRooms [i].selected = false;
        for (var i = 0; i < $scope.arrInvitedRooms.length; i ++)
            $scope.arrInvitedRooms [i].selected = false;
    }

    /* roomInfo : null  && userInfo != null     Clicked a user in userlist.
                            userInfo== null     Removed a user and kick the room */
    $scope.onClickMyRoom = function(roomInfo, userInfo) {
        $scope.unselectUsers();
        $scope.unselectRooms();

        $scope.curRoomInfo = roomInfo;

        var roomId = 0;
        var prevSubRoomId = 0;
        var subRoomId = 0;

        var users = $scope.getSelectedUsers();
        if (users.length != 0)
            prevSubRoomId = users [0];

        if (roomInfo != null) {
            roomInfo.selected = true;
            roomId = roomInfo._id;
            window.setTimeout(function() {
                roomInfo.new = false;
                roomInfo.alarm = 0;
                $scope.$apply();
            }, 2000);
        } else {
            if (userInfo != null)
                subRoomId = userInfo._id;
        }
        wSocket.sendSocket({
            type: 'intro',
            prevRoom: wSocket.ROOM,
            room: roomId,
            subRoomId: subRoomId,
            user_id: wSocket.ownerUser._id,
            user_info: wSocket.scope.ownerUser,
        });

        wSocket.ROOM = roomId;

        $scope.arrChatList = [];

        $scope.curServerTime = $scope.svrTimeInterval + Date.now();
        $scope.canGetMessage = 2;
        $scope.getMoreMessages($scope.curServerTime);
        
        $("input[name=message]").focus();
    }

    $scope.onToggleRoomState = function() {
        //Check manager of room.
        if ($scope.curRoomInfo.userId._id != $scope.ownerUser._id)      return;

        $scope.curRoomInfo.state = 1 - $scope.curRoomInfo.state;
        wSocket.sendSocket({
            type: 'roomState',
            room: $scope.curRoomInfo._id,
            state: $scope.curRoomInfo.state,
        });
    }

    $scope.onChangeRoomState = function(data) {
        var roomId = data.room;
        var state = data.state;
        
        var rooms = [$scope.arrMyRooms, $scope.arrInvitedRooms];

        for (var r = 0; r < rooms.length; r ++)
            for (var i = 0; i < rooms [r].length; i ++)
                if (rooms [r][i]._id == roomId) {
                    rooms [r][i].state = state;
                    $scope.$apply();
                    return;
                }
    }

    $scope.onRemoveRoom = function(roomInfo) {
        if (!confirm("Do you want to delete this room?"))   return;

        wSocket.sendSocket({
            type: 'removeRoom',
            room: roomInfo._id,
        });
    }

    $scope.onRecvRemoveRoom = function(data) {
        var roomId = data.room;

        var rooms = [$scope.arrMyRooms, $scope.arrInvitedRooms];

        for (var r = 0; r < rooms.length; r ++)
            for (var i = 0; i < rooms [r].length; i ++)
                if (rooms [r][i]._id == roomId) {
                    rooms [r].splice(i, 1);

                    if ($scope.curRoomInfo != null && $scope.curRoomInfo._id == roomId)
                        $scope.onClickMyRoom(null, null);
                    $scope.$apply();
                    return;
                }
    }

    $scope.searchRoom = function(roomId) {
        var rooms = [$scope.arrMyRooms, $scope.arrInvitedRooms];

        for (var r = 0; r < rooms.length; r ++)
            for (var i = 0; i < rooms [r].length; i ++)
                if (rooms [r][i]._id == roomId) {
                    return rooms [r][i];
                }
        return null;
    }

    $scope.onClickInvRoom = $scope.onClickMyRoom;

    
    /* Alarm */
    $scope.onRecvAlarm = function(data) {
        var alarms = data.alarms;

        if (alarms.length == 0) return;        
        wSocket.blop.play();

        for (var i = 0; i < alarms.length; i ++) {
            if (alarms [i].type == 0) {
                //Created Room
                var roomInfo = $scope.searchRoom(alarms [i].refId);
                if (roomInfo == null)   continue;
                $scope.showRoomAlarm(roomInfo);
                roomInfo.new = true;
            } else if (alarms [i].type == 1) {
                //ChatHistory
                for (var k = 0; k < $scope.arrUserList.length; k ++)
                    if ($scope.arrUserList [k]._id == alarms [i].refId) {
                        if ($scope.arrUserList [k].new == undefined)
                            $scope.arrUserList [k].new = 0;
                        $scope.arrUserList [k].new ++;
                        break;
                    }
            } else if (alarms [i].type == 2) {
                //BChatHistory
                var roomInfo = $scope.searchRoom(alarms [i].refId);
                if (roomInfo == null)   continue;
                if (roomInfo.alarm == undefined)    roomInfo.alarm = 0;
                roomInfo.alarm ++;
            }
        }

        $scope.$apply();
    }

    $scope.showRoomAlarm = function(roomInfo) {
        toastr.options = {
            closeButton: true,
            debug: true,
            progressBar: true,
            positionClass: 'toast-top-right',
            onclick: function() {$scope.onClickMyRoom(roomInfo);}
        };

        toastr["success"]("<b>" + roomInfo.userId.userName + "</b> invites you. <br>Please enter room.", 
                        roomInfo.roomName);
    }

    $(".wrapper-content").removeClass("hide");
}]);


app.service('userInfo', ['$http', function ($http) {
    this.getUserList = function(scope){
        $http.get("/getUserList").success(function(data){
            scope.ownerUser = data.owner;
            scope.arrUserList = data.users;
            scope.arrMyRooms = data.myRooms;

            scope.arrInvitedRooms = data.invRooms;
            scope.curServerTime = data.curServerTime;
            scope.svrTimeInterval = data.curServerTime - Date.now();

            wSocket.ownerUser = data.owner;
            wSocket.scope = scope;
            wSocket.connect();
 //          scope.$apply();
        });
    }
}]);


app.directive('fileModel', ['$parse', function ($parse) {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        
        element.bind('change', function(){
            scope.$apply(function(){
            modelSetter(scope, element[0].files[0]);
            });
        });
    }
};
}]);