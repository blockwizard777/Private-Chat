var app = angular.module('showDetailPage', []);

var isClickLike = 0;
var isFollow = 0;
var posterName = $("#posterName").text();
var username = $("#username").val();
app.controller('showDetailCtrl', function($scope, $http) {

	$scope.seleting = function(type, id){
		if(type == 'like'){
				if($(".liking").css('background-color') == 'rgb(208, 243, 128)'){
                    $(".liking").css('background-color','rgb(255, 255, 255)');
					isClickLike = 0;
                    //update cnt_like to -1
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'like',
									isSelected: isClickLike,
									mediaID: id,
									username: username,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	console.log("success")
						 })
						 .error(function(){
						 	 console.log("error");
						 });
					 
				}
				else{
                    $(".liking").css('background-color','rgb(208, 243, 128)');
				     isClickLike = 1;
                     //update cnt_like to +1
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'like',
									isSelected: isClickLike,
									mediaID: id,
									username: username,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	console.log("success")
						 })
						 .error(function(){
							 console.log("error");
						 });

				}
		}
        else if(type == 'follow'){
            if($(".follow").css('background-color') == 'rgb(208, 243, 128)'){
                    $(".follow").css('background-color','rgb(255, 255, 255)');
					isFollow = 0;
                    //update follow module 
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'follow',
									isSelected: isFollow,
									mediaID: id,
									username: username,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	console.log("success")
						 })
						 .error(function(){
							 console.log("error");
						 });	
				}
				else{
                    $(".follow").css('background-color','rgb(208, 243, 128)');
				     isFollow = 1;
                     //update follow module 
					  var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'follow',
									isSelected: isFollow,
									mediaID: id,
									username: username,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	console.log("success")
						 })
						 .error(function(){
							 console.log("error");
						 });
				}
        }
	}
	$scope.goback = function(){
		window.history.back();
	}
	
});
