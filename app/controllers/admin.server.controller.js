
var admin   = require('mongoose').model('admin');
var User   = require('mongoose').model('User');

exports.dashboard = function(req,res){
    User.find({}).exec(function(err, datas){
		res.render('admin/dashboard', {datas: datas});  
	});
}
exports.adminLogin = function(req, res, next) {
    if (!req.body.username || !req.body.password)
        return res.json('err4');

    admin.findOne({username: req.body.username}, function(error, manager) {
        if (error) return res.json('err1');
        if (!manager) return res.json('err2');

        if(admin.findUniqueUsername(req.body.password,manager.salt) != manager.password) return res.json('err3');
        var fullname = manager.firstname + manager.lastname;

        req.session.administrator = manager;
        req.session.fullname = fullname;
        return res.json('success');
    });
};

exports.adminLogout = function(req,res){
    req.session.destroy();
    res.redirect('/admin');
};

exports.admin = function(req,res){
    res.render('admin/login');
}

exports.store = function(req, res, next) {
	 
    var user = new User(req.body);

    user.save(function(err) {
    	if (err) {
		  	return res.json(err);
		} else {
		  	res.json("ok");
		}
  	});
};

exports.delUsers = function(req, res) {
  	var arr_ids = req.body.arr_ids;
    console.log("arr_ids");
    console.log(arr_ids);
   /* var isOk = 1;
    for(id in arr_ids){
    	
    	User.remove({_id : arr_ids[id]} , 
		    function(err) {
			if (err) {
			  isOk = 0;
			} else {
			  isOk *= parseInt(1);
			}
		});
    }

    if(isOk == 1)
    	return res.json("ok");
    else
    	return res.json('err');*/
    User.remove().where('_id').in(arr_ids).exec(function(err){
        if(!err) res.json("ok");
        else res.json("err");
    });
};