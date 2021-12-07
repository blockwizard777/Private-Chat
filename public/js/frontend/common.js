var app = angular.module('commonPage', []);

var isClickLike = 0;
var isFollow = 0;
app.controller('commonCtrl', function($scope, $http) {

	$scope.seleting = function(type, id,posterName){
		if(type == 'like'){
				if($("#media"+id).css('background-color') == 'rgb(208, 243, 128)'){
                    $("#media"+id).css('background-color','rgb(255, 255, 255)');
					isClickLike = 0;
                    //update cnt_like to -1
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'like',
									isSelected: isClickLike,
									mediaID: id,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	{
									console.log("success");
									window.location.href = window.location.href;
								}
						 })
						 .error(function(){
						 	 console.log("error");
						 });
					 
				}
				else{
                    $("#media"+id).css('background-color','rgb(208, 243, 128)');
				     isClickLike = 1;
                     //update cnt_like to +1
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'like',
									isSelected: isClickLike,
									mediaID: id,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	{
									console.log("success");
									window.location.href = window.location.href;
								}
						 })
						 .error(function(){
							 console.log("error");
						 });
				}
		}
        else if(type == 'follow'){
            if($("#mediaF"+id).css('background-color') == 'rgb(208, 243, 128)'){
                    $("#mediaF"+id).css('background-color','rgb(255, 255, 255)');
					isFollow = 0;
                    //update follow module 
					 var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'follow',
									isSelected: isFollow,
									mediaID: id,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	{
									console.log("success");
									window.location.href = window.location.href;
								}
						 })
						 .error(function(){
							 console.log("error");
						 });	
				}
				else{
                    $("#mediaF"+id).css('background-color','rgb(208, 243, 128)');
				     isFollow = 1;
                     //update follow module 
					  var req = {
						 method: 'POST',
						 url: '/update',
							data: {
									type: 'follow',
									isSelected: isFollow,
									mediaID: id,
									posterName: posterName	 
							}
						 }
						 $http(req).success(function(data){
								if(data == 'ok')	{
									console.log("success");
									window.location.href = window.location.href;
								}
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
