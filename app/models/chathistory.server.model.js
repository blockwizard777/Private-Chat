var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var ChathistorySchema = new Schema({
  senderId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  receiverId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  content:  {
    type: String,
    default : ''
  },
  attachFile:  {
    type: String,
    default : ''
  },
  sendTime:  {
    type: Number
  },
  isRead: {
    type : Number,
    default : 0,      //1 : after read, 0 : before read
  }
});

mongoose.model('Chathistory', ChathistorySchema);