//var fs = require('fs');

exports.getProfilePath = function(id) {
    return "./public/uploads/profile/" + id;
};
exports.getFaqAttachPath = function(id){
    return "./public/uploads/faqAttach/" + id;
}
exports.getUploadDir = function(id) {
    return "./upload/" + id;
}
exports.getUploadPath = function(id, fileName) {
    return "./upload/" + id + "/" + fileName;
}