var app = angular.module('faqApp', []);

app.controller('faqCtrl', function ($scope, $http) {
	$scope.faqs = [];
	$http.get("fagMg/getContent")
		.success(function (response) {
			$scope.faqs = response;
		})
		.error(function (response) {
			$scope.editFaq = {};
		});
	$scope.inputFile = null;
	$scope.store = function () {
		console.log($scope.question);
		if ($scope.question && $scope.answer) {
			$scope.inputFile = $("input[type=file]")[0].files[0];
			console.log($scope.inputFile);
			var fd = new FormData();
			fd.append("question", $scope.question);
			fd.append("answer", $scope.answer);
			fd.append("file", $scope.inputFile);
			$http.post("/addFaq", fd, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined, 'dataType': 'application/json' }
			})
				.success(function (data) {
					if (data == 'success')
						window.location.href = window.location.href;
					else
						console.log(data);
				})
				.error(function () {
					console.log('error');
				});
		}
		else {
			if (!$scope.question) {
				$(".question").addClass("has-error");
			}
			else {
				$(".question").removeClass("has-error");
			}
			if (!$scope.answer) {
				$(".answer").addClass("has-error");
			}
			else {
				$(".answer").removeClass("has-error");
			}
		}
	}
	$scope.edit = function (id) {
		var Editid = id;
		$scope.faqs.forEach(function (faq) {
			if (faq._id == Editid) {
				$scope.editFaq = faq;
				console.log($scope.editFaq);
			}
		});
	};
	$scope.deleting = function () {
		var arr_ids = new Array();
		$("tbody input:checked").each(function () {
			arr_ids.push($(this).val());
		});
		var req = {
			method: 'POST',
			url: '/delFaqs',
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
	$("div#edit input[type=file]").bind("change", function () {
		$scope.onLoadImage();
	});

	$scope.onLoadImage = function () {
		$scope.inputFile = $("div#edit input[type=file]")[0].files[0];
		console.log($scope.inputFile);
		if ($scope.inputFile == undefined) {
			return;
		}
		$scope.editFaq.isAttached = true;
		var reader = new FileReader();
		reader.onload = function (e) {
			$(".editImage").attr("src", e.target.result);
			$scope.$apply();
		}
		reader.readAsDataURL($scope.inputFile);
	};
	$scope.updateFaq = function(){
		if ($scope.editFaq.question && $scope.editFaq.answer) {
			$scope.inputFile = $("div#edit input[type=file]")[0].files[0];
			console.log($scope.inputFile);
			var fd = new FormData();
			fd.append("id",$scope.editFaq._id);
			fd.append("question", $scope.editFaq.question);
			fd.append("answer", $scope.editFaq.answer);
			fd.append("file", $scope.inputFile);
			$http.post("/updateFaq", fd, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined, 'dataType': 'application/json' }
			})
				.success(function (data) {
					if (data == 'success')
						window.location.href = window.location.href;
					else
						console.log(data);
				})
				.error(function () {
					console.log('error');
				});
		}
		else {
			if (!$scope.editFaq.question) {
				$(".editQuestion").addClass("has-error");
			}
			else {
				$(".editQuestion").removeClass("has-error");
			}
			if (!$scope.editFaq.answer) {
				$(".editAnswer").addClass("has-error");
			}
			else {
				$(".editAnswer").removeClass("has-error");
			}
		}
	}
});

