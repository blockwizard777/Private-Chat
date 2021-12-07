var app = angular.module('category', []);

app.controller('categoryCtrl', function($scope, $http) {
	
	$scope.addCategory = function(){
		var selectType = $("#selectType").val();
		var req = {
			method: 'POST',
			url: '/categoryMg',
			data: {
				categoryName: $scope.categoryName,
				categoryType: selectType
			}
		}

		$http(req).success(function(data){
			if(JSON.parse(data) == 'ok')
				window.location.href = window.location.href;
			else
				console.log(data);
		})
		.error(function(){
			console.log('error');
		});	
	}

	$scope.delete =function(catename, catetype){
		var req = {
			method: 'POST',
			url: '/categoryMg/del',
			data: {
				categoryName: catename,
				categoryType: catetype
			}
		}

		$http(req).success(function(data){
			if(data == 'ok')
				window.location.href = window.location.href;
			else
				console.log(data);
		})
		.error(function(){
			console.log('error');
		});	
	}
	
});

