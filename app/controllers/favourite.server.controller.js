var Media_Datas  = require('mongoose').model('Media_Datas');
var Account = require('mongoose').model('Account');
exports.top10Render = function(req,res){
    var username = req.session.account.username;
    Media_Datas.find({isView:'1'})
    .populate('posterId','followedUsers')
    .sort('-cnt_like')
    .limit(3)
    .exec(function (err, datas){
    if (!err){
        res.render("top10View",{datas:datas,username:username});
    }
    });
};
exports.lastcreatedRender = function(req,res){
     var username = req.session.account.username;
     Media_Datas.find({isView:'1'})
    .sort('-created')
    .limit(3)
    .populate('posterId','followedUsers')
    .exec(function (err, datas){
    if (!err){
        res.render("lastcreatedView",{datas:datas,username:username});
    }
    });
};
exports.followingRender = function(req,res){
    var username = req.session.account.username;
    Account.findOne({username:username},function(err,user){
        if(!err){
                Account.find().where('username').in(user.followingUsers).exec(function(err,datas){
                   if(!err) {
                        console.log("following");
                        res.render("followingView",{datas:datas});
                   }
                });
        }
    });
};
exports.followedRender = function(req,res){
     var username = req.session.account.username;
    Account.findOne({username:username},function(err,user){
        if(!err){
                Account.find().where('username').in(user.followedUsers).exec(function(err,datas){
                   if(!err) {
                        console.log("followed");
                        res.render("followedView",{datas:datas});
                   }
                });
        }
    });
};
exports.showDetailAccount = function(req,res){
    var username = req.session.account.username;
    var id = req.params.id;
    console.log(id);
    var posterName;
    Account.findById(id).exec(function(err,data){
        if(!err) 
        {
            posterName = data.username;
            Media_Datas.find({posterName:posterName,isView:'1'}).populate('posterId','followedUsers').exec(function(err,datas){
            if(!err){
                console.log("showDetailAccount");
                console.log(datas);
                res.render("showDetailAccount",{datas:datas,username:username});
                     }
         });
        }
    });
    console.log(posterName);
   
};