var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var InvitedSchema = new Schema({
  roomId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room'
  },
  userId:  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
});

mongoose.model('Invited', InvitedSchema);