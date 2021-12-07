var config = require('./config'),
  mongoose = require('mongoose');
module.exports = function() {
  var db = mongoose.connect(config.db);
  require('../app/models/admin.server.model');
  require('../app/models/alarm.server.model');
  require('../app/models/bchathistory.server.model');
  require('../app/models/chathistory.server.model');
  require('../app/models/contact.server.model');
  require('../app/models/faqs.server.model');
  require('../app/models/invited.server.model');
  require('../app/models/room.server.model');
  require('../app/models/users.server.model');
  return db;
};