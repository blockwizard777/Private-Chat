var app = angular.module('postMediaPage', []);
var count = 0;
var isClickLike = 0;//1:click, 0: none
app.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);
app.controller('postMediaController', function ($scope, $http, $location, fileUpload) {
  $scope.cancel = function () {
    window.history.back();
  }
  $scope.posting = function (cateType, username, userId) {
    if (cateType == 'video') {
      var cateName = $(".category").val();
    }
    else {
      var cateName = $(".category1").val();
    }
    //file upload
    var file = $scope.myFile;
    var uploadUrl = ["/uploads","/uploadMusicFile"];
    var post_data = {
      title: $scope.video_title,
      descriptions: $scope.descriptions,
      categoryType: cateType,
      categoryName: cateName,
      posterName: username,
      posterId: userId,
      isView: 0,
    };
    var mediaName = fileUpload.uploadFileToUrl(file, post_data, isClickLike, uploadUrl);
  }
});

app.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function (file, post_data, isClickLike, uploadUrl) {
    /*var fd = new FormData();
    fd.append(file,file.name);
    $http.post(uploadUrl, fd, {
       transformRequest: angular.identity,
       headers: {
         'Content-Type': 'undefined'
     }
    })
    .success(function(data){*/

    var fd = new FormData();
    if (post_data['categoryType'] =='video')  var file = document.getElementById('inputVideo').files[0];
    else if(post_data['categoryType'] =='music') var file = document.getElementById('inputMusic').files[0];
    console.log(file);
    if (file.type != "video/mp4" && post_data['categoryType'] =='video' ) {
      alert("You must input .mp4 Video File!!!");
      return;
    }
    fd.append('photos[]', file, file.name);
    var xhr = new XMLHttpRequest();
    if(post_data['categoryType'] =='video') xhr.open('POST', uploadUrl[0], true);
    if(post_data['categoryType'] =='music') xhr.open('POST', uploadUrl[1], true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.addEventListener('readystatechange', function (e) {
      if (this.readyState === 4) {
          var res = JSON.parse(e.target.response);
          alert(res.MediaName);
          post_data['mediaUrl'] = res.MediaName;
          var req = {
            method: 'POST',
            url: '/mypage/postMedia',
            data: post_data
          }
          $http(req).success(function (data) {
            window.location.href = window.location.href;
          })
            .error(function () {
              console.log('error');
            });
      }
    });
    xhr.send(fd);
  }
}]);


