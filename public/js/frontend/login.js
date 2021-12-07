var app = angular.module('myApp', []);
app.controller('loginCtrl', function($scope, $http) {
    var home_url = "/home";
    $scope.strError = "";
    //var home_url = "http://localhost:3000";
    $scope.login = function(){
        var req = {
            method:'POST',
            url:'/certLogin',
            data:{
                userName:$scope.userName,
                password:$scope.userPwd
                }
            };
        $http(req).success(function(data){
            if(data == "success")
            {
                $scope.strError = "Welcome to Private Chat.";
                $scope.chkRes = "primary";
                window.setTimeout(function(){
                    window.location.href = home_url;
                }, 1000);
            }
            else if(data == "err_username")
                {
                   $scope.strError = "Invalid Username.";
                   $scope.chkRes = "danger";
                }
            else if(data == "err_require")
                {
                    $scope.strError = "Input username or password.";
                    $scope.chkRes = "danger";                
                }  
            else if(data == "err_pwd")
                {
                    $scope.strError = "Invalid Password.";
                    $scope.chkRes = "danger";
                }
            else if(data == "err_error")
                {
                    $scope.strError = "Error happened.";
                    $scope.chkRes = "danger";
                }
            $scope.$apply();
        })
        .error(function(){
        //     alert("Failed to Login");
            console.log('error');
        //      window.location  = "localhost:3000/";
        });
    }
});