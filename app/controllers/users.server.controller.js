var User   = require('mongoose').model('User');
var fs = require('fs');
var multiparty = require('multiparty');
var globals = require('./global.function');

exports.certLogin = function(req, res,next) {
    
    if (!req.body.userName || !req.body.password)
        return res.end('err_require');

    User.findOne({userName: req.body.userName}, function(error, user) {
        if (error) return res.end('err_error');
        if (!user) return res.end('err_username');
       
        if(User.findUniqueUsername(req.body.password,user.salt) != user.password)
            return res.end('err_pwd');

        //Set Session Data
        req.session.user = user;
        return res.end('success');
    });  

};

exports.inputRegister = function(req, res) {

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var user = new User();
        user.userName = fields.userName [0];
        user.email = fields.email [0];
        user.password = fields.password [0];
        user.save(function(error) {
            if (error)  return res.json("error");

            var photoPath = globals.getProfilePath(user._id);

            var readerStream = fs.createReadStream(files.file[0].path);
            var writerStream = fs.createWriteStream(photoPath);
            readerStream.pipe(writerStream);

            res.json("success");
        });
    });
};


exports.logoutFunc = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};