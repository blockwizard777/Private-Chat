var app = angular.module('dashboardApp', []);

app.controller('dashboardCtrl', function ($scope, $http) {
	var arr_ids;
	var isSelected = 0;
	$(":checkbox").bind('click', function () {
		if (!$(this).attr('checked'))
			$(this).attr('checked', 'checked');
		else
			$(this).removeAttr('checked');
	});

	$scope.deleting = function () {
		if (isSelected == 1) {
			var req = {
				method: 'POST',
				url: '/delUsers',
				data: {
					arr_ids: arr_ids
				}
			}

			$http(req).success(function (data) {
				if (data == 'ok')
					window.location.href = window.location.href;
				else
					console.log(data);
			})
				.error(function () {
					console.log('error');
				});
		}
	}
	$scope.check = function () {
		arr_ids = new Array();
		$("tbody input").each(function () {
			if ($(this).attr("checked")) {
				arr_ids.push($(this).val());
			}
		});
		if (arr_ids.length == 0) {
			$scope.content = " NO User Selected!";
			isSelected = 0;
		}
		else {
			$scope.content = "Do you really want to delete users that you selected?";
			isSelected = 1;
		}
		// 
	};
});

