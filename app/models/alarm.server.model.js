var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var AlarmSchema = new Schema({
  userId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  type: {
    type: Number,
    default: 0,   //0: invited, 1: chathistory, 2: bchathistory
  },
  refId:  {
    type: mongoose.Schema.Types.ObjectId, 
    default: null
  },
  content:  {
    type: String,
    default : ''
  },
  createdTime:  {
    type: Number,
    default : Date.now()
  },
});

mongoose.model('Alarm', AlarmSchema);