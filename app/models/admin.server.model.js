var mongoose = require('mongoose'),
  crypto = require('crypto'),
  Schema = mongoose.Schema;
var AdminSchema = new Schema({
  firstName:  {
    type: String
  },
  lastName:  {
    type: String
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, "Incorrect email."]
  },
  username: {
    type: String,
    unique: true,
    required: 'Input your username.',
    trim: true
  },
  password: {
    type: String,
    validate: [
      function(password) {
        return password && password.length >= 6;
      }, 'Input your longer passwords than six  characters.'
    ]
  },
  salt: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

AdminSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
  var splitName = fullName.split(' ');
  this.firstName = splitName[0] || '';
  this.lastName = splitName[1] || '';
});

AdminSchema.pre('save', function(next) {
  if (this.password) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }
  next();
});

AdminSchema.methods.hashPassword = function(password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

AdminSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

AdminSchema.statics.findUniqueUsername = function(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
};
AdminSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

mongoose.model('admin', AdminSchema);

// add new admin
var admin   = mongoose.model('admin');
admin.find({'username':'admin'},function(err,users){
    if(users.length == 0)
    {
      var newAdministrator = new admin({
          firstname:'jin',
          lastname:'don',
          email:'donjin@gmail.com',
          username:'admin',
          password:'123456'
        });

        newAdministrator.save(function(error){
          if(!error)
          {
            console.log('User saved!');
          }
        });
    }
});
     
         
    