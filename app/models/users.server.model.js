var mongoose = require('mongoose'),
  crypto = require('crypto'),
  Schema = mongoose.Schema;
var UserSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: 'Input your username.',
    trim: true
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, "Incorrect email."]
  },
  password: {
    type: String,
    validate: [
      function(password) {
        return password && password.length > 5;
      }, 'Input your longer passwords than six  characters.'
    ]
  },
  salt: {
    type: String
  },
  createdTime: {
    type: Number,
    default: Date.now()
  }
});


UserSchema.pre('save', function(next) {
  if (this.password) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }
  next();
});
UserSchema.methods.hashPassword = function(password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

UserSchema.statics.findUniqueUsername = function(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
};

UserSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

mongoose.model('User', UserSchema);