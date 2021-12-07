var mongoose = require('mongoose'),
  crypto = require('crypto'),
  Schema = mongoose.Schema;
var RoomSchema = new Schema({
  userId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  roomName:  {
    type: String
  },
  invited: [ {type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],

  createdTime: {
    type: Number,
    default: Date.now()
  },
  
  state : {
    type:Number,
    default: 1    //1 : Chatting, 0 : Paused
  }
});

mongoose.model('Room', RoomSchema);