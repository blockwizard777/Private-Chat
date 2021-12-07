var app = angular.module('myApp', []);
           app.controller('loginCtrl', function($scope, $http) {
           var dashboard_url = "/dashboard";
                $scope.login = function(){
                        var req = {
                            method:'POST',
                            url:'/adminLogin',
                            data:{
                                username:$scope.user_name,
                                password:$scope.user_password
                               }
                            }
                            $http(req).success(function(data){
                                if(data == "success")
                                {
                                    alert("Welcome. You logined successfully.");
                                    window.location.href = dashboard_url;
                                }   
                                else if(data == "err2")
                                {
                                    alert("Username error.");
                                }   
                                else if(data == "err4")
                                {
                                    alert("Input username and password.");
                                }  
                                else if(data == "err3")
                                {
                                    alert("Invalid password");
                                }
                                else if(data == "err1")
                                {
                                    alert("Error corrupted");
                                }
                            }
                            )
                            .error(function(){
                                alert("Failed to Login");
                                console.log('error');
                            });
                        }
                });
      