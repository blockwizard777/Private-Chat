var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var ContactSchema = new Schema({
  message: {
    type: String
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, "Incorrect email."]
  },
  username :{
    type : String,
  },
  
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Contact', ContactSchema);