var app = angular.module('media', []);

app.controller('mediaCtrl', function($scope, $http) {

	$(":checkbox").bind('click',function(){
        if(!$(this).attr('checked'))    
            $(this).attr('checked', 'checked');
            else 
            $(this).removeAttr('checked');
    });
	$scope.action = function (){
                var arr_ids = new Array();
                var selectType = $("#selectType").val();
                $("tbody input").each(function(){
                    if($(this).attr("checked")){
                        arr_ids.push($(this).val());
                    }
                });
        var req = {
			method: 'POST',
			url: '/media',
			data: {
				isView: selectType,
				arr_ids: arr_ids
			}
		}

		$http(req).success(function(data){
            alert(data);
			if(JSON.parse(data) == "ok")
                window.location.href = window.location.href;
			else
				console.log(data);
			
		})
		.error(function(){
			console.log('error');
		});

	}
});

