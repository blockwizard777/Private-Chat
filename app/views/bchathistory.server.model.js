var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var BchathistorySchema = new Schema({
  roomId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room'
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
    type: Date,
    default : Date.now
  },
});

mongoose.model('Bchathistory', BchathistorySchema);