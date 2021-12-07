  var app = angular.module('myApp', []);
  
  app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
    }]);


app.service('inputRegister', ['$http', function ($http) {
    this.inputInfosToUrl = function(scope){
        var fd = new FormData();

        fd.append("userName", scope.userName);
        fd.append("email", scope.email);
        fd.append("password", scope.userPwd);
        fd.append('file', scope.inputFile);
        $http.post("/inputRegister", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined,'dataType':'application/json'}
        })
    
        .success(function(data){
            if (data == "error")
                scope.strUserNameError = "Your name is duplicated.";
            else if (data == "success") {
                scope.strImgError = "Your membership is created. Please login.";
                scope.chkRes = "primary";
                scope.$apply();
                window.setTimeout(function(){
                    window.location.href = "/login";
                }, 1000);
            }
        })
        .error(function(data){
            alert("Error Code : " + data);
        });
    }
}]);

app.controller('registerCtrl', ['$scope', 'inputRegister', function($scope, inputRegister) {
    var to_url = "/login";

    $scope.inputFile = null;
    $scope.strImgError = '';
    $scope.strUserNameError = '';
    $scope.strEmailError = '';
    $scope.strPwdError = '';
    $scope.strRePwdError = '';

    $("input[type=file]").bind("change", function() {
        $scope.onLoadImage();
    });

    $scope.onLoadImage = function() {
        $scope.inputFile = $("input[type=file]")[0].files[0];
        if ($scope.inputFile == null) {
            $("#img-profile").addClass("hide");
            $("#i-profile").removeClass("hide");
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
                $scope.imgSrc = e.target.result;
                $("#img-profile").removeClass("hide");
                $("#i-profile").addClass("hide");
                $scope.$apply();
        }
        $scope.strImgError = '';

        reader.readAsDataURL($scope.inputFile);
    }

    $scope.register = function()
    {
        if ($scope.inputFile == null) {
            $scope.strImgError = "Select your profile image.";
            $scope.chkRes = "danger";
            return;
        }
        if ($scope.userName == null) {
            $scope.strUserNameError = "Please input your name.";
            return;
        }
        if ($scope.email == null) {
            $scope.strEmailError = "Please input your email.";
            return;
        }
        if ($scope.userPwd == null) {
            $scope.strPwdError = "Please input Password.";
            return;
        }
        if ($scope.userPwd != $scope.userRePwd) {
            $scope.strRePwdError = "Please retype your password.";
            return;
        }
        inputRegister.inputInfosToUrl($scope);
    }
}]);