var app = angular.module('contactApp', []);

app.controller('contactCtrl', function($scope, $http) {
	$(":checkbox").bind('click',function(){
        if(!$(this).attr('checked'))    
            $(this).attr('checked', 'checked');
        else 
            $(this).removeAttr('checked');
    });

	$scope.deleting = function(){
		var arr_ids = new Array();

		$("tbody input").each(function(){
			if($(this).attr("checked")){
				arr_ids.push($(this).val());
			}
        });

        var req = {
			method: 'POST',
			url: '/delQuestion',
			data: {
				arr_ids: arr_ids
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

