var Contact  = require('mongoose').model('Contact');

exports.render = function(req, res) {
	var fullname = req.session.fullname;

	Contact.find({}).exec(function(err, datas){
		res.render('admin/contactView', {datas: datas, fullname:fullname});  
	});
  	
};

exports.del = function(req, res) {
  	var arr_ids = req.body.arr_ids;
    var isOk = 1;
    for(id in arr_ids){
    	
    	Contact.remove({_id : arr_ids[id]} , 
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
    	return res.json('err');
};