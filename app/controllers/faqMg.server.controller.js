var Faqs = require('mongoose').model('Faqs');
var fs = require('fs');
var multiparty = require('multiparty');
var globals = require('./global.function');
exports.showfaq = function (req, res) {
  var fullname = req.session.fullname;
  Faqs.find({}).exec(function (err, datas) {
    res.render('admin/faqView', { datas: datas, fullname: fullname });
  });
};

exports.store = function (req, res, next) {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    console.log(files.file);
    var faq = new Faqs();
    faq.question = fields.question[0];
    faq.answer = fields.answer[0];
    var msecs = Date.parse(new Date());
    if (files.file) {
       faq.attachName = faq._id + msecs.toString();
      faq.isAttached = true;
    }
    else faq.isAttached = false;
    //faq.attach = faq._id;
    faq.save(function (error) {
      if (error) return res.json("error");
      if (files.file) {
        var photoPath = globals.getFaqAttachPath(faq.attachName);
        var readerStream = fs.createReadStream(files.file[0].path);
        var writerStream = fs.createWriteStream(photoPath);
        readerStream.pipe(writerStream);
      }
      res.json("success");
    });
  });

};

exports.del = function (req, res) {
  var arr_ids = req.body.arr_ids;
  Faqs.remove().where('_id').in(arr_ids).exec(function (err) {
    if (!err) res.json("ok");
    else res.json("err");
  });
};
exports.getContent = function (req, res) {
  Faqs.find().exec(function (err, datas) {
    return res.json(datas);
  });
}
exports.updateFaq = function (req, res) {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    console.log(files.file);
    var id = fields.id[0];
    Faqs.findById(id).exec(function (err, faq) {
      faq.question = fields.question[0];
      faq.answer = fields.answer[0];
      
      if (files.file) {
        var msecs = Date.parse(new Date());
        faq.attachName = faq._id + msecs.toString();
        if(faq.isAttached == false) faq.isAttached = true;
      }
      console.log(faq);
      faq.save(function (error) {
        if (error) return res.json("error");
        if (files.file) {
          var photoPath = globals.getFaqAttachPath(faq.attachName);
          var readerStream = fs.createReadStream(files.file[0].path);
          var writerStream = fs.createWriteStream(photoPath);
          readerStream.pipe(writerStream);
        }
        res.json("success");
      });
    })

  });

}