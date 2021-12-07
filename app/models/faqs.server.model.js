var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var FaqSchema = new Schema({
  question: {
    type: String
  },
  answer: {
    type: String
  },
  isAttached: {
    type:Boolean
  },
  attachName: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Faqs', FaqSchema);